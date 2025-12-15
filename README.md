# Guardian Verification System

A desktop application built with Electron and React for verifying student guardians using barcode scanning technology.

## Features

✨ **Core Features:**
- 📱 **Barcode Scanning**: Real-time QR/barcode scanning for students and guardians
- 👥 **Student Registration**: Register students and link them to guardians
- 🛡️ **Guardian Registration**: Register guardians with contact information
- ✓ **Guardian Verification**: Verify if scanned guardian matches the registered guardian
- 📊 **Admin Dashboard**: View and manage all students and guardians
- 📋 **Verification Logs**: Track all verification attempts with success/failure status
- 🖨️ **Report Generation**: Print detailed reports of students, guardians, and verification logs

## Technology Stack

- **Frontend**: React 18.2.0
- **Desktop Framework**: Electron 27.0.0
- **Database**: SQLite3 (better-sqlite3)
- **Barcode Scanning**: html5-qrcode
- **Styling**: CSS3
- **Routing**: React Router 6.8.0

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd d:\laragon\www\GuardianVerfierSystem
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

   This will:
   - Start the React development server on http://localhost:3000
   - Launch the Electron app with hot-reload enabled

## Usage

### Admin - Register Guardian

1. Navigate to **Register Guardian** page
2. Enter guardian details:
   - Generate or enter a barcode (e.g., `GUA-ABC12345`)
   - First and last name
   - Contact number
   - Email (optional)
   - Relationship type
3. Click **Register Guardian**

### Admin - Register Student

1. Navigate to **Register Student** page
2. Enter student details:
   - Generate or enter a barcode (e.g., `STU-XYZ67890`)
   - First and last name
   - Date of birth
   - Select a guardian from the dropdown
3. Click **Register Student**

### Guard - Verify Guardian

1. Navigate to **Verify Guardian** page
2. **Step 1**: Click "Start Scanning Student" and scan the student's barcode
3. **Step 2**: Click "Start Scanning Guardian" and scan the guardian's barcode
4. Click **Verify Guardian** to confirm the relationship
5. View the verification result:
   - ✓ Success: Guardian matches the student's registered guardian
   - ✗ Failed: Guardian does not match the student's record

### Admin - View Dashboard

- **Dashboard**: See overview of all students and guardians
- **View Statistics**: Total registrations and success rates
- **Print Reports**: Generate and print summary reports

### View Verification Logs

1. Navigate to **Logs** page
2. Filter by:
   - All verifications
   - Successful verifications
   - Failed verifications
3. View detailed logs with timestamps
4. Print verification reports

## Project Structure

```
GuardianVerfierSystem/
├── public/
│   ├── index.html
│   ├── electron.js          # Main Electron process
│   └── preload.js           # IPC bridge
├── src/
│   ├── components/
│   │   ├── Navigation.js
│   │   └── Navigation.css
│   ├── pages/
│   │   ├── AdminDashboard.js
│   │   ├── GuardVerification.js
│   │   ├── StudentRegistration.js
│   │   ├── GuardianRegistration.js
│   │   ├── VerificationLogs.js
│   │   └── [page-names].css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── database.js              # SQLite database management
├── package.json
└── README.md
```

## Database Schema

### Students Table
```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth DATE NOT NULL,
  guardianId INTEGER NOT NULL,
  registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guardianId) REFERENCES guardians(id)
)
```

### Guardians Table
```sql
CREATE TABLE guardians (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barcode TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  contactNumber TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  registrationDate DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Verification Logs Table
```sql
CREATE TABLE verification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  guardianId INTEGER NOT NULL,
  studentBarcode TEXT NOT NULL,
  guardianBarcode TEXT NOT NULL,
  verificationStatus TEXT,
  verificationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (guardianId) REFERENCES guardians(id)
)
```

## Building for Production

### Build the React app
```bash
npm run build
```

### Build the Electron app
```bash
npm run electron-build
```

This will create an executable installer in the `dist/` directory.

## Available Scripts

- `npm start` - Start development with React and Electron
- `npm run react-start` - Start only React dev server
- `npm run electron-start` - Start only Electron
- `npm run build` - Build React app for production
- `npm run electron-build` - Build complete Electron application
- `npm test` - Run tests (if configured)

## Features in Detail

### 🔐 Security
- Context isolation in Electron
- No direct node integration in renderer
- Preload script for safe IPC communication
- Database validation and error handling

### 📱 Barcode Scanning
- Real-time QR code detection
- HTML5-based scanning (works with any camera)
- Auto-generated unique barcodes
- Manual barcode entry support

### 📊 Reporting
- Print-friendly HTML reports
- Detailed verification logs with timestamps
- Statistical summaries
- Success rate calculations

### 💾 Data Management
- SQLite database for persistent storage
- Automatic data backup (stored in app user data directory)
- FOREIGN KEY constraints for data integrity
- Transaction support for reliability

## Troubleshooting

### Camera not working for barcode scan
- Ensure browser/app has camera permissions
- Check if camera device is properly connected
- Try refreshing the page

### Database errors
- Database file is located in: `%APPDATA%/Guardian Verification System/guardian-system.db`
- Delete database file to reset (all data will be lost)
- Check disk space availability

### Electron app not starting
- Delete `node_modules` and run `npm install` again
- Check Node.js version compatibility
- Review console output for detailed error messages

## Development Tips

1. **Hot Reload**: Changes to React code automatically reload in the app
2. **DevTools**: F12 or Ctrl+Shift+I to open developer console
3. **Database**: Clear and rebuild data using the admin panel
4. **Testing**: Use the verification logs to track all operations

## Future Enhancements

- [ ] Multi-language support
- [ ] Export to CSV/Excel
- [ ] SMS/Email notifications
- [ ] Advanced search and filters
- [ ] User authentication
- [ ] Backup and restore functionality
- [ ] Statistical analytics
- [ ] Mobile app support

## License

MIT License - Feel free to use this project for your needs

## Support

For issues or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2025
