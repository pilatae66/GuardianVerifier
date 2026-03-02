# Quickstart: Face Verification

## Overview
This guide covers the fully implemented face verification system for Guardian Verifier. The system enables:
1. **Student Identification**: Guard scans student's face to identify them
2. **Guardian Verification**: Guard scans guardian's face to verify they are the registered guardian
3. **Enrollment**: Admin registers students/guardians with face photos or live camera capture

## Prerequisites
- Node.js v16+
- npm v7+
- Windows/Linux/macOS
- Camera access (for live face capture)

## 1. Installation & Setup

```bash
# Install dependencies (face-api pinned to ^1.7.15)
npm install

# Face models are already in public/models/ - no downloads needed
# Models bundled: ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet, tiny variants, age/gender/expression models
```

## 2. Development Server

```bash
npm start
```

The application will:
- Load face models on startup (~1-2 seconds)
- Initialize TensorFlow.js with WebGL backend (or fallback to CPU)
- Open the Electron app with the React UI

> **Backend Strategy**: The system uses TensorFlow.js **WebGL backend** (GPU) for best performance, with fallback to **CPU** if unavailable. **WASM is deliberately avoided** due to dev server MIME type issues. This is configured automatically in `src/utils/face.js`.

## 3. Verify Installation

- Navigate to **Guardian Verification** page
- Check indicator at top: `🟢 Face recognition ready` = models loaded
- If `🟡 Face recognition unavailable`, use barcode fallback

## 4. Student & Guardian Enrollment

Navigate to **Register Guardian** or **Student**:

### Photo Upload Path
1. Upload a photo (JPG/PNG)
2. System automatically computes face descriptor from the image
3. Submit form (no additional steps needed)

### Live Camera Path
1. Click **"👤 Face Capture"** button
2. System launches camera
3. Position face in frame; system auto-detects and captures
4. Descriptor computed automatically
5. Submit form

### Validation
- Requires **either** photo upload **OR** face capture (not both required)
- System rejects submissions without photo/descriptor

## 5. Verification Flow

### Step 1: Identify Student
- **Face Scan**: Click "👤 Face Scan" → capture student's face → system matches against enrolled students
- **Barcode Fallback**: If face scan unavailable, use "📋 Barcode Scan"

### Step 2: Verify Guardian
- Shows **Expected Guardian** card (assigned guardian for the identified student)
- **Face Scan Guardian**: Guard captures guardian's face
  - System computes descriptor and compares with enrolled guardian descriptor
  - L2 distance matching with threshold 0.6
  - **Match Percentile** displayed: `(1 - distance) × 100%` — higher % = better match
  - Shows **Match Percentile: 92.3%** (example) if successful
- **Green Verified Card**: Shows guardian name, barcode, relationship, contact on success
- **Red Failure Card**: Shows distance metric on mismatch
- **New Verification Button**: Full-width button at bottom to restart flow (visible only on success)

### Success Feedback
- Top alert displays: `✓ Guardian verified successfully for [Student Name]`
- Guardian details updated in Step 2 box with match percentile
- No duplicate panels

### Error Handling
- **Face not detected**: "Face detection timeout. Ensure good lighting and try again."
- **Multiple faces**: System prompts to reframe
- **No models loaded**: Barcode fallback enabled
- **Guardian not enrolled**: System returns "Guardian record not found"

## 6. Testing & Validation

### Unit Tests
```bash
npm test
```
Tests validate:
- Descriptor math (L2 distance calculation)
- Descriptor serialization (JSON format)
- Edge cases (empty descriptors, null values)

### Manual Testing Checklist
- [ ] Register student with photo → verify descriptor stored
- [ ] Register guardian with live camera → verify descriptor stored
- [ ] Identify student by face → returns correct student
- [ ] Verify registered guardian by face → shows green verified card with Match Percentile
- [ ] Verify unregistered guardian → shows red failure card with distance
- [ ] Re-verify with New Verification button → flow restarts correctly

## 7. Build & Deployment

```bash
# Build React app
npm run react-build

# Built files output to build/
# Models automatically included from public/models/

# Electron build
npm run electron-build

# Run packaged app
npm run start-dist
```

## 8. Offline Operation

The entire system is **fully offline**:
- Face models bundled in `public/models/`
- No external API calls for face matching
- SQLite database stored locally
- All descriptor computation happens on device

## 9. Database

Face data persisted in SQLite:
- **students**: `id`, `faceDescriptor` (JSON array), `photo` (base64)
- **guardians**: `id`, `faceDescriptor` (JSON array), `photo` (base64)
- **verification_logs**: `distance` (L2 metric), `verificationStatus` ('success'|'failure'), `notes`

### Database Location

**Production**: Electron userData directory (OS-specific)
```
Windows: C:\Users\<user>\AppData\Roaming\guardian-verification-system\guardian-system.db
macOS: ~/Library/Application Support/guardian-verification-system/guardian-system.db
Linux: ~/.config/guardian-verification-system/guardian-system.db
```

**Testing**: Project directory (`./guardian-system.db`) when using test override

### Utility Scripts

```bash
# Show exact database location
npm run show-db-path

# View recent verification logs with statistics
npm run check-logs
```

The `check-logs` script displays:
- Total logs count
- Recent verifications (last 10)
- Success/failure breakdown
- Detailed notes for each attempt

## 10. Verification Logs

Navigate to **Verification Logs** page to view all verification attempts.

### Features
- **Filter by Status**: All, Success, Failed
- **Automatic Refresh**: Click "↻ Refresh Logs" to reload
- **Print Reports**: Generate printable verification summary
- **Failed Logs**: Displayed with red badge matching success green badge styling

### Log Details
Each log entry includes:
- Date & Time
- Student name & barcode
- Guardian name & barcode (or "Unknown" for failures)
- Verification status (Success/Failure)
- Match distance (for face verifications)
- Notes (error details for failures)

### Status Badge Styling
- **Success**: Green background, dark green text, green border
- **Failure**: Red background, dark red text, red border
- Both badges have consistent padding and rounded corners for visual harmony

## 11. Configuration

### Threshold Adjustment
Edit `src/pages/GuardVerification.js`:
```javascript
// Line ~280: Change 0.6 to adjust match threshold
const result = await window.electron.verifyGuardianByFace(studentInfo.id, descriptor, 0.6);
// Lower value = stricter matching (fewer false positives)
// Higher value = more lenient (fewer false negatives)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Face recognition unavailable" | Models not loaded; check console; refresh page |
| Face detection timeout | Ensure good lighting; move closer to camera; check camera permissions |
| Guardian verification always fails | Verify guardian enrolled with live camera or clear photo (no glasses/hat) |
| Descriptor mismatch | Threshold too strict; lower from 0.6 to 0.55 in verification flow |
| Camera permission denied | Allow camera access in browser/system settings; restart app |
| Failed verifications not appearing in logs | Check database location with `npm run show-db-path`; ensure viewing correct database |
| "No logs found" but verifications performed | Run `npm run check-logs` to inspect userData database directly |
| Error shown but not logged | Ensure student identified before scanning guardian; auto-trigger should log all attempts |
| Database confusion (multiple files) | Production uses userData directory; tests use project directory; check logs for path |

### Debugging Verification Logging

If verification attempts aren't being logged:

1. **Check Database Location**:
   ```bash
   npm run show-db-path
   ```
   Note the returned path - this is where logs are stored.

2. **Inspect Logs Directly**:
   ```bash
   npm run check-logs
   ```
   Shows all logs including failures with detailed notes.

3. **Verify in UI**:
   - Open Verification Logs page
   - Click "Failed" filter
   - Failed attempts should appear with red badges
   - If empty, database may be in different location

4. **Check Console Logs**:
   - Open DevTools (F12)
   - Look for `[database.js]` messages showing log inserts
   - Look for `[GuardVerification]` messages showing verification flow

### Common Log Issues (Fixed in v1.0.0)

✅ **Empty/null barcode now logged**: Previously, scanning without guardian barcode didn't create log entry. Now all attempts logged.

✅ **Failed verifications now visible in UI**: Previously, INNER JOIN excluded NULL guardianId. Now LEFT JOIN includes all logs.

✅ **Case sensitivity fixed**: Database stores lowercase ('success'/'failure'), UI now checks case-insensitively.

✅ **Auto-trigger verification**: Guardian barcode scan automatically triggers verification (no button press needed).

## Next Steps

- See [spec.md](spec.md) for detailed requirements
- See [data-model.md](data-model.md) for database schema
- See [research.md](research.md) for technical decisions

---

**Last Updated**: 2026-03-02  
**Implementation Status**: Complete & Verified ✅  
**Version**: 1.0.0  
**Tested On**: Windows 10+, Chrome 90+, Node 16+
