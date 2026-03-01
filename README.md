# Guardian Verification System

A desktop application built with Electron and React for verifying student guardians using barcode scanning technology.

## Features

✨ **Core Features:**
- 📱 **Barcode Scanning**: Real-time QR/barcode scanning for students and guardians
- � **Face Recognition**: Offline face identification and verification using face descriptors
- 👥 **Student Registration**: Register students with photo and optional face enrollment
- 🛡️ **Guardian Registration**: Register guardians with contact information and face enrollment
- ✓ **Dual-Mode Verification**: Verify guardians using face scan (primary) or barcode (fallback)
- 📊 **Admin Dashboard**: View and manage all students and guardians
- 📋 **Verification Logs**: Track all verification attempts with success/failure status and match distance
- 🖨️ **Report Generation**: Print detailed reports of students, guardians, and verification logs

## Technology Stack

- **Frontend**: React 18.2.0
- **Desktop Framework**: Electron 27.0.0
- **Database**: SQLite3 (better-sqlite3)
- **Face Recognition**: @vladmandic/face-api (offline, JavaScript-only; pinned to ^1.7.15) – uses WebGL/CPU backend to avoid WebAssembly MIME issues in the Electron/React environment

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
2. Select verification method:
   - **📷 Capture Face**: Use camera to scan guardian's face (recommended) OR
   - **📤 Upload Photo**: Upload a photo and face will be auto-detected
3. Enter guardian details:
   - Generate or enter a barcode (e.g., `GUA-ABC12345`)
   - First and last name
   - Contact number
   - Email (optional)
   - Relationship type
4. Click **Register Guardian**
5. Confirmation shows face recognition enrollment status

### Admin - Register Student

1. Navigate to **Register Student** page
2. Select verification method:
   - **📷 Capture Face**: Use camera to scan student's face (recommended) OR
   - **📤 Upload Photo**: Upload a photo and face will be auto-detected
3. Enter student details:
   - Generate or enter a barcode (e.g., `STU-XYZ67890`)
   - First and last name
   - Date of birth
   - Select a guardian from the dropdown
4. Click **Register Student**
5. Confirmation shows face recognition enrollment status

### Guard - Verify Guardian

1. Navigate to **Verify Guardian** page
2. **Step 1 - Identify Student**:
   - Select **📷 Capture Face** (primary): Scan student's face with camera, OR
   - Select **📤 Barcode** (fallback): Scan student's barcode
3. **Step 2 - Verify Guardian**:
   - Select **📷 Capture Face** (primary): Scan guardian's face with camera, OR
   - Select **📤 Barcode** (fallback): Scan guardian's barcode
4. View verification result:
   - ✓ **Face Match**: Guardian's face matches the registered guardian (shows match distance)
   - ✓ **Barcode Match**: Guardian's barcode matches the registered guardian
   - ✗ **No Match**: Guardian does not match the student's record
5. Verification attempt logged automatically with match distance metrics

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
│   ├── electron.js              # Main Electron process
│   ├── preload.js               # IPC bridge
│   └── models/                  # Face-api bundled models
│       └── README.md            # Model setup guide
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
│   ├── utils/
│   │   └── face.js              # Face recognition utilities
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── tests/
│   └── face.test.js             # Unit tests for face recognition
├── database.js                  # SQLite database management
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
  photo TEXT,                    -- Student photo (base64 encoded)
  faceDescriptor TEXT,           -- Face embedding as JSON array
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
  photo TEXT,                    -- Guardian photo (base64 encoded)
  faceDescriptor TEXT,           -- Face embedding as JSON array
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
  distance REAL,                 -- Face match distance (NULL for barcode verifications)
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (guardianId) REFERENCES guardians(id)
)
```

**Note on Face Descriptors:**
- Face descriptors are 128-dimensional vectors generated by face-api's face recognition model
- Stored as JSON arrays in TEXT columns for portability
- Descriptors are compared using Euclidean (L2) distance
- Match threshold: 0.6 (distances below this indicate a match)

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
- `npm test` - Run face recognition unit tests

## Features in Detail

### � Face Recognition
- **Offline Operation**: All face recognition runs locally without external API calls
- **Dual-Mode Enrollment**: Capture face via live camera or upload photo for auto-detection
- **Real-time Detection**: Live camera feed with face detection feedback
- **Fast Matching**: Search through registered faces in milliseconds
- **Distance Metrics**: Detailed match distance logging for audit trail
- **Graceful Fallback**: Barcode scanning available as backup if face cannot be detected
- **128-D Descriptors**: Uses industry-standard face embeddings for accuracy

**Face Recognition Architecture:**
- **Model**: @vladmandic/face-api with TensorFlow.js backend
- **Models Used**: ssdMobilenetv1 (detection), faceLandmark68Net (landmarks), faceRecognitionNet (embedding)
- **Distance Metric**: Euclidean (L2) distance
- **Match Threshold**: 0.6 (tunable)
- **Performance**: Model load ~2-3 seconds, descriptor computation ~500-800ms per face

### 🔐 Security
- Context isolation in Electron
- No direct node integration in renderer
- Preload script for safe IPC communication
- Database validation and error handling
- Face descriptor input validation in IPC handlers
- No external face recognition services

### 📱 Barcode Scanning
- Real-time QR code detection
- HTML5-based scanning (works with any camera)
- Auto-generated unique barcodes
- Manual barcode entry support
- Fallback when face recognition unavailable

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

### Face recognition camera not opening
- Check camera permissions in system settings
- Ensure camera is not in use by another application
- Try fallback to barcode mode
- Check that face-api models are properly loaded (check browser console)

### Face detection timeout
- Ensure adequate lighting in the environment
- Position face clearly in front of camera
- Keep face steady for 1-2 seconds
- Try with different camera angle
- Try a different camera if available

### Face not being detected in uploaded photo
- Ensure photo quality is good
- Face should be clearly visible and front-facing
- Photo should be well-lit
- Try capturing a new photo with different lighting
- It's normal for profile or occluded faces to fail detection

### Face match distance is measured but verification fails
- The enrolled face descriptor may have been from poor image quality
- Re-enroll the guardian/student with better photo/camera capture
- Ensure consistent lighting conditions between enrollment and verification
- Try gentle head movements during capture for better coverage

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

- [x] **Face Recognition** (Completed - v1.0)
  - Offline face identification and verification
  - Dual-mode enrollment (camera/photo)
  - Graceful fallback to barcode
  - Distance-based matching with threshold
  - Comprehensive unit tests

- [ ] Multi-language support
- [ ] Export to CSV/Excel with face descriptor metadata
- [ ] SMS/Email notifications with verification status
- [ ] Advanced search and filters including face similarity search
- [ ] User authentication and role-based access
- [ ] Backup and restore functionality
- [ ] Statistical analytics and match confidence reports
- [ ] Mobile app support for field verification
- [ ] Face recognition model fine-tuning for specific demographics
- [ ] Liveness detection to prevent spoofing attacks

## License

MIT License - Feel free to use this project for your needs

## Support

For issues or feature requests, please contact the development team.

---

**Version**: 1.1.0 (Face Recognition Release)  
**Last Updated**: January 2025

**Major Changes in v1.1.0:**
- ✅ Offline face recognition system
- ✅ Dual-mode enrollment (camera/photo)
- ✅ Face-based student identification
- ✅ Face-based guardian verification
- ✅ Comprehensive unit test suite
- ✅ Distance metrics for verification audit trail
