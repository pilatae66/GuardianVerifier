# Guardian Verification System - Quick Build Guide

## Quick Start

### Development
```bash
npm install
npm start
```

### Testing Build
```bash
# Windows
build.bat test

# macOS/Linux
./build.sh test
```

### Production Build
```bash
# Windows
build.bat prod

# macOS/Linux
./build.sh prod
```

---

## Available Commands

### Using NPM Directly

#### Development
```bash
npm run dev          # Start dev server with Electron
npm run react-start  # Start React only (port 3000)
npm run electron-start  # Start Electron only
```

#### Building
```bash
npm run test-build   # Build for testing (React only)
npm run prod-build   # Build production (all platforms)
npm run prod-build-win    # Windows only
npm run prod-build-mac    # macOS only
npm run prod-build-linux  # Linux only
```

### Using Helper Scripts

#### Windows (build.bat)
```bash
build.bat test       # Testing build
build.bat prod       # Production build
build.bat prod-win   # Windows build
build.bat clean      # Clean artifacts
build.bat all        # Full clean production build
```

#### macOS/Linux (build.sh)
```bash
./build.sh test       # Testing build
./build.sh prod       # Production build
./build.sh prod-win   # Windows build
./build.sh prod-mac   # macOS build
./build.sh prod-linux # Linux build
./build.sh clean      # Clean artifacts
./build.sh all        # Full clean production build
```

---

## Build Workflow

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Development Testing
```bash
npm run dev
# Test all features in the app
# Check DevTools (Ctrl+Shift+I) for errors
```

### Step 3: Build for QA Testing
```bash
npm run test-build
# Located in: ./build/
# Test the compiled React app
```

### Step 4: Build Production Executable
```bash
npm run prod-build-win    # For Windows
npm run prod-build-mac    # For macOS
npm run prod-build-linux  # For Linux
```

### Step 5: Test the Executable
- Run the installer/executable from `/dist/`
- Test all features
- Check logs and error handling

### Step 6: Distribution
- Share the `.exe` (Windows), `.dmg` (macOS), or `.AppImage` (Linux)
- Users install and run locally

---

## Output Locations

| Build Type | Output Location | Contents |
|------------|-----------------|----------|
| React Build | `./build/` | HTML, CSS, JS bundles |
| Testing | `./build/` | Optimized React app |
| Production | `./dist/` | Installers & executables |
| Development | RAM | Hot-reloaded dev server |

---

## System Requirements

### To Build
- Node.js v14+ 
- npm v6+
- 2GB RAM minimum
- 2GB disk space for dependencies

### To Run
- Windows: Windows 7+
- macOS: macOS 10.13+
- Linux: Ubuntu 14.04+

---

## Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Build Fails
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run prod-build
```

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run prod-build
```

---

## File Structure

```
GuardianVerfierSystem/
├── src/                 # React source code
├── public/              # Static files & electron.js
├── build/              # Output from test-build
├── dist/               # Output from prod-build
├── package.json        # Dependencies & scripts
├── BUILD_GUIDE.md      # Detailed build guide
├── build.bat           # Windows build helper
└── build.sh            # macOS/Linux build helper
```

---

## Build Configuration

Edit `package.json` build section to customize:

```json
{
  "build": {
    "appId": "com.guardianverification.app",
    "productName": "Guardian Verification System",
    "files": [
      "build/**/*",
      "public/electron.js",
      "package.json"
    ]
  }
}
```

---

## Next Steps

1. **Read the full guide:** `BUILD_GUIDE.md`
2. **Check dependencies:** `npm list`
3. **Start development:** `npm run dev`
4. **Build for testing:** `npm run test-build`
5. **Build for production:** `npm run prod-build-win`

---

## Support

For detailed instructions, see `BUILD_GUIDE.md`

Common issues:
- Check Node.js version: `node --version`
- Check npm version: `npm --version`
- Review console output for specific errors
- Ensure sufficient disk space (2GB+ free)

