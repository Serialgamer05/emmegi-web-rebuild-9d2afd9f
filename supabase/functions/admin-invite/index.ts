 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 interface InviteRequest {
   email: string;
   inviterName?: string;
 }
 
 const handler = async (req: Request): Promise<Response> => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { email, inviterName }: InviteRequest = await req.json();
     
     console.log(`Processing admin invite for email: ${email}`);
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Generate unique invite token
     const inviteToken = crypto.randomUUID();
     
     // Store invite in database
     const { error: dbError } = await supabase
       .from("user_sessions")
       .upsert({
         email: email.toLowerCase(),
         otp_code: inviteToken,
         is_verified: false,
         otp_type: "admin_invite",
         created_at: new Date().toISOString(),
       }, { onConflict: 'email' });
 
     if (dbError) {
       console.error("Database error:", dbError);
       throw new Error("Errore nel salvataggio dell'invito");
     }
 
     // Build invite URLs - use the app URL
     const appUrl = req.headers.get("origin") || "https://id-preview--9cef205d-711d-44a0-bc0a-ecb469ce5528.lovable.app";
     const acceptUrl = `${appUrl}/admin-invite?token=${inviteToken}&email=${encodeURIComponent(email)}&action=accept`;
     const declineUrl = `${appUrl}/admin-invite?token=${inviteToken}&email=${encodeURIComponent(email)}&action=decline`;
 
      // Send invite email with clickable links
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Emmegi S.r.l. <onboarding@resend.dev>",
          to: [email],
          subject: "🔐 Invito Admin - Emmegi S.r.l.",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                          <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 20px; display: inline-block; line-height: 80px; color: white; font-size: 36px; font-weight: bold;">E</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 10px 40px; text-align: center;">
                          <h1 style="color: #1f2937; font-size: 28px; margin: 0;">Ciao!</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 30px 40px; text-align: center;">
                          <p style="color: #6b7280; font-size: 18px; margin: 0;">
                            ${inviterName ? `<strong>${inviterName}</strong> ti ha invitato come` : 'Sei stato invitato come'} <span style="color: #3b82f6; font-weight: bold;">Admin</span> su Emmegi S.r.l.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 30px 40px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 16px;">
                            <tr>
                              <td style="padding: 30px; text-align: center;">
                                <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">Vuoi accettare questo invito?</p>
                                <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                  <tr>
                                    <td style="padding-right: 10px;">
                                      <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">✓ Sì, accetto</a>
                                    </td>
                                    <td style="padding-left: 10px;">
                                      <a href="${declineUrl}" style="display: inline-block; background: #e5e7eb; color: #6b7280; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">✗ No, rifiuto</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 20px 40px;">
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 12px;">
                            <tr>
                              <td style="padding: 20px; text-align: center;">
                                <p style="color: #1e40af; margin: 0; font-size: 14px;">
                                  <strong>Nota:</strong> Se accetti, la tua password iniziale sarà: <code style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-weight: bold;">admin26</code>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 0 40px 20px 40px; text-align: center;">
                          <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            Se i bottoni non funzionano, copia e incolla questi link:
                          </p>
                          <p style="color: #3b82f6; font-size: 11px; word-break: break-all; margin: 10px 0 5px 0;">
                            <strong>Accetta:</strong> ${acceptUrl}
                          </p>
                          <p style="color: #6b7280; font-size: 11px; word-break: break-all; margin: 0;">
                            <strong>Rifiuta:</strong> ${declineUrl}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px 40px 40px 40px; text-align: center;">
                          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            Questo invito scade tra 24 ore. Se non hai richiesto tu questo invito, puoi ignorare questa email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `,
        }),
      });
 
     const emailResult = await emailResponse.json();
     console.log("Email sent:", emailResult);
 
     return new Response(
       JSON.stringify({ success: true, message: "Invito inviato con successo" }),
       {
         status: 200,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       }
     );
   } catch (error: any) {
     console.error("Error in admin-invite function:", error);
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