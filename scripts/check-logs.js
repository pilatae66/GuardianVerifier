/**
 * Script to check verification logs in the userData database
 * Run with: node scripts/check-logs.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const initSqlJs = require('sql.js');

async function checkLogs() {
  try {
    // Determine userData path (same logic as database.js)
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
    
    console.log('\n=== Checking Verification Logs ===\n');
    console.log('Database location:', dbPath);
    
    if (!fs.existsSync(dbPath)) {
      console.log('\n❌ Database file does not exist!');
      console.log('The app may not have been run yet, or data is stored elsewhere.');
      return;
    }
    
    console.log('✓ Database file exists\n');
    
    // Load database
    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);
    
    // Get total counts
    const studentsCount = db.exec('SELECT COUNT(*) as count FROM students')[0]?.values[0][0] || 0;
    const guardiansCount = db.exec('SELECT COUNT(*) as count FROM guardians')[0]?.values[0][0] || 0;
    const logsCount = db.exec('SELECT COUNT(*) as count FROM verification_logs')[0]?.values[0][0] || 0;
    
    console.log('Database Statistics:');
    console.log('  Students:', studentsCount);
    console.log('  Guardians:', guardiansCount);
    console.log('  Verification Logs:', logsCount);
    console.log('');
    
    if (logsCount === 0) {
      console.log('⚠️  No verification logs found in the database.');
      console.log('   This could mean:');
      console.log('   - No verifications have been attempted yet');
      console.log('   - Logs are not being saved properly');
      console.log('   - You\'re checking the wrong database file');
      return;
    }
    
    // Get recent logs
    const logsResult = db.exec(`
      SELECT 
        vl.id,
        vl.studentId,
        vl.guardianId,
        vl.studentBarcode,
        vl.guardianBarcode,
        vl.verificationStatus,
        vl.distance,
        vl.verificationTime,
        vl.notes
      FROM verification_logs vl
      ORDER BY vl.verificationTime DESC
      LIMIT 10
    `);
    
    if (logsResult.length === 0 || logsResult[0].values.length === 0) {
      console.log('No logs to display.');
      return;
    }
    
    console.log('Recent Verification Logs (last 10):');
    console.log('─'.repeat(120));
    
    const logs = logsResult[0];
    const columns = logs.columns;
    const rows = logs.values;
    
    rows.forEach((row, idx) => {
      console.log(`\n${idx + 1}. Log ID: ${row[0]}`);
      console.log(`   Student ID: ${row[1]} | Guardian ID: ${row[2]}`);
      console.log(`   Student Barcode: ${row[3] || 'N/A'} | Guardian Barcode: ${row[4] || 'N/A'}`);
      const distance = row[6] !== null && row[6] !== undefined ? 
        (typeof row[6] === 'number' ? row[6].toFixed(4) : parseFloat(row[6]).toFixed(4)) : 
        'N/A';
      console.log(`   Status: ${row[5]} | Distance: ${distance}`);
      console.log(`   Time: ${row[7]}`);
      console.log(`   Notes: ${row[8] || 'N/A'}`);
    });
    
    console.log('\n' + '─'.repeat(120));
    
    // Summary by status
    const statusResult = db.exec(`
      SELECT verificationStatus, COUNT(*) as count
      FROM verification_logs
      GROUP BY verificationStatus
    `);
    
    if (statusResult.length > 0 && statusResult[0].values.length > 0) {
      console.log('\nLog Summary by Status:');
      statusResult[0].values.forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }
    
    db.close();
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ Error checking logs:', error.message);
    console.error(error);
  }
}

checkLogs();
