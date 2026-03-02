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
    // dynamic import of the browser-friendly ESM build ensures we don't pull in the
    // Node.js backend (tfjs-node) which would cause errors in the renderer process.
    const mod = await import('@vladmandic/face-api/dist/face-api.esm.js');
    faceApi = mod.default || mod;

    if (!faceApi || !faceApi.nets || !faceApi.tf) {
      throw new Error('Unexpected face-api import shape; missing nets or tf');
    }

    // make sure TF is ready and set a usable backend before using any tf operations
    const tf = faceApi.tf;
    console.log('[face.js] TensorFlow.js version', tf.version_core, 'initial backend', tf.getBackend());
    // try to select a backend before calling tf.ready() so the wasm backend isn't
    // automatically initialized (avoids the MIME-type compile error seen in dev)
    try {
      await tf.setBackend('webgl');
      console.log('[face.js] tf backend set to webgl');
    } catch (e) {
      console.warn('[face.js] Unable to set WebGL backend, trying cpu', e);
      try {
        await tf.setBackend('cpu');
        console.log('[face.js] tf backend set to cpu');
      } catch (e2) {
        console.warn('[face.js] Unable to set CPU backend either', e2);
      }
    }
    try {
      await tf.ready();
      console.log('[face.js] tf.ready() completed, backend now', tf.getBackend());
    } catch (e) {
      console.warn('[face.js] tf.ready() failed:', e);
      // continue anyway; model loading may still succeed with current backend
    }

    // Load models from public/models/ directory
    // Models required: ssdMobilenetv1, faceLandmark68Net, faceRecognitionNet
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin)
      ? window.location.origin
      : '';
    const modelPath = `${origin}/models/`;
    
    console.log(`[face.js] Loading models from: ${modelPath}`);
    
    await Promise.all([
      faceApi.nets.ssdMobilenetv1.loadFromUri(modelPath),
      faceApi.nets.tinyFaceDetector.loadFromUri(modelPath),        // faster lightweight detector
      faceApi.nets.faceLandmark68Net.loadFromUri(modelPath),
      faceApi.nets.faceRecognitionNet.loadFromUri(modelPath),
    ]);

    modelsLoaded = true;
    console.log('[face.js] Models loaded successfully');
    return true;
  } catch (error) {
    console.error('[face.js] Error loading models:', error);
    // propagate a more user-friendly message without leaking internals
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
    // NOTE: face-api options must be passed to detectSingleFace; withFaceDescriptor() takes no args
// use tiny face detector for faster image processing
          const options = new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: minConfidence });
    const detections = await faceApi
      .detectSingleFace(canvas, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

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
        video: { 
          width: { ideal: 480 },  // Smaller for faster processing
          height: { ideal: 360 },
          frameRate: { ideal: 15 }
        },
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
          <p style="margin: 0 0 10px 0; font-size: 18px;">👤 Position your face in the center</p>
          <p style="margin: 0; font-size: 12px; color: #ddd;">Camera ready - preparing detection...</p>
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
      let frameCount = 0;  // Throttle detection to every 2 frames

      // Cancel button handler
      document.getElementById('cancelBtn').addEventListener('click', () => {
        cancelled = true;
      });

      // Detect face in video frames (throttled: run every 2 frames for faster processing)
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
          frameCount++;
          // Run detection every frame (smaller resolution makes CPU usage acceptable now)
          if (frameCount % 1 === 0) {
            // run detection on video frames
            // use tiny face detector for speed (smaller model)
            const options = new faceApi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: minConfidence });
            const detections = await faceApi
              .detectSingleFace(video, options)
              .withFaceLandmarks()
              .withFaceDescriptor();

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
        console.log('[face.js] Camera stream ready, delaying detection 1s');
        // show overlay countdown
        overlay.innerHTML = `
          <div style="text-align: center; background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 10px 0; font-size: 18px;">👤 Position your face</p>
            <p style="margin: 0; font-size: 12px; color: #ddd;">Detecting in 1 second...</p>
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
        // Re-attach cancel listener in case button recreated
        document.getElementById('cancelBtn').addEventListener('click', () => {
          cancelled = true;
        });
        // start detection after 1 second
        setTimeout(() => {
          console.log('[face.js] Starting face detection...');
          overlay.innerHTML = `
            <div style="text-align: center; background: rgba(0, 0, 0, 0.5); padding: 20px; border-radius: 8px;">
              <p style="margin: 0 0 10px 0;">👤 Detecting face...</p>
              <p style="margin: 0; font-size: 12px; color: #ddd;">Keep your face in frame</p>
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
          document.getElementById('cancelBtn').addEventListener('click', () => {
            cancelled = true;
          });
          detectFace();
        }, 1000);
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
