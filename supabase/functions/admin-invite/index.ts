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
 
     // Send invite email
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
           <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
             <div style="text-align: center; margin-bottom: 30px;">
               <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 36px; font-weight: bold;">E</div>
             </div>
             
             <h1 style="color: #1f2937; text-align: center; font-size: 28px; margin-bottom: 10px;">Ciao!</h1>
             <p style="color: #6b7280; text-align: center; font-size: 18px; margin-bottom: 30px;">
               ${inviterName ? `<strong>${inviterName}</strong> ti ha invitato come` : 'Sei stato invitato come'} <span style="color: #3b82f6; font-weight: bold;">Admin</span> su Emmegi S.r.l.
             </p>
             
             <div style="background: #f9fafb; border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
               <p style="color: #4b5563; margin: 0 0 20px 0; font-size: 16px;">Vuoi accettare questo invito?</p>
               
               <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                 <a href="${acceptUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
                   ✓ Sì, accetto
                 </a>
                 <a href="${declineUrl}" style="display: inline-block; background: #e5e7eb; color: #6b7280; padding: 14px 40px; border-radius: 30px; text-decoration: none; font-weight: 600; font-size: 16px;">
                   ✗ No, rifiuto
                 </a>
               </div>
             </div>
             
             <div style="background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
               <p style="color: #1e40af; margin: 0; font-size: 14px; text-align: center;">
                 <strong>Nota:</strong> Se accetti, la tua password iniziale sarà: <code style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-weight: bold;">admin26</code>
               </p>
             </div>
             
             <p style="color: #9ca3af; text-align: center; font-size: 12px; margin-top: 30px;">
               Questo invito scade tra 24 ore. Se non hai richiesto tu questo invito, puoi ignorare questa email.
             </p>
           </div>
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