
import * as faceapi from 'face-api.js';

class FaceDetectionService {
  private isInitialized = false;
  // Use CDN for now - can be changed to local path when models are downloaded
  private modelsPath = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Loading face detection models...');
      
      // Load face detection models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelsPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelsPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelsPath)
      ]);
      
      this.isInitialized = true;
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Failed to load face detection models:', error);
      throw new Error('Failed to initialize face detection. Please check your internet connection.');
    }
  }

  async detectFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 416,
          scoreThreshold: 0.5 
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection;
    } catch (error) {
      console.error('Face detection error:', error);
      return null;
    }
  }

  async extractFaceDescriptor(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    const detection = await this.detectFace(imageElement);
    
    if (!detection) {
      throw new Error('No face detected in image. Please ensure your face is clearly visible and try again.');
    }

    if (detection.detection.score < 0.5) {
      throw new Error('Face detection confidence is too low. Please improve lighting and face visibility.');
    }

    return Array.from(detection.descriptor);
  }

  compareFaces(descriptor1: number[], descriptor2: number[], threshold = 0.6) {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    const similarity = 1 - distance;
    
    return {
      match: distance < threshold,
      confidence: Math.max(0, Math.min(100, similarity * 100)),
      distance
    };
  }

  async findBestMatch(inputDescriptor: number[], knownDescriptors: { id: string, descriptor: number[], name: string }[], threshold = 0.6) {
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const known of knownDescriptors) {
      const distance = faceapi.euclideanDistance(inputDescriptor, known.descriptor);
      
      if (distance < threshold && distance < bestDistance) {
        bestDistance = distance;
        bestMatch = {
          ...known,
          confidence: Math.max(0, Math.min(100, (1 - distance) * 100)),
          distance
        };
      }
    }

    return bestMatch;
  }

  // Convert image data URL to HTMLImageElement
  async loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  // Get face detection info for debugging
  async getFaceInfo(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    const detection = await this.detectFace(imageElement);
    
    if (!detection) {
      return { detected: false };
    }

    return {
      detected: true,
      confidence: detection.detection.score,
      box: detection.detection.box,
      landmarks: detection.landmarks.positions.length
    };
  }
}

export const faceDetectionService = new FaceDetectionService();
