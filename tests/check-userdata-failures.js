/**
 * Check the actual userData database for all logs including failures
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const initSqlJs = require('sql.js');

async function checkUserDataLogs() {
  try {
    // Determine userData path
    const home = os.homedir();
    let userDataPath;
    
    if (process.platform === 'win32') {
      userDataPath = path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'guardian-verification-system');
    } else if (process.platform === 'darwin') {
      userDataPath = path.join(home, 'Library', 'Application Support', 'guardian-verification-system');
    } else {
      userDataPath = path.join(home, '.config', 'guardian-verification-system');
    }
    
    const dbPath = path.join(userDataPath, 'guardian-system.db');
    
    console.log('\n=== Checking UserData Database with LEFT JOIN ===\n');
    console.log('Database:', dbPath);
    
    if (!fs.existsSync(dbPath)) {
      console.log('❌ Database not found');
      return;
    }
    
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    
    // Use LEFT JOIN query (same as fixed getVerificationLogs)
    const result = db.exec(`
      SELECT vl.*, 
             s.firstName as studentFirstName, s.lastName as studentLastName,
             g.firstName as guardianFirstName, g.lastName as guardianLastName
      FROM verification_logs vl
      LEFT JOIN students s ON vl.studentId = s.id
      LEFT JOIN guardians g ON vl.guardianId = g.id
      ORDER BY vl.verificationTime DESC
    `);
    
    if (result.length === 0 || result[0].values.length === 0) {
      console.log('No logs found');
      return;
    }
    
    const logs = result[0].values;
    console.log(`Total logs: ${logs.length}\n`);
    
    // Count by status
    const statusCounts = {};
    logs.forEach(log => {
      const status = log[5]; // verificationStatus is column 5
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('Logs by status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    
    // Show failures
    console.log('\n=== Failed Verifications ===\n');
    const failures = logs.filter(log => {
      const status = (log[5] || '').toLowerCase();
      return status === 'failure' || status === 'failed';
    });
    
    if (failures.length === 0) {
      console.log('No failures found');
    } else {
      failures.forEach((log, idx) => {
        console.log(`${idx + 1}. Student: ${log[9]} ${log[10]} | Guardian: ${log[11] || 'NULL'} ${log[12] || ''}`);
        console.log(`   Barcode: ${log[4]} | Status: ${log[5]}`);
        console.log(`   Notes: ${log[8]}`);
        console.log('');
      });
    }
    
    db.close();
    console.log('✅ Query completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserDataLogs();
