import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  email: string;
  otp: string;
  type: "admin_invite" | "password_reset" | "verification";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, type }: VerifyRequest = await req.json();
    
    console.log(`Verifying OTP for email: ${email}, type: ${type}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check OTP
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("otp_code", otp)
      .eq("otp_type", type)
      .single();

    if (error || !data) {
      console.log("OTP verification failed:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Codice OTP non valido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP is expired (10 minutes)
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (diffMinutes > 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Codice OTP scaduto" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Mark as verified
    await supabase
      .from("user_sessions")
      .update({ is_verified: true })
      .eq("email", email.toLowerCase());

    // If admin invite, mark in database for later role assignment
    if (type === "admin_invite") {
      console.log("Admin invite verified, role will be assigned on first login");
      // The role will be assigned when the user logs in with the verified email
    }

    console.log("OTP verified successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Verifica completata" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
