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
          verificationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT
        )
      `);

      this.save();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
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
      const { barcode, firstName, lastName, dateOfBirth, guardianId } = data;
      this.db.run(
        `INSERT INTO students (barcode, firstName, lastName, dateOfBirth, guardianId)
         VALUES (?, ?, ?, ?, ?)`,
        [barcode, firstName, lastName, dateOfBirth, guardianId]
      );
      this.save();
      return { changes: 1 };
    } catch (error) {
      throw error;
    }
  }

  registerGuardian(data) {
    try {
      const { barcode, firstName, lastName, contactNumber, email, relationship } = data;
      this.db.run(
        `INSERT INTO guardians (barcode, firstName, lastName, contactNumber, email, relationship)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [barcode, firstName, lastName, contactNumber, email, relationship]
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

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = GuardianDatabase;
