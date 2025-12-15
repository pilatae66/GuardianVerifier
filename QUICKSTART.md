# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ installed
- npm installed

### Installation

1. **Navigate to the project directory**:
```bash
cd d:\laragon\www\GuardianVerfierSystem
```

2. **Dependencies are already installed**, but if you need to reinstall:
```bash
npm install
```

### Running the Application

#### Development Mode
```bash
npm start
```
This will:
- Start React dev server on http://localhost:3000
- Launch Electron app with hot-reload
- Open DevTools for debugging

#### Production Build
```bash
npm run electron-build
```
Creates an installer in `dist/` folder

### Default Actions

#### **Admin Dashboard**
1. Go to Dashboard (http://localhost:3000/admin)
2. View all students and guardians
3. Print reports

#### **Register Guardian**
1. Click "Register Guardian" in navigation
2. Auto-generate or enter barcode (e.g., `GUA-ABC12345`)
3. Fill in personal details
4. Click "Register Guardian"

#### **Register Student**
1. Click "Register Student" in navigation
2. Auto-generate or enter barcode (e.g., `STU-XYZ67890`)
3. Select guardian from dropdown
4. Fill in student information
5. Click "Register Student"

#### **Verify Guardian**
1. Click "Verify Guardian" in navigation
2. Click "Start Scanning Student" and scan student barcode
3. Click "Start Scanning Guardian" and scan guardian barcode
4. Click "Verify Guardian" button
5. View verification result (✓ Success or ✗ Failed)

#### **View Logs**
1. Click "Logs" in navigation
2. Filter by All, Success, or Failed
3. Print verification report

### Testing with Manual Barcodes

Since no physical barcode scanner is available in development:

1. Use auto-generated barcodes when registering (click "Generate")
2. When scanning, paste the barcode text directly into the input field
3. For QR scanner, you can:
   - Generate QR codes online using the barcode text
   - Print and scan them with your camera
   - Or paste barcodes when prompted

### Troubleshooting

**App won't start?**
- Delete `node_modules` folder
- Run `npm install` again
- Run `npm start`

**Database issues?**
- Database file location: `%APPDATA%/Guardian Verification System/guardian-system.db`
- Delete the database file to start fresh (all data will be lost)

**Camera/Scanner not working?**
- Grant camera permissions when prompted
- Check if camera device is available
- For development, use manual barcode entry instead

### Database Location

- **Windows**: `C:\Users\[YourUsername]\AppData\Roaming\Guardian Verification System\guardian-system.db`
- **Mac**: `~/Library/Application Support/Guardian Verification System/guardian-system.db`
- **Linux**: `~/.config/Guardian Verification System/guardian-system.db`

### File Structure

```
GuardianVerfierSystem/
├── public/
│   ├── electron.js       # Main Electron process
│   ├── preload.js        # IPC bridge for security
│   └── index.html        # Main HTML file
├── src/
│   ├── pages/            # React page components
│   ├── components/       # Reusable components
│   ├── App.js            # Main React app
│   └── index.js          # React entry point
├── database.js           # SQLite database manager
├── package.json          # Project dependencies
└── README.md             # Full documentation
```

### Environment Variables

Create a `.env` file in the root directory (or copy `.env.example`):

```
NODE_ENV=development
REACT_APP_NAME=Guardian Verification System
REACT_APP_VERSION=1.0.0
DEBUG=false
```

### Common Tasks

| Task | Command |
|------|---------|
| Start development | `npm start` |
| Build for production | `npm run build` |
| Build Electron app | `npm run electron-build` |
| React dev only | `npm run react-start` |
| Electron dev only | `npm run electron-start` |

### Tips for Testing

1. **Register Multiple Guardians & Students**:
   - Create test data with auto-generated barcodes
   - This allows you to test various scenarios

2. **Test Verification**:
   - Scan a student → scan their correct guardian = ✓ Success
   - Scan a student → scan wrong guardian = ✗ Failed

3. **Test Reports**:
   - Dashboard: Print student/guardian overview
   - Logs: Print verification history

### Need Help?

- Check [README.md](README.md) for detailed documentation
- Review error messages in DevTools (F12)
- Check console logs for debugging information

---

**Version**: 1.0.0  
**Last Updated**: December 2025
