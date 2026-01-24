import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Emmegi S.r.l. <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });
  return response.json();
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  email: string;
  type: "admin_invite" | "password_reset" | "verification";
}

const ADMIN_EMAILS = ["lucafinaldi3@gmail.com", "matviso03@gmail.com", "venturi2005@libero.it"];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, type }: OTPRequest = await req.json();
    
    console.log(`Processing ${type} request for email: ${email}`);

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OTP in database
    const { error: dbError } = await supabase
      .from("user_sessions")
      .upsert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        is_verified: false,
        otp_type: type,
        created_at: new Date().toISOString(),
      }, { onConflict: 'email' });

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error("Errore nel salvataggio del codice");
    }

    let subject = "";
    let htmlContent = "";

    if (type === "admin_invite") {
      subject = "Invito Admin - Emmegi S.r.l.";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">E</div>
          </div>
          <h1 style="color: #1f2937; text-align: center; font-size: 24px; margin-bottom: 10px;">Sei stato invitato come Admin</h1>
          <p style="color: #6b7280; text-align: center; font-size: 16px; margin-bottom: 30px;">Usa questo codice per completare la registrazione su Emmegi S.r.l.</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Il tuo codice di verifica:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</div>
          </div>
          <p style="color: #6b7280; text-align: center; font-size: 14px;">Dopo la verifica, la tua password sarà: <strong>admin26</strong></p>
          <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 30px;">Questo codice scade tra 10 minuti.</p>
        </div>
      `;
    } else if (type === "password_reset") {
      subject = "Reset Password - Emmegi S.r.l.";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">E</div>
          </div>
          <h1 style="color: #1f2937; text-align: center; font-size: 24px; margin-bottom: 10px;">Reset Password</h1>
          <p style="color: #6b7280; text-align: center; font-size: 16px; margin-bottom: 30px;">Hai richiesto di reimpostare la tua password.</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Il tuo codice di verifica:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</div>
          </div>
          <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 30px;">Questo codice scade tra 10 minuti. Se non hai richiesto tu questo reset, ignora questa email.</p>
        </div>
      `;

      // If admin email, send security alert to all admins
      const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());
      if (isAdminEmail) {
        console.log("Admin password reset detected, sending security alerts");
        
        const alertEmails = ADMIN_EMAILS.filter(e => e !== email.toLowerCase());
        for (const adminEmail of alertEmails) {
          await sendEmail(
            adminEmail,
            "⚠️ Tentativo Reset Password Admin - Emmegi S.r.l.",
            `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                  <h2 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Avviso di Sicurezza</h2>
                  <p style="color: #7f1d1d; margin: 0;">Qualcuno sta tentando di cambiare la password dell'account admin:</p>
                  <p style="color: #dc2626; font-weight: bold; margin: 10px 0 0 0;">${email}</p>
                </div>
                <p style="color: #6b7280; font-size: 14px;">Se non sei stato tu, contatta immediatamente gli altri amministratori e verifica la sicurezza dell'account.</p>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">Data e ora: ${new Date().toLocaleString('it-IT')}</p>
              </div>
            `
          );
        }
      }
    } else {
      subject = "Verifica Account - Emmegi S.r.l.";
      htmlContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 28px; font-weight: bold;">E</div>
          </div>
          <h1 style="color: #1f2937; text-align: center; font-size: 24px; margin-bottom: 10px;">Verifica il tuo account</h1>
          <p style="color: #6b7280; text-align: center; font-size: 16px; margin-bottom: 30px;">Usa questo codice per verificare il tuo account Emmegi S.r.l.</p>
          <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Il tuo codice di verifica:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otpCode}</div>
          </div>
          <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 30px;">Questo codice scade tra 10 minuti.</p>
        </div>
      `;
    }

    // Send email
    const emailResponse = await sendEmail(email, subject, htmlContent);

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, message: "OTP inviato con successo" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
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
