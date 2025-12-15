# Feature Documentation

## Overview

The Guardian Verification System is a desktop application designed to streamline the process of registering and verifying student-guardian relationships using barcode technology.

## Core Features

### 1. Guardian Registration

**Purpose**: Register guardians into the system with their contact information and relationship details.

**Location**: Navigation → Register Guardian

**Fields**:
- **Barcode** (Required): Unique identifier
  - Auto-generate using UUID-based prefix (GUA-XXXXXXXX)
  - Or manually enter custom barcode
- **First Name** (Required): Guardian's first name
- **Last Name** (Required): Guardian's last name  
- **Contact Number** (Required): Primary phone number
- **Email** (Optional): Email address for communication
- **Relationship** (Required): 
  - Parent
  - Mother
  - Father
  - Legal Guardian
  - Aunt/Uncle
  - Grandparent
  - Sibling
  - Other

**Process**:
1. Fill in all required fields
2. Click "Generate" to auto-create barcode (optional)
3. Click "Register Guardian" button
4. System confirms successful registration

**Data Stored**:
- Guardian details
- Registration timestamp
- Unique barcode for verification

---

### 2. Student Registration

**Purpose**: Register students and link them to their guardians.

**Location**: Navigation → Register Student

**Fields**:
- **Barcode** (Required): Unique identifier
  - Auto-generate using UUID-based prefix (STU-XXXXXXXX)
  - Or manually enter custom barcode
- **First Name** (Required): Student's first name
- **Last Name** (Required): Student's last name
- **Date of Birth** (Required): Student's DOB for age records
- **Guardian** (Required): Dropdown to select registered guardian
  - Shows: [First Name] [Last Name] - [Barcode]
  - Only available guardians are listed

**Process**:
1. Ensure at least one guardian is registered
2. Fill in student information
3. Select guardian from dropdown
4. Click "Register Student" button
5. System confirms registration

**Data Stored**:
- Student details
- Guardian relationship (foreign key)
- Registration timestamp
- Unique barcode

**Important**: A guardian must be registered before registering students linked to them.

---

### 3. Guardian Verification

**Purpose**: Verify that a guardian attempting to collect a student is the correct registered guardian.

**Location**: Navigation → Verify Guardian

**Process**:

**Step 1: Scan Student Barcode**
- Click "📷 Start Scanning Student"
- Use camera to scan student's barcode/QR code
- Or manually enter barcode when prompted
- System displays student information if found

**Step 2: Scan Guardian Barcode**
- Click "📷 Start Scanning Guardian"
- Use camera to scan guardian's barcode/QR code
- Or manually enter barcode when prompted
- System captures guardian barcode

**Step 3: Verify**
- Click "✓ Verify Guardian" button
- System compares scanned guardian with registered guardian

**Verification Results**:

✅ **SUCCESS**:
- Guardian barcode matches student's registered guardian
- Green status badge
- Shows guardian details
- Logged as successful verification

❌ **FAILED**:
- Guardian barcode does NOT match student's registered guardian
- Red status badge
- Shows mismatch alert
- Logged as failed verification (for security purposes)

**Verification Log Entry Created**:
- Student ID & Barcode
- Guardian ID & Barcode
- Verification Status (SUCCESS/FAILED)
- Timestamp of verification attempt

---

### 4. Admin Dashboard

**Purpose**: Get an overview of all registered students and guardians.

**Location**: Navigation → Dashboard

**Features**:

**Statistics Cards**:
- Total Students: Count of all registered students
- Total Guardians: Count of all registered guardians
- Registration Rate: Percentage of students per guardian
- Registration Status: Overall system health

**Students Table**:
- Displays last 10 registered students
- Columns:
  - Barcode (with code formatting)
  - Name (First Last)
  - Date of Birth
  - Associated Guardian
  - Registration Date
- Sorted by most recent first

**Guardians Table**:
- Displays last 10 registered guardians
- Columns:
  - Barcode (with code formatting)
  - Name (First Last)
  - Contact Number
  - Relationship Type
  - Registration Date
- Sorted by most recent first

**Actions**:
- **🖨️ Print Report**: Generate comprehensive PDF report
- **↻ Refresh Data**: Reload data from database

**Print Report Contents**:
- Generation timestamp
- Summary statistics
- Complete student list with details
- Complete guardian list with details
- Professional formatting for printing

---

### 5. Verification Logs

**Purpose**: Track all verification attempts for audit and security purposes.

**Location**: Navigation → Logs

**Statistics**:
- **Total Verifications**: All verification attempts
- **Successful**: Count of matched verifications
- **Failed**: Count of mismatched verifications
- **Success Rate**: Percentage of successful verifications

**Log Display**:

**Filters**:
- All: Show all verification records
- Success: Show only successful verifications
- Failed: Show only failed verification attempts

**Log Table Columns**:
- Date & Time: Exact timestamp of verification
- Student: Student name and barcode
- Guardian: Guardian name and barcode
- Status: SUCCESS (green) or FAILED (red) badge

**Features**:
- Color-coded rows (green for success, pink for failed)
- Sortable by timestamp
- Comprehensive audit trail

**Print Function**:
- **🖨️ Print Report**: Generate verification audit report
- Includes:
  - Summary statistics
  - All filtered log entries
  - Success/failure breakdown
  - Professional formatting
  - Timestamp of report generation

**Uses**:
- Security audits
- Attendance tracking
- Dispute resolution
- System monitoring

---

## Technical Features

### Barcode System

**Barcode Generation**:
- Uses UUID v4 with shortened prefix
- Guardian format: `GUA-XXXXXXXX` (e.g., GUA-A1B2C3D4)
- Student format: `STU-XXXXXXXX` (e.g., STU-E5F6G7H8)
- Manually enter custom barcodes if preferred

**Barcode Scanning**:
- Supports QR codes and barcodes
- Real-time camera scanning with html5-qrcode
- Fallback to manual entry
- Automatic barcode detection and parsing

### Database

**Tables**:
1. **Students**
   - ID, Barcode, First/Last Name, DOB
   - Guardian Foreign Key
   - Registration Timestamp

2. **Guardians**
   - ID, Barcode, First/Last Name
   - Contact Number, Email, Relationship
   - Registration Timestamp

3. **Verification Logs**
   - ID, Student/Guardian IDs
   - Barcodes, Status
   - Verification Timestamp

**Data Persistence**:
- SQLite database (sql.js)
- Stored in user app data directory
- Automatic saving after each operation
- Full data integrity maintained

### Security

- Context isolation in Electron
- IPC preload for safe communication
- No direct node integration in UI
- Database validation
- Error handling and logging

### Reporting

**Report Generation**:
- HTML-based reports
- Print-friendly formatting
- Automatic pagination
- Timestamp inclusion
- Professional styling

**Report Types**:
1. Student/Guardian Summary (Dashboard)
2. Verification Audit Trail (Logs)
3. Statistics and analytics

---

## Workflow Examples

### Scenario 1: New Enrollment

1. **Admin registers guardian**
   - Goes to Register Guardian
   - Enters John Smith, phone 555-0123
   - System generates barcode: GUA-A1B2C3D4

2. **Admin registers student**
   - Goes to Register Student
   - Enters Michael Smith (DOB: 2015-01-15)
   - Selects "John Smith - GUA-A1B2C3D4" as guardian
   - System generates barcode: STU-E5F6G7H8

3. **Guard verifies pickup**
   - Goes to Verify Guardian
   - Scans student barcode (STU-E5F6G7H8)
   - Shows "Michael Smith" with guardian "John Smith"
   - Scans guardian barcode (GUA-A1B2C3D4)
   - ✅ Verification SUCCESS
   - Guardian can take student

### Scenario 2: Fraud Prevention

1. **Different person tries to pick up student**
   - Guard scans student barcode (STU-E5F6G7H8)
   - Shows correct student and guardian
   - Scans wrong guardian barcode (GUA-X9Y8Z7W6)
   - ❌ Verification FAILED
   - Alert shown: "Guardian does not match"
   - Logged for security review
   - Student NOT released

### Scenario 3: End of Day Reporting

1. **Admin checks dashboard**
   - Views statistics: 45 students, 32 guardians
   - Sees recent registrations
   - Clicks "Print Report"
   - Gets comprehensive enrollment summary

2. **Admin audits verification logs**
   - Checks Logs page
   - Filters by "Failed" verifications
   - Sees 3 failed attempts from today
   - Investigates each case
   - Prints audit report for records

---

## Data Validation

**Input Validation**:
- All required fields must be filled
- Email format validation (if provided)
- Phone number accepted in multiple formats
- Barcode uniqueness enforced
- Date validation for student DOB

**Error Messages**:
- Clear, user-friendly messages
- Specific field error indication
- Guidance on resolution

**Database Constraints**:
- Foreign key relationships
- Unique barcode constraints
- Cascade operations prevented
- Data integrity maintained

---

## Accessibility Features

- Large, clear font
- High contrast colors
- Intuitive navigation
- Keyboard shortcuts (Ctrl+Q to exit)
- Screen reader compatible HTML
- Clear status indicators

---

## Future Enhancement Ideas

- Multi-location support
- Staff assignment to students
- Advanced search and filtering
- CSV/Excel export
- SMS/Email notifications
- Photo capture for additional verification
- Check-in/check-out timing
- Reporting analytics dashboard
- User authentication and roles
- Backup and restore functionality

---

**Document Version**: 1.0.0  
**Last Updated**: December 2025
