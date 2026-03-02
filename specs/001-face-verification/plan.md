# Implementation Plan: Face Verification

**Branch**: `001-face-verification` | **Date**: 2026-02-28 | **Spec**: spec.md

## Summary

Replace barcode/QR scanning with offline face recognition. Students and guardians will be enrolled with photos; the system computes and stores face descriptors in SQLite. Verification uses camera capture + descriptor matching (Euclidean distance). Uses `@vladmandic/face-api` with bundled models.

## Technical Context

**Language/Version**: JavaScript/Node.js (current)  
**Primary Dependencies**: React, Electron, better-sqlite3, @vladmandic/face-api  
**Storage**: SQLite3  
**Target Platform**: Windows/macOS/Linux desktop (Electron)  
**Project Type**: Desktop application  
**Performance Goals**: Face recognition ≤3 seconds; lookup near-instant offline  
**Constraints**: Entirely offline; minimal bundle size  
**Scale/Scope**: Single app instance; modest DB sizes

## Constitution Check

- Security & Privacy First ✅ face data stored locally; no cloud
- Data Integrity & Auditability ✅ descriptors + logs persisted
- Desktop Offline Availability ✅ bundled models ensures offline
- Simplicity & Minimal Dependencies ✅ face-api only addition
- Testing & Compliance ✅ manual scenarios defined

## Project Structure

### Affected files

```
package.json                   # add @vladmandic/face-api
database.js                    # add photo, faceDescriptor columns; new methods
public/
  preload.js                   # expose new IPC handlers
  electron.js                  # handle IPC
  models/                      # [NEW] face model files
src/pages/
  GuardVerification.js         # replace QR with face UI
  StudentRegistration.js       # integrate descriptor capture
  GuardianRegistration.js      # integrate descriptor capture
```

### No complexity violations; all assumptions documented.
