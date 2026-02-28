# Face Recognition Quick Start Guide

## Overview

The Guardian Verification System now features offline face recognition technology for both student identification and guardian verification. This guide gets you up and running with face recognition in minutes.

## Prerequisites

- Camera/webcam connected to your system
- Good lighting conditions
- Guardian Verification System v1.1.0 or later
- Node.js and npm installed (for development)

## Quick Start (5 minutes)

### 1. Start the Application

```bash
npm start
```

The app will launch with face recognition models loading automatically on startup.

### 2. Register a Guardian with Face Recognition

Navigate to **Register Guardian** page:

1. Click **📷 Capture Face** button
2. Position guardian's face in front of camera
3. Wait for "Face descriptor captured successfully!" message
4. Fill in remaining fields:
   - First/Last name
   - Contact number
   - Relationship
5. Click **Register Guardian**

✅ Guardian now enrolled with face recognition

### 3. Register a Student with Face Recognition

Navigate to **Register Student** page:

1. Click **📷 Capture Face** button
2. Position student's face in front of camera
3. Wait for "Face descriptor captured successfully!" message
4. Fill in remaining fields:
   - First/Last name
   - Date of birth
   - Select guardian
5. Click **Register Student**

✅ Student now enrolled with face recognition

### 4. Verify Guardian Using Face

Navigate to **Verify Guardian** page:

1. **Identify Student**:
   - Click **📷 Capture Face** (or use 📤 Barcode fallback)
   - Position student's face in front of camera
   - Wait for student identification
2. **Verify Guardian**:
   - Click **📷 Capture Face** (or use 📤 Barcode fallback)
   - Position guardian's face in front of camera
   - System compares faces and shows match distance
3. View result:
   - ✓ **Match**: Guardian verified successfully
   - ✗ **No Match**: Guardian verification failed

✅ Verification logged with match distance metrics

## Features

### 📷 Live Camera Capture

- Real-time face detection during camera capture
- Clear visual feedback
- Automatic success indication
- Timeout protection (10 seconds default)
- User-friendly error messages

### 📤 Photo Upload Alternative

- Upload photos from files
- Automatic face detection
- Batch capture support

### 🔄 Dual-Mode Flexibility

- **Primary**: Face recognition (faster, more secure)
- **Fallback**: Barcode scanning (always available)
- Seamless switching between modes

### 📊 Verification Metrics

- **Distance Score**: Shows how close the match is
- Lower distance = closer match (threshold: 0.6)
- Automatic logging for audit trails

## Common Scenarios

### Scenario 1: First-Time User

**Goal**: Enroll 10 guardians and 20 students

**Time**: ~30 minutes

**Steps**:
1. Register guardians with face capture (3 min each)
2. Register students linked to guardians (2 min each)
3. Total time: ~30 minutes for initial setup

**Tip**: Batch register similar-looking students at different times for better detection accuracy

### Scenario 2: Daily Guardian Verification

**Goal**: Verify 50 guardians during school pickup

**Time**: ~50 minutes (1 min per verification)

**Steps**:
1. Open **Verify Guardian**
2. For each student:
   - Capture student's face (5 seconds)
   - Capture guardian's face (5 seconds)
   - See match result
3. Log automatically recorded

**Tip**: Ensure consistent lighting and camera angle for best results

### Scenario 3: Fallback to Barcode Mode

**Goal**: Continue operations if camera fails

**Steps**:
1. During registration: Use **📤 Upload Photo** instead of camera
2. During verification: Use **📤 Barcode** buttons
3. System remains fully operational

**Tip**: Always keep printed backup barcodes available

## Best Practices

### 📸 Photo Quality Tips

✅ **Do**:
- Make sure face is well-lit
- Position face straight to camera
- Fill 50-70% of frame with face
- Use neutral lighting
- Keep background uncluttered

❌ **Don't**:
- Use harsh backlighting
- Take photos at extreme angles
- Obstruct face with hair/hands
- Use photos from poor lighting
- Take photos with heavy makeup or sunglasses

### ⚡ Performance Tips

✅ **Do**:
- Ensure camera is connected and working
- Keep models loaded by not closing app frequently
- Use consistent environment for enrollment and verification
- Take breaks between multiple registrations

❌ **Don't**:
- Restart during bulk operations
- Use multiple cameras simultaneously
- Register in dramatically different lighting

### 🔒 Security Tips

✅ **Do**:
- Verify guardian identity in person
- Keep barcodes as backup
- Review verification logs regularly
- Use in secure facility

❌ **Don't**:
- Skip barcode verification training
- Use faces from photos or videos (printed photos may work for enrollment but not verification)
- Trust single failed attempt

## Troubleshooting

### Issue: Camera Permission Denied

**Solution**:
1. Go to system camera settings
2. Grant camera permission to Guardian Verification System
3. Restart the app
4. Try face capture again

**Fallback**: Use barcode scanning instead

### Issue: Face Detection Timeout

**Solution**:
1. Improve lighting conditions
2. Check camera lens for dirt/dust
3. Ensure face is clearly visible
4. Keep head steady for 2 seconds
5. Try from different angle

**Fallback**: Upload a photo instead

### Issue: Face Not Detected in Photo

**Solution**:
1. Check photo quality
2. Ensure face is clearly visible
3. Try different photo with better lighting
4. Make sure face is front-facing

**Fallback**: Use barcode with manual verification

### Issue: Low Match Distance but Verification Failed

**Solution**:
1. Distance shown is informational only
2. Check threshold in advanced settings (default: 0.6)
3. Try re-enrollment in better lighting
4. Use barcode fallback if consistently failing

### Issue: App Crashes During Face Recognition

**Solution**:
```bash
# Clear and restart
npm install
npm start
```

**Advanced**: Check browser console (F12) for detailed error

## Advanced Configuration

### Match Threshold

Default distance threshold is **0.6** (tight matching).

To adjust (modify `database.js`):

```javascript
// Line ~350 - findStudentByFace method
const matches = students.filter(s => distance < 0.6); // Change 0.6 to desired value

// Lower values (0.4-0.5): Stricter matching (fewer false positives)
// Higher values (0.7-0.8): Looser matching (more tolerance)
```

### Camera Timeout

Default timeout is **10 seconds**.

To adjust (modify `src/utils/face.js`):

```javascript
export async function getDescriptorFromCamera(timeout = 10000, minConfidence = 0.5) {
  // Change 10000 (ms) to desired value
  // Example: 15000 for 15 seconds
}
```

### Model Loading

Models are pre-bundled in `public/models/`. To verify:

```bash
npm run validate-build
```

All models should show as ✓ included.

## Unit Tests

Verify face recognition accuracy:

```bash
npm test
```

This runs 16 comprehensive unit tests covering:
- Descriptor distance calculation
- Serialization/deserialization
- Match threshold validation
- Edge cases and error handling
- Real-world similarity scenarios

**Expected Output**:
```
=== Test Suite 1: Descriptor Distance Calculation ===
✓ Test 1.1 passed: Same descriptors distance = 0
...
=== Test Summary ===
✓ All unit tests completed
```

## Performance Benchmarks

Typical performance on modern hardware:

| Operation | Time |
|-----------|------|
| App startup | 3-5 seconds |
| Face model loading | 2-3 seconds (first time) |
| Face detection (camera) | 500-800 ms |
| Face detection (photo) | 1-2 seconds |
| Student identification | 1-3 seconds |
| Guardian verification | 2-4 seconds |
| Database lookup | 50-100 ms |

**Target**: Full verification cycle < 6 seconds (SC-002 requirement ✓)

## Integration with Existing System

Face recognition integrates seamlessly with barcode system:

- **Phase 1**: Deploy with barcode only (existing setup)
- **Phase 2**: Add face recognition to new enrollments
- **Phase 3**: Hybrid verification (face primary, barcode fallback)
- **Phase 4**: Full migration (barcode as disaster recovery)

No data migration required. Legacy barcode data remains fully functional.

## Security Considerations

### Data Storage
- Face descriptors stored in SQLite database (client-side)
- No external API calls for face recognition
- All processing offline
- Face descriptors are non-reversible (can't reconstruct image from descriptor)

### Privacy
- Photos and other data remain on local machine
- No cloud synchronization by default
- No third-party processing
- Audit logs track all verification attempts

### Compliance
- GDPR-compatible (no external data transfer)
- Biometric data handled locally
- Verification logs for accountability
- Optional data encryption at rest

## Next Steps

1. **Test Setup**: Run `npm test` to verify installation
2. **Register First Guardian**: Practice with one guardian
3. **Verify Guardian**: Test identification and verification flow
4. **Bulk Operations**: Register batch of students/guardians
5. **Production Deployment**: Follow deployment guide

## Support & Troubleshooting

### Enable Debug Logging

Press `F12` to open developer console. Check for:
- Face model loading status
- Descriptor computation errors
- IPC handler responses

### Clear App Cache

```bash
# Windows
DEL %APPDATA%\guardian-system.db

# Linux/Mac
rm ~/.config/guardian-system.db
```

### Get Help

- Check verification logs for failed attempts
- Review browser console for errors
- Retry with barcode fallback
- Consult system administrator

## Resources

- [Main README](README.md) - Complete feature documentation
- [Build Guide](BUILD_GUIDE.md) - Deployment instructions
- [Database Schema](database.js) - Data structure reference
- [Face Utilities](src/utils/face.js) - Technical implementation

---

**Version**: 1.1.0  
**Last Updated**: January 2025

**Quick Reference**:
- 📷 Face Capture: Camera scan with face detection
- 📤 Photo Upload: Face auto-detect from file
- 📱 Barcode Fallback: Always available as backup
- ✓ Verification: Logged with distance metrics
- 🧪 Unit Tests: Run `npm test` to validate
