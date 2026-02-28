# Data Model: Face Verification

## Student
- `id` (INTEGER, PK)
- `barcode` (TEXT, UNIQUE, NOT NULL)
- `firstName`, `lastName`, `dateOfBirth` (TEXT/DATE)
- `guardianId` (INTEGER, FK → guardians.id)
- **[NEW]** `photo` (TEXT, nullable) – base64 data URL
- **[NEW]** `faceDescriptor` (TEXT, nullable) – JSON array of floats
- `registrationDate` (DATETIME)

## Guardian
- `id` (INTEGER, PK)
- `barcode` (TEXT, UNIQUE, NOT NULL)
- `firstName`, `lastName`, `contactNumber`, `email`, `relationship` (TEXT)
- **[NEW]** `photo` (TEXT, nullable)
- **[NEW]** `faceDescriptor` (TEXT, nullable)
- `registrationDate` (DATETIME)

## VerificationLog (augmented)
- `verificationStatus` (TEXT) – 'success' or 'failure'
- `notes` (TEXT, nullable) – barcode-based logs may include barcode details; face-based logs may include descriptor match confidence info
- **[NEW for face]** `distance` (REAL, nullable) – L2 Euclidean distance between captured and stored descriptors (face-verification only; NULL for barcode verifications)

## FaceDescriptor
Numeric array (typically 128 elements) stored as JSON string.
