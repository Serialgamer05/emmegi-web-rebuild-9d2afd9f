import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().email("Email non valida");
const passwordSchema = z.string()
  .min(6, "La password deve avere almeno 6 caratteri")
  .max(10, "La password deve avere massimo 10 caratteri")
  .regex(/^[a-zA-Z0-9]+$/, "La password deve contenere solo lettere e numeri");

// Admin emails that bypass Google auth
const ADMIN_EMAILS = ["lucafinaldi3@gmail.com", "matviso03@gmail.com"];
const ADMIN_PASSWORD = "admin26";

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { signIn, signUp } = useAuth();

  const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase());

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://emmegi-web-rebuild.vercel.app/',
        }
      });
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile accedere con Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Errore di validazione",
        description: emailResult.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!isAdminEmail) {
      toast({
        title: "Accesso negato",
        description: "Questo login è riservato agli amministratori. Usa Google per accedere.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        if (newAttempts >= 2) {
          setShowResetPassword(true);
          toast({
            title: "Troppi tentativi falliti",
            description: "Puoi resettare la password se l'hai dimenticata.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Credenziali non valide",
            description: "Email o password errati. Riprova.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Accesso effettuato",
          description: "Benvenuto su Emmegi S.r.l.!",
        });
        onBack?.();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Errore",
        description: "Inserisci la tua email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://emmegi-web-rebuild.vercel.app/',
      });
      if (error) throw error;
      
      toast({
        title: "Email inviata",
        description: "Controlla la tua email per resettare la password.",
      });
      setShowResetPassword(false);
      setLoginAttempts(0);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare l'email di reset.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login form
  if (isAdminEmail || (email && ADMIN_EMAILS.some(ae => email.toLowerCase().startsWith(ae.split('@')[0])))) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
              E
            </div>
            <h1 className="text-2xl font-bold">Accesso Amministratore</h1>
            <p className="text-muted-foreground">
              Inserisci le tue credenziali admin
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {showResetPassword ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Inserisci la tua email per ricevere il link di reset password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={handleResetPassword}
                  disabled={isLoading}
                >
                  {isLoading ? "Invio..." : "Invia Link Reset"}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowResetPassword(false);
                    setLoginAttempts(0);
                  }}
                >
                  Torna al login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@esempio.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="• • • • • •"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl py-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Caricamento..." : "Accedi come Admin"}
                </Button>
              </form>
            )}

            <Separator />

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setEmail("")}
              disabled={isLoading}
            >
              ← Non sei admin? Accedi con Google
            </Button>

            {onBack && (
              <Button
                variant="ghost"
                className="w-full"
                onClick={onBack}
                disabled={isLoading}
              >
                ← Torna alla Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular user login with Google
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-bold">Accedi</h1>
          <p className="text-muted-foreground">
            Bentornato su Emmegi S.r.l.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Sign In */}
          <Button
            className="w-full rounded-xl py-6 flex items-center justify-center gap-3"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isLoading ? "Caricamento..." : "Continua con Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Admin login option */}
          <div className="space-y-2">
            <Label htmlFor="admin-email">Email (solo admin)</Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Inserisci l'email admin per accedere con password
            </p>
          </div>

          {onBack && (
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBack}
              disabled={isLoading}
            >
              ← Torna alla Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
