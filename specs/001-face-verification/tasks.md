# Tasks: Face Verification

## Phase 1: Setup (Project Initialization)

- [ ] T001 [P] Add `@vladmandic/face-api` dependency to package.json
- [ ] T002 [P] Create `public/models/` directory and download face model files

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T003 Update database schema in database.js: add `photo` TEXT and `faceDescriptor` TEXT columns to students and guardians tables
- [ ] T004 [P] Implement `findStudentByFace(descriptor)` and `verifyGuardianByFace(studentId, descriptor)` methods in database.js; validate descriptor input (array length, numeric type) per Principle I security requirements
- [ ] T005 [P] Add IPC handlers `find-student-by-face` and `verify-guardian-face` in public/electron.js
- [ ] T006 Expose new IPC methods in public/preload.js via contextBridge

## Phase 3: User Story 1 – Identify Student by Face (P1)

- [ ] T007 [US1] Create face-api model loader and descriptor utilities in src/utils/face.js with loadModels() and getDescriptorFromCamera() functions
- [ ] T008 [US1] Update src/pages/GuardVerification.js: replace Html5QrcodeScanner with face scan UI for student identification; integrate findStudentByFace flow
- [ ] T008b [US1] Implement error-handling workflows in GuardVerification.js: handle face detection failures (low light, occluded face, multiple faces), display user-friendly error messages, and offer fallback to manual barcode entry

## Phase 4: User Story 2 – Verify Guardian by Face (P1)

- [ ] T009 [US2] Extend src/pages/GuardVerification.js: add guardian face scan UI after student identified; integrate verifyGuardianByFace flow and display match result

## Phase 5: User Story 3 – Enrollment (P2)

- [ ] T010 [P] [US3] Update src/pages/StudentRegistration.js: support face capture from **either** uploaded photo **or** live camera; compute descriptor on form submit; include descriptor in registerStudent() IPC call
- [ ] T011 [P] [US3] Update src/pages/GuardianRegistration.js: support face capture from **either** uploaded photo **or** live camera; compute descriptor on form submit; include descriptor in registerGuardian() IPC call

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T012 [P] Add unit tests for face descriptor computation and L2 distance matching in database.js
- [ ] T013 [P] Update README.md with face verification feature documentation and offline requirements
- [ ] T014 Validate models directory exists in build artifact; update build.sh and build.bat
- [ ] T015 Create quickstart guide for face enrollment workflow in FACE_QUICKSTART.md
- [ ] T016 [P] Performance validation: benchmark face recognition (model load time, descriptor compute time, L2 distance lookup) and IPC round-trip latency; verify guardian verification completes within SC-002's 3-second target on target hardware

---

## Dependency Graph

```
T001 ──┐
       ├─→ [Phase 1 Complete]
T002 ──┘
         └─→ T003 (schema)
               ├─→ T004 ──┐
               │          ├─→ T005 ──→ T006 → [Phase 2 Complete]
               │          │
               └──────────┘
                          └─→ T007 ──→ T008 ──→ T008b ──→ T009 → [US1+US2 Complete]
                                       ↓
                                  T010 ←┴→ T011 (both need face utilities from T007)
                                       ↓
                                  [US3 Complete]
                          
                          T012 ──┐
                                 ├─→ T013 ──→ T014 ──→ T015 ──→ T016 → [Polish Complete]
                          T012 ──┘
```

## Parallel Execution Opportunities

**Setup Phase (T001 ∥ T002)**: Both setup tasks can run independently
- `npm install` the face-api package (T001)
- Simultaneously download models to `public/models/` (T002)

**Foundational Phase (T004 ∥ T005)**: After schema changes (T003)
- Implement database methods in database.js (T004—includes descriptor validation)
- Simultaneously implement IPC handlers in electron.js (T005)
- Sequence: T006 must follow T005 for import/reference

**Verification Phase (T008 ∥ T008b)**: After model utilities (T007)
- Update GuardVerification.js: student face scan UI (T008)
- Simultaneously implement error-handling workflows (T008b)
- Sequence: T009 (guardian verification) follows both

**Enrollment Phase (T010 ∥ T011)**: Update both registration pages in parallel
- StudentRegistration.js: capture descriptor from uploaded photo or live camera (T010)
- Simultaneously update GuardianRegistration.js: capture descriptor from uploaded photo or live camera (T011)
- Both use same utility created in T007

**Polish Phase (T012 ∥ T013)**: Independent improvements
- Write unit tests (T012)
- Simultaneously update documentation (T013)

**Post-Polish Phase (T014 ∥ T016)**: Final validations
- Validate models directory in build (T014)
- Simultaneously benchmark performance and IPC latency (T016)

## User Story Completion Order

1. **US1 + US2 (P1 – Blocking)**: T001→T002→T003→T004→T005→T006→T007→T008→T008b→T009
   - Independent test: Student face scan identifies student, then guardian scan verifies guardian; error handling displays user-friendly messages
   - Estimated: 3–4 hours implementation + testing

2. **US3 (P2 – Deferred)**: T010→T011 (after US1+US2)
   - Independent test: Enroll student/guardian with captured face (upload or camera), verify descriptors stored, verification scan works
   - Estimated: 1.5 hours implementation

3. **Polish (T012→T013→T014→T016)**
   - Independent test: Build succeeds, tests pass, README updated, performance benchmarks meet SC-002
   - Estimated: 1 hour

## MVP Scope Recommendation

**Minimum Viable Product (MVP)** = Phases 1–4 (T001–T009 including error handling T008b)
- Delivers core functionality: student identification + guardian verification (both high-priority P1 stories) with full error handling
- Supports manual barcode fallback when face detection fails
- Users can perform end-to-end verification workflows
- Deferrable: full enrollment UI polish, comprehensive testing suite, detailed documentation
- Estimated scope: 3–4 hours

**Extended Scope** = Phases 5–6 (T010–T016)
- Adds full enrollment UI (both photo upload AND camera capture pathways)
- Comprehensive test coverage + performance benchmarking
- Complete documentation and Polish
- Estimated additional: 2–3 hours
