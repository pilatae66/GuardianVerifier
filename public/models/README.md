# Face Recognition Models

This directory contains pre-trained deep learning models used for offline face recognition in the Guardian Verification System.

## Required Models

The following models are required for `@vladmandic/face-api` to function correctly:

### Model Files

- **ssdMobilenetv1_model-weights_manifest.json** – Model manifest for face detection
- **ssdMobilenetv1_model*.pb** – Model weights for face detection
- **faceLandmark68Net_model-weights_manifest.json** – Facial landmarks detector manifest
- **faceLandmark68Net_model*.pb** – Facial landmarks model weights
- **faceRecognitionNet_model-weights_manifest.json** – Face recognition model manifest
- **faceRecognitionNet_model*.pb** – Face recognition model weights (generates descriptors)

## Setup Instructions

1. Download the models from the @vladmandic/face-api GitHub repository:
   - https://github.com/vladmandic/face-api/tree/master/models

2. Copy all `.json` and `.pb` files into this `public/models/` directory

3. Ensure loader in `src/utils/face.js` references correct model paths (typically `./models/` from public/)

## Offline Operation

These bundled models ensure the Guardian Verification System operates entirely offline with no external API calls. The models are loaded once on application startup and cached in memory.

## Storage Size

Combined model files (all 6 models): ~100-150 MB

## Version

@vladmandic/face-api v1.8.1
Models compatible with face-api v1.8.x
