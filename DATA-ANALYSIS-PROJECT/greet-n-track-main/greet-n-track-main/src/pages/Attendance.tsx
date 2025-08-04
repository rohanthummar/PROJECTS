
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, CheckCircle, X, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CameraComponent from "@/components/Camera";
import { useAttendance } from "@/hooks/useAttendance";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { faceDetectionService } from "@/services/faceDetection";

interface AttendanceResult {
  success: boolean;
  user?: {
    name: string;
    confidence: number;
  };
  error?: string;
  timestamp?: string;
}

const Attendance = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { markAttendance, isProcessing } = useAttendance();
  const [showCamera, setShowCamera] = useState(false);
  const [result, setResult] = useState<AttendanceResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Redirect if not authenticated
  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleCameraCapture = async (imageDataUrl: string) => {
    try {
      // Convert data URL to image element
      const img = await faceDetectionService.loadImageFromDataUrl(imageDataUrl);
      
      // Process attendance
      const attendanceResult = await markAttendance(img);
      
      if (attendanceResult.success && attendanceResult.user) {
        setResult({
          success: true,
          user: {
            name: attendanceResult.user.name,
            confidence: attendanceResult.user.confidence
          },
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        });
      } else {
        setResult({
          success: false,
          error: attendanceResult.error || 'Recognition failed'
        });
      }
      
      setShowCamera(false);
    } catch (error) {
      console.error('Camera capture error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Camera capture failed'
      });
      setShowCamera(false);
      setCameraError(error instanceof Error ? error.message : 'Camera capture failed');
    }
  };

  const startScanning = () => {
    setResult(null);
    setCameraError(null);
    setShowCamera(true);
  };

  const tryAgain = () => {
    setResult(null);
    setCameraError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mark Attendance</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl dark:text-white">Facial Recognition Scanner</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Position your face in front of the camera for attendance marking
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Camera Component */}
            {showCamera ? (
              <div className="space-y-4">
                <CameraComponent
                  onCapture={handleCameraCapture}
                  isProcessing={isProcessing}
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowCamera(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Camera Preview Area */}
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 dark:from-gray-800 dark:to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                    <div className="text-center text-white">
                      <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Camera Ready</p>
                      <p className="text-sm opacity-75">Click scan to begin face recognition</p>
                    </div>
                  </div>
                  
                  {/* Scan Button */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <Button
                      onClick={startScanning}
                      disabled={isProcessing}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full shadow-lg"
                      size="lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Camera className="w-5 h-5 mr-2" />
                          Start Scan
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Camera Error Alert */}
            {cameraError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {cameraError}
                </AlertDescription>
              </Alert>
            )}

            {/* Scan Result */}
            {result && (
              <Card className={`border-0 ${result.success ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {result.success ? (
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    ) : (
                      <X className="w-8 h-8 text-red-600 dark:text-red-400" />
                    )}
                    <div className="flex-1">
                      {result.success ? (
                        <div>
                          <h3 className="font-semibold text-green-900 dark:text-green-100">Attendance Marked!</h3>
                          <p className="text-green-700 dark:text-green-200">
                            Welcome back, <strong>{result.user?.name}</strong>
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                            Email notification sent successfully
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200">
                              {result.user?.confidence.toFixed(1)}% confidence
                            </Badge>
                            <Badge variant="outline" className="border-green-200 dark:border-green-700 text-green-700 dark:text-green-200">
                              {result.timestamp}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-red-900 dark:text-red-100">Recognition Failed</h3>
                          <p className="text-red-700 dark:text-red-200">{result.error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Scanning Tips:</h4>
              <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                <li>• Ensure adequate lighting on your face</li>
                <li>• Remove sunglasses and face coverings</li>
                <li>• Look directly at the camera</li>
                <li>• Hold still during the scanning process</li>
                <li>• If recognition fails, try registering first</li>
                <li>• Email notification will be sent upon successful attendance</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={tryAgain}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/register')}
                className="flex-1"
              >
                Not Registered?
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
