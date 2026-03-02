# Phase 0 Research: Face Verification

## Technology Decisions

- **Face Recognition Library**: `@vladmandic/face-api` chosen.
  - Rationale: Maintained fork with offline-first design; runs entirely in browser/Electron; models bundled with app.
  - Alternatives: cloud APIs (rejected—no offline), native modules (rejected—build complexity).

- **Descriptor Storage**: JSON-encoded TEXT in SQLite.
  - Rationale: Portable format; offline matching; schema remains simple.
  - Alternatives: Binary blobs (rejected—less portable), recompute on-demand (rejected—slower).

- **Matching Algorithm**: Euclidean distance with configurable threshold (~0.6).
  - Rationale: Standard for embeddings; tuning occurs during testing.

- **Model Distribution**: Pre-trained models in `public/models`.
  - Rationale: Bundled app ensures offline operation; no external service calls.

- **IPC Endpoints**: `find-student-by-face` and `verify-guardian-face` handlers.
  - Rationale: Offload computation to main process; renderer captures video.

## Outcome

All-JavaScript, offline face recognition fits within existing Electron+React stack. Phase 1 design can proceed.
