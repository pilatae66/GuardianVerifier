# Troubleshooting Guide

## Common Issues & Solutions

### 🚀 Startup Issues

#### Problem: "npm start" fails or app won't launch
**Symptoms**: Command fails, no window opens, or immediate crash

**Solutions**:
1. **Clean reinstall dependencies**
   ```bash
   rmdir /s /q node_modules
   npm install
   npm start
   ```

2. **Check Node.js version**
   ```bash
   node --version
   ```
   Must be v14.0.0 or higher

3. **Clear npm cache**
   ```bash
   npm cache clean --force
   npm install
   ```

4. **Check for port conflicts**
   - React dev server uses port 3000
   - If in use, close conflicting application

---

#### Problem: "Cannot find module" error
**Symptoms**: Error about missing dependencies

**Solutions**:
1. Reinstall dependencies
   ```bash
   npm install
   ```

2. Install specific missing package
   ```bash
   npm install package-name
   ```

3. Check package.json for typos
   - Verify all dependencies are listed correctly

---

### 🎥 Barcode Scanning Issues

#### Problem: Camera not working
**Symptoms**: Camera prompt doesn't appear, or black camera view

**Solutions**:
1. **Grant camera permissions**
   - Look for permission prompt when scanner starts
   - Allow camera access when asked
   - May need to restart app after granting

2. **Check device camera**
   - Ensure camera hardware is connected
   - Test camera with another app
   - Restart device if needed

3. **Use manual entry instead**
   - Don't need camera for basic testing
   - Paste barcode text directly when prompted
   - Perfect for development without scanner

4. **Check browser console (F12)**
   - Look for permission errors
   - Check for device enumeration issues

---

#### Problem: QR code not scanning
**Symptoms**: Point camera at QR code but no detection

**Solutions**:
1. **Improve lighting conditions**
   - Ensure good lighting
   - Avoid glare on QR code
   - Reduce shadows

2. **Keep QR code in focus**
   - Hold camera steady
   - Ensure full QR code visible
   - Distance 6-12 inches optimal

3. **Ensure valid QR code**
   - Use online QR generator to test
   - Verify code format is correct
   - Check code isn't corrupted

4. **Restart scanner**
   - Reload page (F5)
   - Re-open scan dialog
   - Try again with better positioning

---

### 💾 Database Issues

#### Problem: Database file corrupted or won't open
**Symptoms**: Error when starting app, can't access data

**Solutions**:
1. **Locate and delete database file**
   
   Windows:
   ```
   %APPDATA%\Guardian Verification System\guardian-system.db
   ```
   
   - Open file explorer
   - Paste path in address bar
   - Delete `guardian-system.db` file

2. **Restart application**
   - Close app completely
   - Run `npm start` again
   - New clean database created automatically

3. **Re-register data**
   - Data is lost when deleting database
   - Will need to re-enter guardians and students

---

#### Problem: Cannot save new guardian/student
**Symptoms**: Registration button doesn't work, no error shown

**Solutions**:
1. **Verify all fields filled**
   - Check all required fields (marked with *)
   - Fill in missing information
   - Try again

2. **Check for duplicate barcode**
   - Each barcode must be unique
   - If registering manually, use different barcode
   - Use auto-generate to ensure uniqueness

3. **Check database file permissions**
   - Ensure write access to app data directory
   - Run as administrator if needed
   - Check disk space availability

4. **Check browser console (F12)**
   - Look for error messages
   - Screenshot error for troubleshooting

---

#### Problem: Data not persisting after restart
**Symptoms**: Data lost when closing and reopening app

**Solutions**:
1. **Check database file location exists**
   ```
   %APPDATA%\Guardian Verification System\
   ```
   - Verify folder exists
   - Verify guardian-system.db file is there

2. **Verify database writing**
   - Check file was modified recently
   - Look in file properties → Modified date

3. **Check disk space**
   - Ensure C: drive has free space
   - Database needs at least 100MB free

---

### 🎨 UI/Display Issues

#### Problem: App looks stretched or weird
**Symptoms**: Elements misaligned, text cut off, bad layout

**Solutions**:
1. **Restart electron**
   - Close app completely
   - Run `npm start` again

2. **Clear cache**
   ```bash
   npm cache clean --force
   npm start
   ```

3. **Check window size**
   - Resize app window
   - Should be minimum 1000px wide

---

#### Problem: Buttons not responding
**Symptoms**: Clicking button does nothing, no visual feedback

**Solutions**:
1. **Check browser console (F12)**
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **Verify electron.js is running**
   - Backend services must be running
   - If process crashed, restart with `npm start`

3. **Try different button**
   - Check if specific button broken or all buttons
   - Try other features to isolate issue

---

#### Problem: Text too small to read
**Symptoms**: Content appears tiny or blurry

**Solutions**:
1. **Adjust window zoom**
   - Ctrl + Plus to zoom in
   - Ctrl + Zero to reset

2. **Maximize window**
   - Use maximize button
   - Drag to larger size

3. **Check display scaling**
   - Windows settings → Display
   - Check if system scaling is causing issues

---

### 🔍 Verification Issues

#### Problem: Verification always shows "Guardian does not match"
**Symptoms**: Even correct guardian barcode shows failed

**Solutions**:
1. **Verify guardian is registered**
   - Check Dashboard → see if guardian listed
   - If not listed, register guardian first

2. **Verify student linked to guardian**
   - Check Dashboard → find student
   - Confirm correct guardian is assigned

3. **Check barcode accuracy**
   - Ensure scanning correct guardians barcode
   - Manual entry: copy-paste from registration
   - Check for spaces or special characters

4. **Try different guardian**
   - Register second guardian
   - Register student with second guardian
   - Test verification with correct pairing

---

#### Problem: "Student not found" error
**Symptoms**: Scanning valid-looking barcode shows error

**Solutions**:
1. **Check student is registered**
   - Go to Dashboard
   - Search for student in table
   - If not there, register student first

2. **Verify barcode matches**
   - Check barcode in Dashboard
   - Ensure exact match when scanning
   - Manual entry: copy exact barcode text

3. **Check student was saved**
   - After registering, check Dashboard refreshes
   - May need to wait a moment
   - Try refresh button if needed

---

### 📊 Report Issues

#### Problem: Reports won't print
**Symptoms**: Print dialog appears but nothing prints, or error shown

**Solutions**:
1. **Check printer is connected**
   - Verify printer powered on
   - Check Windows print settings
   - Try printing test page

2. **Use "Print to PDF" instead**
   - Select "Microsoft Print to PDF" as printer
   - Save report as PDF file
   - Open and share PDF

3. **Check browser console (F12)**
   - Look for JavaScript errors
   - Report generation issue details there

4. **Try different report**
   - Dashboard report
   - Logs report
   - Check if all reports broken or specific one

---

#### Problem: Report data is incomplete or wrong
**Symptoms**: Missing information, wrong names, incorrect counts

**Solutions**:
1. **Refresh data before printing**
   - Click "↻ Refresh Data" button
   - Wait for data to reload
   - Then generate report

2. **Check data in tables first**
   - View Dashboard or Logs
   - Verify data shown is correct
   - If wrong there, issue is database

3. **Check for duplicate entries**
   - If multiple identical entries, that's issue
   - Delete and re-register if needed

---

### 🔐 Permission Issues

#### Problem: "Permission denied" error
**Symptoms**: Cannot write to database, cannot access files

**Solutions**:
1. **Run as Administrator**
   - Right-click app
   - Select "Run as Administrator"
   - Restart `npm start` from admin terminal

2. **Check folder permissions**
   - Right-click AppData folder
   - Properties → Security
   - Ensure user has full control

3. **Change app data location**
   - May need to reinstall to different drive
   - Try C:\ drive instead of other drive

---

#### Problem: Firewall blocking app
**Symptoms**: App won't connect, network errors

**Solutions**:
1. **Check Windows Firewall**
   - Settings → Privacy & Security → Windows Defender Firewall
   - Ensure Electron app allowed

2. **Add app to firewall exceptions**
   - Firewall → Allow app through
   - Find and enable Electron app

3. **Temporarily disable firewall** (testing only)
   - Not recommended for production
   - For testing issues only

---

### ⚙️ Configuration Issues

#### Problem: App uses wrong settings
**Symptoms**: Wrong colors, wrong behavior, custom settings not applied

**Solutions**:
1. **Check .env file**
   - Create/edit `.env` file in root directory
   - Copy from `.env.example`
   - Verify settings are correct

2. **Restart app after changes**
   - Stop `npm start` (Ctrl+C)
   - Make .env changes
   - Run `npm start` again

3. **Check config.js**
   - Review config.js in root
   - Verify settings match requirements

---

### 🆘 Getting More Help

#### Collect debugging information
When asking for help, provide:

1. **Error message** (exact text)
2. **Steps to reproduce** (specific steps that cause issue)
3. **Screenshot** (what you see)
4. **Browser console output** (F12 → Console tab)
5. **Node.js version** (`node --version`)
6. **npm version** (`npm --version`)
7. **Operating system** (Windows 10/11, etc.)

#### Check these resources
- **README.md** - Full documentation
- **QUICKSTART.md** - Setup guide
- **FEATURES.md** - Feature documentation
- **Browser console (F12)** - Error messages
- **electron.js** - IPC handlers and server logic
- **database.js** - Database operations and queries

#### Reset everything (nuclear option)
If all else fails:
```bash
# 1. Stop running app
# Press Ctrl+C in terminal

# 2. Delete node_modules
rmdir /s /q node_modules

# 3. Delete database
# Delete: %APPDATA%\Guardian Verification System\guardian-system.db

# 4. Reinstall everything
npm install

# 5. Start fresh
npm start
```

---

## Performance Tips

### Optimize app speed

1. **Close unnecessary programs**
   - Free up RAM
   - Improve app responsiveness

2. **Use SSD for database**
   - Much faster than HDD
   - Database file should be on C: drive

3. **Keep app updated**
   - npm packages may have performance fixes
   - Run `npm update` periodically

4. **Clear cache regularly**
   - Browser cache can slow down
   - Use DevTools to clear

5. **Limit historical data**
   - Very old logs can slow queries
   - Consider archiving old records

---

## Security Checklist

- ✅ Never share database file publicly
- ✅ Backup database regularly
- ✅ Keep guardians/students data private
- ✅ Don't share printed reports carelessly
- ✅ Grant camera permission only when scanning
- ✅ Run from trusted location only
- ✅ Keep system and Node.js updated

---

**Still having issues?** 

1. Check browser console (F12) for errors
2. Review this troubleshooting guide again
3. Check documentation files
4. Try the "nuclear reset" option if desperate

---

**Last Updated**: December 2025
