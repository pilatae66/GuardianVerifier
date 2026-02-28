# Feature Specification: Face Verification

**Feature Branch**: `001-face-verification`  
**Created**: 2026-02-28  
**Status**: Draft  
**Input**: User description: "change the student and guardian verification from qr to face recognition. the face id should be stored in the database"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Identify Student by Face (Priority: P1)

An on-site guard uses the application to identify a student by pointing the device camera at the student's face. The system returns the matched student record if a confident match exists.

**Why this priority**: This replaces the student QR scan flow and is the primary path for verification.

**Independent Test**: Place an enrolled student's face in front of the camera; the UI shows the student's details within 3 seconds and the student photo.

**Acceptance Scenarios**:
1. **Given** a student is enrolled with a face descriptor, **When** the guard performs a student face scan, **Then** the system returns the correct student record and displays student info.
2. **Given** no enrolled student matches, **When** the guard performs a student face scan, **Then** the system displays "No matching student found" and offers manual lookup.

---

### User Story 2 - Verify Guardian by Face (Priority: P1)

After the student is identified, the guard scans the guardian's face. The system compares the captured guardian descriptor with the stored guardian descriptor for that student and returns match/fail.

**Why this priority**: This delivers the core security goal — prevent unauthorized student release.

**Independent Test**: With a known student‑guardian pair enrolled, scan guardian face and confirm the verification result (success for the right guardian, failure for a non-guardian).

**Acceptance Scenarios**:
1. **Given** a student record with an enrolled guardian descriptor, **When** the guard scans the guardian's face, **Then** the system returns a success result when the guardian is the registered guardian.
2. **Given** a different person, **When** the guard scans the face, **Then** the system returns a failure and logs the attempt.

---

### User Story 3 - Enrollment (Priority: P2)

Admin registers students/guardians and enrolls a face during registration (upload or camera capture). The system computes and stores the face descriptor alongside the photo.

**Why this priority**: Enrollment is necessary to enable face-based verification.

**Independent Test**: Register a student and guardian with photos; verify face descriptors are computed and persisted, and later usable for verification.

**Acceptance Scenarios**:
1. **Given** a registration form with photo, **When** the admin submits, **Then** the system stores `photo` and `faceDescriptor` for the record and reports success.

---

### Edge Cases

- Low light / occluded face: return an explicit "unable to detect face" error and offer manual barcode entry.
- Multiple faces in frame: prompt user to reframe or select the intended face region.
- Descriptor compute failure: record error and allow retry.
- Enrollment without face photo: reject with clear validation message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute a numeric face descriptor (embedding) for any enrolled student or guardian and persist it with the record.
- **FR-002**: System MUST allow enrollment via image upload or camera capture for both students and guardians.
- **FR-003**: System MUST provide a student identification endpoint that accepts a face descriptor and returns the best matching student (or none).
- **FR-004**: System MUST provide a guardian verification endpoint that accepts a student id and a face descriptor and returns match/fail and distance metric.
- **FR-005**: System MUST log every face-based verification attempt into `verification_logs` with timestamp, result, and distance (notes).
- **FR-006**: System MUST store face descriptors in the local database in a portable format (JSON array) and support offline matching.
- **FR-007**: System MUST load face models from local `public/models` directory to ensure the app works entirely offline with no external model downloads required.
- **FR-008**: System MUST provide a fallback UI for manual lookup and barcode entry when face detection fails.

*Notes*: FR-001/FR-006 imply a new `faceDescriptor` column in database tables for students and guardians. Descriptors are technology-agnostic numeric arrays; implementation uses an offline, local model (see Assumptions).

### Key Entities *(include if feature involves data)*

- **Student**: id, barcode, firstName, lastName, dateOfBirth, guardianId, photo (base64 or file path), faceDescriptor (JSON array)
- **Guardian**: id, barcode, firstName, lastName, contactNumber, email, relationship, photo, faceDescriptor
- **FaceDescriptor**: numeric array (assumed length 128) representing a face embedding
- **VerificationLog**: id, studentId, guardianId, type (barcode|face), **distance** (REAL, nullable—face-only field), verificationStatus, verificationTime, notes (face verification may include descriptor match details)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Student identification returns the correct student in at least 95% of controlled test attempts with enrolled photos.
- **SC-002**: Guardian verification returns a definitive match or fail decision within 3 seconds on target hardware (offline).
- **SC-003**: 100% of enrolled records persist a non-empty `faceDescriptor` after successful enrollment.
- **SC-004**: All face-based verification attempts are recorded in `verification_logs` with a distance metric and timestamp.

## Assumptions

- Use an offline, local face-recognition model to compute numeric descriptors (embeddings). Models and assets will be bundled with the application so offline operation is preserved.
- Storing descriptors as JSON arrays in the existing SQLite database is acceptable and will remain offline-capable.
- Matching uses Euclidean/L2 distance with a configurable threshold (example: ~0.6); threshold tuning is part of implementation and testing.
- The Electron preload layer will expose new IPC handlers for face operations: `find-student-by-face` and `verify-guardian-face`.

## Implementation Notes (for planning)

- Add `faceDescriptor` (TEXT) and `photo` columns to `students` and `guardians` tables; persist descriptors as JSON strings and photos as base64 data URLs or file references.
- Compute and store descriptors during registration (both student and guardian) from either uploaded photo **or** camera capture using the bundled, offline face-api model; both enrollment pathways MUST support face capture.
- Implement client-side model loader and a camera capture helper that returns descriptors to send to the main process for matching.
- Implement IPC handlers in the main process to perform offline matching against stored descriptors.
- Update UI flows: replace QR scanning with a face-scan button for student identification and a guardian face-scan verification button. Keep barcode/manual fallback.

**Version**: 0.1.0 | **Created**: 2026-02-28