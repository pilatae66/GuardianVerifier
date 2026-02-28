const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const initSqlJs = require('sql.js');

class GuardianDatabase {
  constructor() {
    this.dbPath = path.join(app.getPath('userData'), 'guardian-system.db');
    this.db = null;
    this.SQL = null;
  }

  async initialize() {
    try {
      this.SQL = await initSqlJs();
      
      // Load existing database or create new one
      if (fs.existsSync(this.dbPath)) {
        const buffer = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(buffer);
      } else {
        this.db = new this.SQL.Database();
      }

      // Create tables
      this.db.run(`
        CREATE TABLE IF NOT EXISTS students (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          barcode TEXT UNIQUE NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          dateOfBirth DATE NOT NULL,
          guardianId INTEGER NOT NULL,
          photo TEXT,
          faceDescriptor TEXT,
          registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS guardians (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          barcode TEXT UNIQUE NOT NULL,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          contactNumber TEXT NOT NULL,
          email TEXT,
          relationship TEXT,
          photo TEXT,
          faceDescriptor TEXT,
          registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS verification_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          studentId INTEGER NOT NULL,
          guardianId INTEGER NOT NULL,
          studentBarcode TEXT NOT NULL,
          guardianBarcode TEXT NOT NULL,
          verificationStatus TEXT,
          distance REAL,
          verificationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
        )
      `);

      // Apply schema migrations for existing databases
      this.applyMigrations();

      this.save();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  applyMigrations() {
    try {
      // Add photo and faceDescriptor columns to students if they don't exist
      try {
        this.db.run('ALTER TABLE students ADD COLUMN photo TEXT');
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        this.db.run('ALTER TABLE students ADD COLUMN faceDescriptor TEXT');
      } catch (e) {
        // Column already exists, ignore
      }

      // Add photo and faceDescriptor columns to guardians if they don't exist
      try {
        this.db.run('ALTER TABLE guardians ADD COLUMN photo TEXT');
      } catch (e) {
        // Column already exists, ignore
      }
      try {
        this.db.run('ALTER TABLE guardians ADD COLUMN faceDescriptor TEXT');
      } catch (e) {
        // Column already exists, ignore
      }

      // Add distance column to verification_logs if it doesn't exist
      try {
        this.db.run('ALTER TABLE verification_logs ADD COLUMN distance REAL');
      } catch (e) {
        // Column already exists, ignore
      }
    } catch (error) {
      console.warn('Migration warning (non-critical):', error.message);
    }
  }

  save() {
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.dbPath, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  registerStudent(data) {
    try {
      const { barcode, firstName, lastName, dateOfBirth, guardianId, photo = null, faceDescriptor = null } = data;
      this.db.run(
        `INSERT INTO students (barcode, firstName, lastName, dateOfBirth, guardianId, photo, faceDescriptor)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [barcode, firstName, lastName, dateOfBirth, guardianId, photo, faceDescriptor]
      );
      this.save();
      return { changes: 1 };
    } catch (error) {
      throw error;
    }
  }

  registerGuardian(data) {
    try {
      const { barcode, firstName, lastName, contactNumber, email, relationship, photo = null, faceDescriptor = null } = data;
      this.db.run(
        `INSERT INTO guardians (barcode, firstName, lastName, contactNumber, email, relationship, photo, faceDescriptor)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [barcode, firstName, lastName, contactNumber, email, relationship, photo, faceDescriptor]
      );
      this.save();
      return { changes: 1 };
    } catch (error) {
      throw error;
    }
  }

  getStudents() {
    try {
      const stmt = this.db.prepare(`
        SELECT s.*, g.firstName as guardianFirstName, g.lastName as guardianLastName, g.barcode as guardianBarcode
        FROM students s
        JOIN guardians g ON s.guardianId = g.id
        ORDER BY s.registrationDate DESC
      `);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      return [];
    }
  }

  getGuardians() {
    try {
      const stmt = this.db.prepare('SELECT * FROM guardians ORDER BY registrationDate DESC');
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      return [];
    }
  }

  getStudentByBarcode(barcode) {
    try {
      const stmt = this.db.prepare(`
        SELECT s.*, g.firstName as guardianFirstName, g.lastName as guardianLastName, 
               g.barcode as guardianBarcode, g.id as guardianId, g.contactNumber as guardianContact
        FROM students s
        JOIN guardians g ON s.guardianId = g.id
        WHERE s.barcode = ?
      `);
      stmt.bind([barcode]);
      let result = null;
      if (stmt.step()) {
        result = stmt.getAsObject();
      }
      stmt.free();
      return result;
    } catch (error) {
      return null;
    }
  }

  verifyGuardian(studentId, guardianBarcode) {
    try {
      // Get student info
      const stmtStudent = this.db.prepare('SELECT * FROM students WHERE id = ?');
      stmtStudent.bind([studentId]);
      let student = null;
      if (stmtStudent.step()) {
        student = stmtStudent.getAsObject();
      }
      stmtStudent.free();
      
      if (!student) {
        throw new Error('Student not found');
      }

      // Get guardian info by barcode
      const stmtGuardian = this.db.prepare('SELECT * FROM guardians WHERE barcode = ?');
      stmtGuardian.bind([guardianBarcode]);
      let guardian = null;
      if (stmtGuardian.step()) {
        guardian = stmtGuardian.getAsObject();
      }
      stmtGuardian.free();
      
      if (!guardian) {
        throw new Error('Guardian barcode not found in system');
      }

      // Verify if the guardian matches the student's registered guardian
      const isMatch = student.guardianId === guardian.id;

      // Log the verification attempt
      this.db.run(
        `INSERT INTO verification_logs (studentId, guardianId, studentBarcode, guardianBarcode, verificationStatus)
         VALUES (?, ?, ?, ?, ?)`,
        [studentId, guardian.id, student.barcode, guardianBarcode, isMatch ? 'SUCCESS' : 'FAILED']
      );
      this.save();

      return {
        isMatch,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          barcode: student.barcode,
        },
        guardian: {
          id: guardian.id,
          firstName: guardian.firstName,
          lastName: guardian.lastName,
          barcode: guardian.barcode,
          contactNumber: guardian.contactNumber,
        },
        message: isMatch ? 'Guardian verified successfully' : 'Guardian does not match student record',
      };
    } catch (error) {
      throw error;
    }
  }

  getVerificationLogs() {
    try {
      const stmt = this.db.prepare(`
        SELECT vl.*, 
               s.firstName as studentFirstName, s.lastName as studentLastName,
               g.firstName as guardianFirstName, g.lastName as guardianLastName
        FROM verification_logs vl
        JOIN students s ON vl.studentId = s.id
        JOIN guardians g ON vl.guardianId = g.id
        ORDER BY vl.verificationTime DESC
      `);
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      return results;
    } catch (error) {
      return [];
    }
  }

  // Helper method: Calculate L2 Euclidean distance between two descriptors
  calculateDescriptorDistance(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2) return null;
    
    let desc1, desc2;
    
    // Parse if stored as JSON string
    try {
      desc1 = Array.isArray(descriptor1) ? descriptor1 : JSON.parse(descriptor1);
      desc2 = Array.isArray(descriptor2) ? descriptor2 : JSON.parse(descriptor2);
    } catch (e) {
      return null;
    }

    if (!Array.isArray(desc1) || !Array.isArray(desc2)) return null;
    if (desc1.length !== desc2.length) return null;

    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      const diff = desc1[i] - desc2[i];
      sum += diff * diff;
    }
    return Math.sqrt(sum);
  }

  // Face-based student identification: Find best matching student by face descriptor
  findStudentByFace(capturedDescriptor, threshold = 0.6) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM students WHERE faceDescriptor IS NOT NULL
      `);
      
      let bestMatch = null;
      let bestDistance = Infinity;

      while (stmt.step()) {
        const student = stmt.getAsObject();
        const distance = this.calculateDescriptorDistance(capturedDescriptor, student.faceDescriptor);
        
        if (distance !== null && distance < bestDistance) {
          bestDistance = distance;
          bestMatch = student;
        }
      }
      stmt.free();

      // Return best match if within threshold
      if (bestMatch && bestDistance <= threshold) {
        return {
          success: true,
          student: {
            id: bestMatch.id,
            firstName: bestMatch.firstName,
            lastName: bestMatch.lastName,
            barcode: bestMatch.barcode,
            dateOfBirth: bestMatch.dateOfBirth,
            photo: bestMatch.photo,
          },
          distance: bestDistance,
          message: `Student identified: ${bestMatch.firstName} ${bestMatch.lastName}`,
        };
      }

      return {
        success: false,
        student: null,
        distance: bestDistance,
        message: 'No matching student found. Please try again or use manual lookup.',
      };
    } catch (error) {
      throw error;
    }
  }

  // Face-based guardian verification: Compare captured guardian face with stored guardian descriptor
  verifyGuardianByFace(studentId, capturedGuardianDescriptor, threshold = 0.6) {
    try {
      // Get student to find assigned guardian
      const studentStmt = this.db.prepare('SELECT * FROM students WHERE id = ?');
      studentStmt.bind([studentId]);
      
      if (!studentStmt.step()) {
        studentStmt.free();
        return {
          success: false,
          verified: false,
          message: 'Student not found.',
          distance: null,
        };
      }
      
      const student = studentStmt.getAsObject();
      studentStmt.free();

      // Get guardian record
      const guardianStmt = this.db.prepare('SELECT * FROM guardians WHERE id = ?');
      guardianStmt.bind([student.guardianId]);
      
      if (!guardianStmt.step()) {
        guardianStmt.free();
        return {
          success: false,
          verified: false,
          message: 'Guardian record not found.',
          distance: null,
        };
      }
      
      const guardian = guardianStmt.getAsObject();
      guardianStmt.free();

      // Compare face descriptors
      const distance = this.calculateDescriptorDistance(capturedGuardianDescriptor, guardian.faceDescriptor);

      if (distance === null) {
        return {
          success: false,
          verified: false,
          message: 'Unable to compute face match. Please try again.',
          distance: null,
        };
      }

      const verified = distance <= threshold;

      // Log verification attempt (required by FR-005, SC-004)
      this.db.run(
        `INSERT INTO verification_logs 
         (studentId, guardianId, studentBarcode, guardianBarcode, verificationStatus, distance, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          student.guardianId,
          student.barcode,
          guardian.barcode,
          verified ? 'success' : 'failure',
          distance,
          `Face verification (threshold: ${threshold}, distance: ${distance.toFixed(4)})`,
        ]
      );
      this.save();

      return {
        success: true,
        verified,
        distance,
        message: verified 
          ? `Guardian verified successfully for ${student.firstName} ${student.lastName}`
          : `Guardian verification failed. Face does not match for ${student.firstName} ${student.lastName}`,
      };
    } catch (error) {
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = GuardianDatabase;
