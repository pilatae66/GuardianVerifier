/**
 * Face Recognition Utilities
 * Wrapper around @vladmandic/face-api for offline face detection and descriptor computation
 * 
 * Features:
 * - Load pre-trained face models from public/models/
 * - Capture face descriptors from images or camera
 * - Compute face embeddings for storage and matching
 */

let modelsLoaded = false;
let faceApi = null;

/**
 * Load face-api models from local public/models directory
 * Must be called before using descriptor capture functions
 */
export async function loadModels() {
  if (modelsLoaded) {
    console.log('[face.js] Models already loaded');
    return true;
  }

  try {
    console.log('[face.js] Loading face-api models...');
    faceApi = await import('@vladmandic/face-api');

    // Load models from public/models/ directory
    // Models required: ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet
    const modelPath = `${window.location.origin}/models/`;
    
    console.log(`[face.js] Loading models from: ${modelPath}`);
    
    await Promise.all([
      faceApi.nets.ssdMobilenetv1.loadFromUri(modelPath),
      faceApi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceApi.nets.faceRecognitionNet.loadFromUri(modelPath),
    ]);

    modelsLoaded = true;
    console.log('[face.js] Models loaded successfully');
    return true;
  } catch (error) {
    console.error('[face.js] Error loading models:', error);
    throw new Error(`Failed to load face recognition models: ${error.message}`);
  }
}

/**
 * Get face descriptor from an image element or canvas
 * @param {HTMLImageElement | HTMLCanvasElement} imageElement - Source image or canvas
 * @param {number} minConfidence - Minimum detection confidence (0-1, default 0.5)
 * @returns {Array<number>} Face descriptor array (128 elements) or null if no face detected
 */
export async function getDescriptorFromImage(imageElement, minConfidence = 0.5) {
  if (!modelsLoaded || !faceApi) {
    throw new Error('Face models not loaded. Call loadModels() first.');
  }

  try {
    // Create canvas if input is an image
    let canvas = imageElement;
    if (imageElement.tagName === 'IMG') {
      canvas = document.createElement('canvas');
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageElement, 0, 0);
    }

    // Detect face and compute descriptor
    const detections = await faceApi.detectSingleFace(canvas).withFaceLandmarks().withFaceDescriptors(minConfidence);

    if (!detections || !detections.descriptor) {
      console.warn('[face.js] No face detected in image');
      return null;
    }

    // Convert descriptor to plain array for storage
    const descriptorArray = Array.from(detections.descriptor);
    console.log(`[face.js] Face descriptor computed (length: ${descriptorArray.length})`);
    return descriptorArray;
  } catch (error) {
    console.error('[face.js] Error computing descriptor from image:', error);
    throw new Error(`Unable to compute face descriptor: ${error.message}`);
  }
}

/**
 * Capture face descriptor from live camera feed
 * Shows a video element and prompts user to position their face
 * @param {number} timeoutMs - Maximum time to wait for face detection (default 10000ms)
 * @param {number} minConfidence - Minimum detection confidence (0-1, default 0.5)
 * @returns {Array<number>} Face descriptor array or null if capture cancelled
 */
export async function getDescriptorFromCamera(timeoutMs = 10000, minConfidence = 0.5) {
  if (!modelsLoaded || !faceApi) {
    throw new Error('Face models not loaded. Call loadModels() first.');
  }

  return new Promise(async (resolve, reject) => {
    try {
      // Request camera access
      console.log('[face.js] Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false,
      });

      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create overlay instructions
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;

      const videoContainer = document.createElement('div');
      videoContainer.style.cssText = `
        position: relative;
        width: 640px;
        height: 480px;
        border: 3px solid #2196F3;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;

      video.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
      `;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: white;
        font-size: 16px;
        font-family: Arial, sans-serif;
      `;

      overlay.innerHTML = `
        <div style="text-align: center; background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0;">Position your face in the center</p>
          <p style="margin: 0; font-size: 12px; color: #ddd;">Waiting for face detection...</p>
        </div>
        <button id="cancelBtn" style="
          position: absolute;
          bottom: 20px;
          padding: 10px 20px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        ">Cancel</button>
      `;

      videoContainer.appendChild(video);
      videoContainer.appendChild(overlay);
      container.appendChild(videoContainer);
      document.body.appendChild(container);

      let descriptor = null;
      let captured = false;
      let cancelled = false;
      const startTime = Date.now();

      // Cancel button handler
      document.getElementById('cancelBtn').addEventListener('click', () => {
        cancelled = true;
      });

      // Detect face in video frames
      const detectFace = async () => {
        if (cancelled) {
          // Cleanup
          stream.getTracks().forEach(track => track.stop());
          container.remove();
          return reject(new Error('Face capture cancelled by user'));
        }

        if (Date.now() - startTime > timeoutMs) {
          // Timeout
          stream.getTracks().forEach(track => track.stop());
          container.remove();
          return reject(new Error(`Face detection timeout after ${timeoutMs}ms. Please ensure proper lighting and try again.`));
        }

        try {
          const detections = await faceApi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptors(minConfidence);

          if (detections && detections.descriptor && !captured) {
            captured = true;
            descriptor = Array.from(detections.descriptor);
            
            // Update overlay to show success
            overlay.innerHTML = `
              <div style="text-align: center; background: rgba(76, 175, 80, 0.7); padding: 20px; border-radius: 8px;">
                <p style="margin: 0; font-size: 18px; color: white;">✓ Face captured successfully!</p>
              </div>
            `;
            
            // Wait a moment before cleanup to show success message
            setTimeout(() => {
              stream.getTracks().forEach(track => track.stop());
              container.remove();
              resolve(descriptor);
            }, 500);
            return;
          }

          // Continue detecting
          requestAnimationFrame(detectFace);
        } catch (error) {
          console.error('[face.js] Error during face detection:', error);
          requestAnimationFrame(detectFace);
        }
      };

      // Start detection when video is ready
      video.addEventListener('loadedmetadata', () => {
        console.log('[face.js] Camera stream ready, starting face detection...');
        detectFace();
      });

    } catch (error) {
      console.error('[face.js] Camera access error:', error);
      if (error.name === 'NotAllowedError') {
        reject(new Error('Camera access denied. Please grant camera permissions to use face verification.'));
      } else if (error.name === 'NotFoundError') {
        reject(new Error('No camera found. Please connect a camera and try again.'));
      } else {
        reject(new Error(`Camera error: ${error.message}`));
      }
    }
  });
}

/**
 * Convert image file to canvas for descriptor computation
 * @param {File} imageFile - Image file from file input
 * @returns {HTMLCanvasElement}
 */
export function imageFileToCanvas(imageFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = event.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(imageFile);
  });
}

/**
 * Convert descriptor array to JSON string for storage
 * @param {Array<number>} descriptor - Descriptor array
 * @returns {string} JSON string
 */
export function serializeDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) {
    throw new Error('Descriptor must be an array');
  }
  return JSON.stringify(descriptor);
}

/**
 * Parse descriptor from storage JSON string
 * @param {string} descriptorJson - JSON string from database
 * @returns {Array<number>} Descriptor array
 */
export function deserializeDescriptor(descriptorJson) {
  if (!descriptorJson) return null;
  try {
    const descriptor = JSON.parse(descriptorJson);
    if (!Array.isArray(descriptor)) {
      throw new Error('Parsed descriptor is not an array');
    }
    return descriptor;
  } catch (error) {
    console.error('[face.js] Error deserializing descriptor:', error);
    return null;
  }
}

export default {
  loadModels,
  getDescriptorFromImage,
  getDescriptorFromCamera,
  imageFileToCanvas,
  serializeDescriptor,
  deserializeDescriptor,
};
