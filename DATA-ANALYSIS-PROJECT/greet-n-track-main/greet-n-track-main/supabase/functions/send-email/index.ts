
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, userId }: EmailRequest = await req.json();
    
    console.log(`Sending email to: ${to}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Attendance System <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Attendance Confirmation</h2>
          <p>${message}</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>✓ Your attendance has been successfully recorded</strong>
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message from the Facial Recognition Attendance System.
          </p>
        </div>
      `,
    });

    if (emailResponse.error) {
      throw new Error(`Resend error: ${emailResponse.error.message}`);
    }

    console.log("Email sent successfully:", emailResponse);

    // Log the email in the database
    const { error: logError } = await supabase
      .from('email_logs')
      .insert({
        user_id: userId,
        email_address: to,
        subject: subject,
        message: message,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

    if (logError) {
      console.error("Error logging email:", logError);
      // Don't throw error for logging failure
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    
    // Try to log the failed email attempt
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const body = await req.clone().json();
      
      await supabase
        .from('email_logs')
        .insert({
          user_id: body.userId,
          email_address: body.to,
          subject: body.subject,
          message: body.message,
          status: 'failed',
          error_message: error.message
        });
    } catch (logError) {
      console.error("Error logging failed email:", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
