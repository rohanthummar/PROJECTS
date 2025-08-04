
# Face-API.js Models

This directory should contain the pre-trained models for face-api.js.

## Required Models
The following files need to be placed in this directory:

1. **Tiny Face Detector:**
   - tiny_face_detector_model-weights_manifest.json
   - tiny_face_detector_model-shard1

2. **Face Landmarks:**
   - face_landmark_68_model-weights_manifest.json
   - face_landmark_68_model-shard1

3. **Face Recognition:**
   - face_recognition_model-weights_manifest.json
   - face_recognition_model-shard1
   - face_recognition_model-shard2

4. **Face Expression (optional):**
   - face_expression_model-weights_manifest.json
   - face_expression_model-shard1

## How to Download
You can download these models from the face-api.js repository:
https://github.com/justadudewhohacks/face-api.js/tree/master/weights

## Alternative: CDN Loading
If you prefer not to host the models locally, you can modify the faceDetection service to load from CDN:
```typescript
const modelsPath = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
```

**Note:** For production use, it's recommended to host the models locally for better performance and reliability.
