
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, User, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { faceDetectionService } from "@/services/faceDetection";
import Camera from "@/components/Camera";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [faceData, setFaceData] = useState<{
    imageData: string;
    descriptor: number[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingFace, setIsProcessingFace] = useState(false);

  const handleFaceCapture = async (imageData: string) => {
    setIsProcessingFace(true);
    
    try {
      // Load and process the captured image
      const image = await faceDetectionService.loadImageFromDataUrl(imageData);
      const descriptor = await faceDetectionService.extractFaceDescriptor(image);
      
      setFaceData({
        imageData,
        descriptor
      });
      
      toast({
        title: "Face Captured Successfully!",
        description: "Your facial data has been processed and is ready for registration.",
      });
    } catch (error) {
      console.error('Face processing error:', error);
      toast({
        title: "Face Processing Failed",
        description: "Please ensure your face is clearly visible and try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFace(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (!faceData) {
      toast({
        title: "Face Capture Required",
        description: "Please capture your face before registering.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Update user profile with face data
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          face_encoding: JSON.stringify(faceData.descriptor),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Registration Successful!",
        description: "Your face has been encoded and saved for attendance tracking.",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: "Please try again or contact support if the problem persists.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => navigate('/')} className="p-2 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Registration</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl dark:text-white">Register for Face Recognition</CardTitle>
            <CardDescription className="dark:text-gray-300">
              Capture your photo and enter personal details to enable facial recognition attendance
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Camera Section */}
              <div className="space-y-2">
                <Label className="dark:text-gray-200">Face Capture</Label>
                <div className="aspect-video">
                  <Camera
                    onCapture={handleFaceCapture}
                    className="w-full h-full"
                  />
                </div>

                {isProcessingFace && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p className="text-blue-700 dark:text-blue-200 text-sm font-medium">
                        Processing facial data...
                      </p>
                    </div>
                  </div>
                )}

                {faceData && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <p className="text-green-700 dark:text-green-200 text-sm font-medium">
                        Face captured and processed successfully!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-gray-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="dark:text-gray-200">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                size="lg"
                disabled={isLoading || isProcessingFace}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registering...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Register
                  </div>
                )}
              </Button>
            </form>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Important Notes:</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Ensure your face is clearly visible and well-lit</li>
                <li>• Remove sunglasses or face coverings if possible</li>
                <li>• Hold still during the capture process</li>
                <li>• Your data is encrypted and stored securely</li>
                <li>• SMS notifications will be sent to your phone number</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
