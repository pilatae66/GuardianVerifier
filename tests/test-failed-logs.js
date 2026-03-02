/**
 * Test that getVerificationLogs returns failed verifications
 */

const Database = require('../database.js');

async function testGetLogs() {
  try {
    const db = new Database({ userDataPath: '.' });
    await db.initialize();
    
    console.log('\n=== Testing getVerificationLogs ===\n');
    
    // Clear existing data
    db.db.run('DELETE FROM verification_logs');
    db.db.run('DELETE FROM students');
    db.db.run('DELETE FROM guardians');
    
    // Create test data
    db.db.run("INSERT INTO students (id,barcode,firstName,lastName,dateOfBirth,guardianId) VALUES (1,'S1','John','Doe','2010-01-01',1)");
    db.db.run("INSERT INTO guardians (id,barcode,firstName,lastName,contactNumber) VALUES (1,'G1','Jane','Doe','555-1234')");
    
    // Insert successful verification
    db.db.run(
      `INSERT INTO verification_logs (studentId, guardianId, studentBarcode, guardianBarcode, verificationStatus, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 1, 'S1', 'G1', 'success', 'Test success']
    );
    
    // Insert failed verification with null guardianId (e.g., unknown barcode)
    db.db.run(
      `INSERT INTO verification_logs (studentId, guardianId, studentBarcode, guardianBarcode, verificationStatus, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, null, 'S1', 'UNKNOWN', 'failure', 'Guardian barcode not found']
    );
    
    // Insert failed verification with guardian mismatch
    db.db.run("INSERT INTO guardians (id,barcode,firstName,lastName,contactNumber) VALUES (2,'G2','Wrong','Person','555-9999')");
    db.db.run(
      `INSERT INTO verification_logs (studentId, guardianId, studentBarcode, guardianBarcode, verificationStatus, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 2, 'S1', 'G2', 'failure', 'Guardian does not match']
    );
    
    db.save();
    
    // Test getVerificationLogs
    const logs = db.getVerificationLogs();
    
    console.log('Total logs retrieved:', logs.length);
    console.log('Expected: 3 logs (1 success + 2 failures)\n');
    
    if (logs.length !== 3) {
      console.log('❌ FAILED: Expected 3 logs but got', logs.length);
      console.log('This means failed verifications are still being filtered out!');
      return;
    }
    
    console.log('✓ All logs retrieved successfully\n');
    
    // Check each log
    logs.forEach((log, idx) => {
      console.log(`Log ${idx + 1}:`);
      console.log(`  Student: ${log.studentFirstName} ${log.studentLastName} (${log.studentBarcode})`);
      console.log(`  Guardian: ${log.guardianFirstName || 'NULL'} ${log.guardianLastName || ''} (${log.guardianBarcode})`);
      console.log(`  Status: ${log.verificationStatus}`);
      console.log(`  Notes: ${log.notes}`);
      console.log('');
    });
    
    const successCount = logs.filter(l => l.verificationStatus === 'success').length;
    const failureCount = logs.filter(l => l.verificationStatus === 'failure').length;
    
    console.log('Summary:');
    console.log(`  Success: ${successCount}`);
    console.log(`  Failure: ${failureCount}`);
    
    if (successCount === 1 && failureCount === 2) {
      console.log('\n✅ TEST PASSED: Failed verifications are now visible!');
    } else {
      console.log(`\n❌ TEST FAILED: Expected 1 success and 2 failures, got ${successCount} success and ${failureCount} failures`);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error);
  }
}

testGetLogs();
