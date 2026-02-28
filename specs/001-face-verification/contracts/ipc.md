# IPC Contracts: Face Verification

## find-student-by-face
**Input**: `descriptor` (Array<number>)
**Output**: `{ success: boolean, data: Student|null, error?: string }`

## verify-guardian-face
**Input**: `{ studentId: number, descriptor: Array<number> }`
**Output**: `{ success: boolean, data: VerificationResult, error?: string }`
- `VerificationResult`: `{ isMatch, dist, student, guardian }`

**Notes**: Both work offline; errors use `success: false`.
