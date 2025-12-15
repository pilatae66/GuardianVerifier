# Build Guide - Guardian Verification System

This document provides instructions for building the Guardian Verification System for testing and production environments.

## Table of Contents
1. [Development Setup](#development-setup)
2. [Testing Build](#testing-build)
3. [Production Build](#production-build)
4. [Platform-Specific Builds](#platform-specific-builds)
5. [Distribution & Deployment](#distribution--deployment)

---

## Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git (optional, for version control)

### Installation

```bash
# Clone or navigate to the project directory
cd GuardianVerfierSystem

# Install all dependencies
npm install
```

### Development Mode

Start the application in development mode with hot reload:

```bash
npm run dev
# OR
npm start
```

This command:
- Starts the React development server (http://localhost:3000)
- Automatically launches the Electron app
- Enables hot module reloading for React changes
- Opens DevTools for debugging

**For debugging:**
- Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open DevTools
- Use the Console tab to view errors and logs
- Use the Network tab to monitor API calls

---

## Testing Build

### Purpose
Testing builds are optimized for QA and internal testing before production release.

### Build Commands

#### 1. Build React for Testing
```bash
npm run test-build
```

This command:
- Compiles React source code
- Optimizes assets for production use
- Creates a `/build` directory with all compiled files
- Takes 2-5 minutes depending on system speed

**Output:** `/build/index.html` and related assets

#### 2. Build Full Testing Executable
```bash
npm run electron-build
```

This command:
- Runs `npm run react-build` first
- Packages the app with Electron
- Creates an installer/executable for your OS
- Generates distributable files in `/dist` directory

### Testing Checklist

After building for testing, verify:

```bash
✓ Application launches without errors
✓ All features are accessible:
  - Login with demo credentials (admin/demo123, guard/demo123)
  - Create new admin/guard users
  - Register students and guardians
  - Verify guardians with barcode scanning
  - View verification logs
  - Export data
✓ No console errors (DevTools)
✓ Database operations work correctly
✓ All UI elements render properly
✓ Navigation works smoothly
✓ Form validation is functioning
✓ Error messages display correctly
```

### Testing in Different Scenarios

#### Test User Creation
```bash
# Login as admin
Username: admin
Password: demo123
Role: Admin

# Navigate to "Manage Users" dropdown
# Click "Admin Users" or "Guard Users"
# Create new test users with various names and contact numbers
# Test edit and delete functionality
```

#### Test Guardian Verification
```bash
# Login as guard (or use demo guard)
Username: guard
Password: demo123
Role: Guard

# Navigate to "Verify Guardian"
# Test with scanner or barcode input
# Verify successful and failed attempts are logged
```

---

## Production Build

### Purpose
Production builds are optimized for deployment to end users.

### Build Commands

#### Windows Build
```bash
npm run prod-build-win
```

Creates:
- Guardian Verification System Setup.exe (installer)
- Guardian Verification System.exe (portable version)
- Location: `/dist/`

#### macOS Build
```bash
npm run prod-build-mac
```

Creates:
- Guardian Verification System.dmg (disk image)
- Guardian Verification System.app (application)
- Location: `/dist/`

#### Linux Build
```bash
npm run prod-build-linux
```

Creates:
- guardian-verification-system-1.0.0.AppImage
- guardian-verification-system-1.0.0.snap
- Location: `/dist/`

#### All Platforms
```bash
npm run prod-build
```

Creates builds for all available platforms on your current OS.

### Production Build Process

```bash
# 1. Clean previous builds (optional but recommended)
rm -rf build dist

# 2. Run production build
npm run prod-build

# 3. Verify output in /dist directory
ls dist/
```

Expected output structure:
```
dist/
├── Guardian Verification System Setup 1.0.0.exe  (Windows installer)
├── Guardian Verification System 1.0.0.exe        (Windows portable)
├── Guardian Verification System-1.0.0-mac.zip    (macOS)
└── guardian-verification-system-1.0.0.AppImage   (Linux)
```

---

## Platform-Specific Builds

### Windows Build Details

**Requirements:**
- Windows 7 or later
- Node.js and npm installed
- Optional: Visual C++ Build Tools for native modules

**Build Command:**
```bash
npm run prod-build-win
```

**Output Files:**
- `.exe` - Executable installer (recommended for distribution)
- `.exe` - Portable version (no installation needed)

**Distribution:**
- Share the Setup.exe file with users
- Users double-click to install
- Application installed to Program Files
- Start menu shortcuts created automatically

### macOS Build Details

**Requirements:**
- macOS 10.13 or later
- Xcode command line tools (optional)

**Build Command:**
```bash
npm run prod-build-mac
```

**Output Files:**
- `.dmg` - Disk image (recommended for distribution)
- `.zip` - Compressed app bundle

**Distribution:**
- Share the .dmg file with users
- Users double-click .dmg to mount
- Drag app to Applications folder
- Launch from Applications or Spotlight

### Linux Build Details

**Requirements:**
- Linux (Ubuntu 14.04+, Fedora, etc.)

**Build Command:**
```bash
npm run prod-build-linux
```

**Output Files:**
- `.AppImage` - Self-contained executable
- `.snap` - Snap package

**Distribution:**
- AppImage: Make executable and run directly
  ```bash
  chmod +x guardian-verification-system-1.0.0.AppImage
  ./guardian-verification-system-1.0.0.AppImage
  ```
- Snap: Install via snap store or directly
  ```bash
  sudo snap install guardian-verification-system-1.0.0.snap --dangerous
  ```

---

## Distribution & Deployment

### Pre-Release Checklist

Before distributing, verify:

```bash
□ Version number updated in package.json
□ CHANGELOG.md updated with new features
□ All tests passing
□ Security review completed
□ Code review completed
□ Database migrations tested
□ User documentation updated
□ Known issues documented
```

### Creating Release Notes

Create a `RELEASE_NOTES.md` file:

```markdown
# Guardian Verification System v1.0.0

## New Features
- User management system for admins
- Support for first name, last name, and contact numbers
- Improved UI for user registration

## Bug Fixes
- Fixed authentication for non-matching usernames
- Improved responsive design for mobile devices

## Installation
- Download the appropriate installer for your OS
- Run the installer and follow on-screen instructions
- Launch the application from your Start Menu or Applications

## System Requirements
- Windows: Windows 7 or later
- macOS: macOS 10.13 or later
- Linux: Ubuntu 14.04 or later

## Support
For issues or questions, contact: support@guardianverification.com
```

### Deployment Options

#### 1. Direct Distribution
- Host installers on a website
- Users download and install manually
- Provide download links for each OS

#### 2. Update System (Future)
```bash
# Add electron-updater for automatic updates
npm install electron-updater
```

#### 3. Enterprise Deployment
- Deploy via Windows Group Policy
- Deploy via macOS MDM (Mobile Device Management)
- Deploy via Linux package managers

### Installation Instructions for Users

#### Windows
1. Download `Guardian Verification System Setup 1.0.0.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

#### macOS
1. Download `Guardian Verification System-1.0.0-mac.zip`
2. Extract the zip file
3. Drag "Guardian Verification System.app" to Applications folder
4. Launch from Applications or Spotlight search

#### Linux
1. Download `guardian-verification-system-1.0.0.AppImage`
2. Make it executable: `chmod +x guardian-verification-system-*.AppImage`
3. Run: `./guardian-verification-system-*.AppImage`

---

## Troubleshooting Build Issues

### Build Fails with "Out of Memory"
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run prod-build
```

### Build Takes Too Long
- Close other applications to free resources
- Disable antivirus scanning during build
- Use SSD instead of HDD for faster I/O

### Cannot Find Module Errors
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run prod-build
```

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

---

## Environment Variables

Create a `.env` file in the project root for environment-specific settings:

```env
# Development
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3000

# Production (uncomment for production builds)
# REACT_APP_ENV=production
# REACT_APP_API_URL=https://api.guardianverification.com
```

Note: Currently, the app uses localStorage and doesn't connect to external APIs.

---

## Performance Optimization

### Build Size
Current build size: ~150-200 MB (uncompressed)

To reduce size:
- Remove unused dependencies
- Enable code splitting in react-scripts
- Compress assets

### Runtime Performance
- Clear localStorage periodically in production
- Implement data pagination for large datasets
- Use virtual scrolling for long lists

---

## Version Management

Update version for each build:

```bash
# Update version in package.json
{
  "version": "1.0.1",
  ...
}

# Rebuild after version change
npm run prod-build
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start development | `npm run dev` |
| Build for testing | `npm run test-build` |
| Build executable | `npm run prod-build` |
| Windows only | `npm run prod-build-win` |
| macOS only | `npm run prod-build-mac` |
| Linux only | `npm run prod-build-linux` |
| Clean build | `rm -rf build dist && npm run prod-build` |

---

## Support

For build-related issues:
- Check Node.js version: `node --version`
- Check npm version: `npm --version`
- Review electron-builder logs in console
- Check GitHub Issues for similar problems

