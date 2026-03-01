# Quickstart: Face Verification

## 1. Install dependencies
```bash
# note: the project locks face-api to ^1.7.15 because 1.8.x is not published on npm
npm install
```

## 2. Add face models to `public/models/`
Download pre-trained models from `@vladmandic/face-api` and place them here.

> **Note:** The application forces a WebGL (or CPU) backend for TensorFlow.js to
> avoid WebAssembly initialization errors that can occur when the development
> server serves `.wasm` files with the wrong MIME type. No additional
> configuration is required for most environments.

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
