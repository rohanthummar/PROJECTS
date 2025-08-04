
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { faceDetectionService } from '@/services/faceDetection';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  user_id: string;
  timestamp: string;
  confidence_score: number;
  status: string;
  profiles: {
    name: string;
    phone: string;
  };
}

export const useAttendance = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const markAttendance = async (imageElement: HTMLImageElement) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting face recognition process...');
      
      // Extract face descriptor from captured image
      const faceDescriptor = await faceDetectionService.extractFaceDescriptor(imageElement);
      console.log('Face descriptor extracted:', faceDescriptor.length, 'features');
      
      // Get all registered users with face encodings
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, name, phone, face_encoding')
        .not('face_encoding', 'is', null);
      
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw new Error('Failed to fetch registered users');
      }
      
      if (!users || users.length === 0) {
        throw new Error('No registered users found. Please register first.');
      }
      
      console.log(`Comparing against ${users.length} registered users...`);
      
      // Convert stored face encodings back to arrays and find best match
      const knownDescriptors = users.map(user => ({
        id: user.id,
        name: user.name || 'Unknown',
        descriptor: JSON.parse(user.face_encoding),
        phone: user.phone
      }));
      
      const bestMatch = await faceDetectionService.findBestMatch(
        faceDescriptor, 
        knownDescriptors, 
        0.6 // Threshold for face matching
      );
      
      if (!bestMatch) {
        throw new Error('Face not recognized. Please ensure you are registered or try again with better lighting.');
      }
      
      console.log('Face recognized:', bestMatch.name, 'with confidence:', bestMatch.confidence);
      
      // Record attendance in database
      const { data: attendanceRecord, error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          user_id: bestMatch.id,
          confidence_score: bestMatch.confidence,
          status: 'present'
        })
        .select('*, profiles(name, phone)')
        .single();
      
      if (attendanceError) {
        console.error('Error recording attendance:', attendanceError);
        throw new Error('Failed to record attendance');
      }
      
      // Get user's email for notification
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user?.email) {
        try {
          await sendEmailNotification(bestMatch.id, bestMatch.name, authUser.user.email);
        } catch (emailError) {
          console.error('Email notification failed:', emailError);
          // Don't throw error for email failure - attendance is still recorded
        }
      }
      
      toast({
        title: "Attendance Marked Successfully!",
        description: `Welcome ${bestMatch.name}! Confidence: ${bestMatch.confidence.toFixed(1)}%`,
      });
      
      return {
        success: true,
        user: bestMatch,
        record: attendanceRecord
      };
      
    } catch (error) {
      console.error('Attendance marking failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Attendance Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsProcessing(false);
    }
  };
  
  const sendEmailNotification = async (userId: string, userName: string, emailAddress: string) => {
    try {
      const subject = 'Attendance Confirmation';
      const message = `Hello ${userName}! Your attendance has been marked successfully at ${new Date().toLocaleTimeString()}.`;
      
      // Call email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailAddress,
          subject: subject,
          message: message,
          userId: userId
        }
      });
      
      if (error) {
        console.error('Email function error:', error);
        throw new Error('Failed to send email notification');
      }
      
      console.log('Email sent successfully:', data);
    } catch (error) {
      console.error('Email notification error:', error);
      throw error;
    }
  };
  
  return {
    markAttendance,
    isProcessing
  };
};
