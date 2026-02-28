<!--
Sync Impact Report
- Version change: none → 1.0.0 (initial adoption)
- Modified principles:
    * [PRINCIPLE_1_NAME] template → I. Security & Privacy First
    * [PRINCIPLE_2_NAME] template → II. Data Integrity & Auditability
    * [PRINCIPLE_3_NAME] template → III. Desktop Offline Availability
    * [PRINCIPLE_4_NAME] template → IV. Simplicity & Minimal Dependencies
    * [PRINCIPLE_5_NAME] template → V. Testing & Compliance
- Added sections: Technical Constraints, Development Workflow
- Removed sections: none
- Templates updated:
    - plan-template.md ✅
    - spec-template.md ✅
    - tasks-template.md ✅
- Deferred TODOs: none
-->

# Guardian Verification System Constitution

## Core Principles

### I. Security & Privacy First
All personal and verification data must be treated as sensitive. The desktop
application MUST run with Electron context isolation and IPC safeguards, validate
inputs, enforce unique barcodes, and never expose Node APIs to the renderer.
Audit logging of every verification is mandatory to support compliance reviews.

### II. Data Integrity & Auditability
Student‑guardian relationships are authoritative. The SQLite schema MUST enforce
foreign keys and unique constraints. Every verification attempt MUST produce a
log entry with timestamps and status. Features cannot ship without corresponding
log/reporting mechanisms.

### III. Desktop Offline Availability
The application MUST function entirely offline on Windows, macOS, and Linux using
local SQLite storage. Dependencies and builds should target Electron and avoid
external services; network access is optional but never required for core
verification workflows.

### IV. Simplicity & Minimal Dependencies
The user interface and codebase must remain lightweight and intuitive;
functionality is limited to registration, verification, dashboard, and reports.
External libraries are permitted only when essential (e.g., React,
html5‑qrcode, better‑sqlite3). Avoid adding frameworks or heavy packages for
one‑off features.

### V. Testing & Compliance
Every change impacting user flows or data MUST include manual test scenarios and
automated tests where feasible. Defined test cases (success, wrong guardian,
missing records) are the baseline. New features must supply audit/reporting
updates and document compliance implications.

## Technical Constraints

- **Stack Lock‑in**: React 18 + Electron 27 + SQLite3 via better‑sqlite3;
  barcode scanning via html5‑qrcode.
- **Build Tools**: npm scripts and provided shell/batch build helpers.
- **Platform Support**: Windows, macOS, Linux desktop environments.
- **Security Standards**: Use context isolation, validate database queries,
  enforce unique barcodes.
- **Performance**: Bundle size remains minimal; startup time <5 s on target
  hardware.

## Development Workflow

- All work happens on Git branches named `###-description`.
- Feature specifications, plans, and tasks are generated with speckit templates.
- Pull requests MUST reference the relevant constitution principles and
demonstrate compliance (e.g., show added logging, maintain offline capability).
- Code review requires at least one peer and should verify that tests and
documentation are updated.
- Builds for prod and testing follow existing scripts (`build.sh`/`build.bat`).
- Releases involve incrementing version in package.json and producing installer
  via `npm run electron-build`.

## Governance

This constitution is the authoritative guide for development. Amendments require a
documented rationale, a draft proposal in a PR, and sign‑off from at least one
other maintainer. Material changes trigger a version bump following semantic
versioning: MAJOR for principle redefinitions or removals, MINOR for new
principles or sections, PATCH for clarifications and typos. After ratification
the document's `Last Amended` date must be updated.

All pull requests must check against the constitution; automated checks or
manual review notes should mention applicable principles. Complexity exceeding
what the constitution allows must be justified in the PR.

**Version**: 1.0.0 | **Ratified**: 2026-02-28 | **Last Amended**: 2026-02-28
