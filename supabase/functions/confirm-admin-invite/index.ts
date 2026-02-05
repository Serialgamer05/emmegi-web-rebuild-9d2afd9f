 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
 const DEFAULT_ADMIN_PASSWORD = "admin26";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 const ADMIN_EMAILS = ["lucafinaldi3@gmail.com", "matviso03@gmail.com", "venturi2005@libero.it"];
 
 interface ConfirmRequest {
   token: string;
   email: string;
   action: "accept" | "decline";
 }
 
 const handler = async (req: Request): Promise<Response> => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { token, email, action }: ConfirmRequest = await req.json();
     
     console.log(`Processing admin invite confirmation: ${action} for ${email}`);
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
     const supabase = createClient(supabaseUrl, supabaseKey);
 
     // Verify token
     const { data: session, error: sessionError } = await supabase
       .from("user_sessions")
       .select("*")
       .eq("email", email.toLowerCase())
       .eq("otp_code", token)
       .eq("otp_type", "admin_invite")
       .single();
 
     if (sessionError || !session) {
       return new Response(
         JSON.stringify({ success: false, error: "Token non valido o scaduto" }),
         {
           status: 400,
           headers: { "Content-Type": "application/json", ...corsHeaders },
         }
       );
     }
 
     // Check if invite expired (24 hours)
     const createdAt = new Date(session.created_at);
     const now = new Date();
     const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
     
     if (diffHours > 24) {
       return new Response(
         JSON.stringify({ success: false, error: "Invito scaduto" }),
         {
           status: 400,
           headers: { "Content-Type": "application/json", ...corsHeaders },
         }
       );
     }
 
     if (action === "decline") {
       // Remove the invite session
       await supabase
         .from("user_sessions")
         .delete()
         .eq("email", email.toLowerCase())
         .eq("otp_type", "admin_invite");
 
       // Notify existing admins
       for (const adminEmail of ADMIN_EMAILS) {
         await fetch("https://api.resend.com/emails", {
           method: "POST",
           headers: {
             "Authorization": `Bearer ${RESEND_API_KEY}`,
             "Content-Type": "application/json",
           },
           body: JSON.stringify({
             from: "Emmegi S.r.l. <onboarding@resend.dev>",
             to: [adminEmail],
             subject: "❌ Invito Admin Rifiutato - Emmegi S.r.l.",
             html: `
               <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                 <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; text-align: center;">
                   <h2 style="color: #dc2626; margin: 0 0 10px 0;">Admin non approvato</h2>
                   <p style="color: #7f1d1d; margin: 0;">L'utente <strong>${email}</strong> ha rifiutato l'invito admin.</p>
                 </div>
               </div>
             `,
           }),
         });
       }
 
       return new Response(
         JSON.stringify({ success: true, action: "declined", message: "Invito rifiutato" }),
         {
           status: 200,
           headers: { "Content-Type": "application/json", ...corsHeaders },
         }
       );
     }
 
     // Accept the invite
     // First, create user with email/password if not exists
     let userId: string | null = null;
     
     // Check if user already exists
     const { data: existingUsers } = await supabase.auth.admin.listUsers();
     const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
     
     if (existingUser) {
       userId = existingUser.id;
       // Update password for existing user
       await supabase.auth.admin.updateUserById(userId, {
         password: DEFAULT_ADMIN_PASSWORD
       });
     } else {
       // Create new user
       const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
         email: email.toLowerCase(),
         password: DEFAULT_ADMIN_PASSWORD,
         email_confirm: true,
       });
       
       if (createError) {
         console.error("Error creating user:", createError);
         throw new Error("Errore nella creazione dell'account");
       }
       
       userId = newUser.user?.id || null;
     }
 
     if (!userId) {
       throw new Error("Impossibile ottenere l'ID utente");
     }
 
     // Assign admin role
     const { error: roleError } = await supabase
       .from("user_roles")
       .upsert({
         user_id: userId,
         role: "admin",
       }, { onConflict: 'user_id' });
 
     if (roleError) {
       console.error("Error assigning role:", roleError);
     }
 
     // Mark invite as verified
     await supabase
       .from("user_sessions")
       .update({ is_verified: true })
       .eq("email", email.toLowerCase())
       .eq("otp_type", "admin_invite");
 
     // Notify existing admins
     for (const adminEmail of ADMIN_EMAILS) {
       await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${RESEND_API_KEY}`,
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           from: "Emmegi S.r.l. <onboarding@resend.dev>",
           to: [adminEmail],
           subject: "✅ Nuovo Admin Approvato - Emmegi S.r.l.",
           html: `
             <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
               <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center;">
                 <h2 style="color: #16a34a; margin: 0 0 10px 0;">Admin approvato</h2>
                 <p style="color: #166534; margin: 0;">L'utente <strong>${email}</strong> ha accettato l'invito ed è ora un admin.</p>
               </div>
             </div>
           `,
         }),
       });
     }
 
     return new Response(
       JSON.stringify({ 
         success: true, 
         action: "accepted", 
         message: "Admin approvato",
         defaultPassword: DEFAULT_ADMIN_PASSWORD 
       }),
       {
         status: 200,
         headers: { "Content-Type": "application/json", ...corsHeaders },
       }
     );
   } catch (error: any) {
     console.error("Error in confirm-admin-invite function:", error);
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