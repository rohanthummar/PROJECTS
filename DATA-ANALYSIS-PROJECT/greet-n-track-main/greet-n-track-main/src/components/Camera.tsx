
import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, X } from "lucide-react";

interface CameraProps {
  onCapture?: (imageData: string) => void;
  isScanning?: boolean;
  onScanComplete?: () => void;
  isProcessing?: boolean;
  className?: string;
}

const Camera: React.FC<CameraProps> = ({ 
  onCapture, 
  isScanning = false, 
  onScanComplete,
  isProcessing = false,
  className = "" 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError("Camera access denied. Please allow camera permissions and refresh the page.");
        } else if (err.name === 'NotFoundError') {
          setError("No camera found. Please connect a camera and try again.");
        } else {
          setError("Unable to access camera. Please check your camera settings.");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture?.(imageData);
  };

  const retryCamera = () => {
    stopCamera();
    startCamera();
  };

  if (error) {
    return (
      <div className={`relative bg-gray-900 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-6">
          <X className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-medium mb-2">Camera Error</p>
          <p className="text-sm opacity-75 mb-4">{error}</p>
          <Button onClick={retryCamera} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Starting camera...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }} // Mirror effect
      />
      
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Scanning overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-pulse">
          <div className="absolute inset-0 opacity-30">
            <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-blue-400/20"></div>
              ))}
            </div>
          </div>
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/50 text-white text-sm px-3 py-1 rounded-full text-center">
              {isScanning ? "Scanning... Please hold still" : "Camera Ready"}
            </div>
          </div>
        </div>
      )}
      
      {/* Capture button */}
      {onCapture && !isScanning && !isProcessing && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            onClick={captureImage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full shadow-lg"
          >
            <CameraIcon className="w-5 h-5 mr-2" />
            Capture
          </Button>
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        </div>
      )}
    </div>
  );
};

export default Camera;
