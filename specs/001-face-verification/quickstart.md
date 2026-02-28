# Quickstart: Face Verification

## 1. Install dependencies
```bash
npm install
```

## 2. Add face models to `public/models/`
Download pre-trained models from `@vladmandic/face-api` and place them here.

## 3. Run development
```bash
npm start
```

## 4. Enrollment
Navigate to **Register Guardian** or **Student**; upload photo or use camera; system computes descriptor and stores it.

## 5. Verification
**Guardian Verification** page → Face scan student → Face scan guardian → Result displayed.

## 6. Build & test
```bash
npm run react-build
npm test
```

Refer to `research.md` and `data-model.md` for details.
