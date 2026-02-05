 import { useEffect, useState } from "react";
 import { useSearchParams } from "react-router-dom";
 import { Card, CardContent, CardHeader } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { supabase } from "@/integrations/supabase/client";
 import { CheckCircle, XCircle, Loader2, Copy, Check, Shield } from "lucide-react";
 import { toast } from "@/hooks/use-toast";
 
 interface AdminInvitePageProps {
   onNavigateHome: () => void;
 }
 
 const AdminInvitePage = ({ onNavigateHome }: AdminInvitePageProps) => {
   const [searchParams] = useSearchParams();
   const [status, setStatus] = useState<"loading" | "accepted" | "declined" | "error">("loading");
   const [errorMessage, setErrorMessage] = useState("");
   const [password, setPassword] = useState("");
   const [copied, setCopied] = useState(false);
 
   const token = searchParams.get("token");
   const email = searchParams.get("email");
   const action = searchParams.get("action") as "accept" | "decline" | null;
 
   useEffect(() => {
     if (!token || !email || !action) {
       setStatus("error");
       setErrorMessage("Link non valido. Parametri mancanti.");
       return;
     }
 
     const processInvite = async () => {
       try {
         const response = await supabase.functions.invoke("confirm-admin-invite", {
           body: { token, email, action },
         });
 
         if (response.error) {
           throw new Error(response.error.message);
         }
 
         if (!response.data?.success) {
           throw new Error(response.data?.error || "Errore sconosciuto");
         }
 
         if (response.data.action === "accepted") {
           setStatus("accepted");
           setPassword(response.data.defaultPassword || "admin26");
         } else {
           setStatus("declined");
         }
       } catch (error: any) {
         console.error("Error processing invite:", error);
         setStatus("error");
         setErrorMessage(error.message || "Errore durante l'elaborazione dell'invito");
       }
     };
 
     processInvite();
   }, [token, email, action]);
 
   const handleCopyPassword = () => {
     navigator.clipboard.writeText(password);
     setCopied(true);
     toast({
       title: "Password copiata",
       description: "La password è stata copiata negli appunti.",
     });
     setTimeout(() => setCopied(false), 2000);
   };
 
   if (status === "loading") {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
           <CardContent className="p-8 text-center">
             <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
             <p className="text-muted-foreground">Elaborazione in corso...</p>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   if (status === "error") {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
           <CardHeader className="text-center pb-2">
             <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
               <XCircle className="h-8 w-8 text-destructive" />
             </div>
             <h1 className="text-2xl font-semibold">Errore</h1>
           </CardHeader>
           <CardContent className="text-center space-y-4">
             <p className="text-muted-foreground">{errorMessage}</p>
             <Button onClick={onNavigateHome} className="rounded-2xl">
               Torna alla Home
             </Button>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   if (status === "declined") {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center p-4">
         <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
           <CardHeader className="text-center pb-2">
             <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
               <XCircle className="h-8 w-8 text-muted-foreground" />
             </div>
             <h1 className="text-2xl font-semibold">Invito Rifiutato</h1>
           </CardHeader>
           <CardContent className="text-center space-y-4">
             <p className="text-muted-foreground">
               Hai rifiutato l'invito come admin.<br />
               Gli amministratori sono stati notificati.
             </p>
             <Button onClick={onNavigateHome} className="rounded-2xl">
               Torna alla Home
             </Button>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   // Accepted
   return (
     <div className="min-h-screen bg-background flex items-center justify-center p-4">
       <Card className="w-full max-w-md rounded-3xl shadow-xl border-0">
         <CardHeader className="text-center pb-2">
           <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
             <CheckCircle className="h-8 w-8 text-green-500" />
           </div>
           <h1 className="text-2xl font-semibold text-green-600">Admin Approvato!</h1>
         </CardHeader>
         <CardContent className="space-y-6">
           <p className="text-center text-muted-foreground">
             Benvenuto nel team admin di Emmegi S.r.l.!<br />
             Ecco le tue credenziali di accesso:
           </p>
           
           <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground">Email:</span>
               <span className="font-medium">{email}</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground">Password:</span>
               <div className="flex items-center gap-2">
                 <code className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-mono font-bold">
                   {password}
                 </code>
                 <Button
                   variant="ghost"
                   size="icon"
                   onClick={handleCopyPassword}
                   className="h-8 w-8 rounded-full"
                 >
                   {copied ? (
                     <Check className="h-4 w-4 text-green-500" />
                   ) : (
                     <Copy className="h-4 w-4" />
                   )}
                 </Button>
               </div>
             </div>
           </div>
           
           <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
             <div className="flex items-start gap-3">
               <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-amber-800 dark:text-amber-200">
                 <strong>Importante:</strong> Potrai cambiare la password dalle Impostazioni dopo il login.
               </p>
             </div>
           </div>
 
           <Button 
             onClick={onNavigateHome} 
             className="w-full rounded-2xl py-6"
           >
             Vai al Login
           </Button>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default AdminInvitePage;