import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft, Mail, Lock, Shield, ChevronRight } from "lucide-react";

const emailSchema = z.string().email("Email non valida");
const passwordSchema = z.string()
  .min(6, "La password deve avere almeno 6 caratteri")
  .max(10, "La password deve avere massimo 10 caratteri")
  .regex(/^[a-zA-Z0-9]+$/, "La password deve contenere solo lettere e numeri");

// Admin emails that require password login
const ADMIN_EMAILS = ["lucafinaldi3@gmail.com", "matviso03@gmail.com", "venturi2005@libero.it"];
const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_STORAGE_KEY = "admin_lockout_";

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [resetType, setResetType] = useState<"password_reset" | "verification">("password_reset");
  const { signIn } = useAuth();

  const isAdminEmail = ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());

  // Check if admin is locked out on email change
  useEffect(() => {
    if (isAdminEmail) {
      const lockoutData = localStorage.getItem(LOCKOUT_STORAGE_KEY + email.toLowerCase());
      if (lockoutData) {
        const { locked, attempts } = JSON.parse(lockoutData);
        setIsLockedOut(locked);
        setLoginAttempts(attempts);
      } else {
        setIsLockedOut(false);
        setLoginAttempts(0);
      }
    }
  }, [email, isAdminEmail]);

  const updateLockoutStatus = (attempts: number, locked: boolean) => {
    localStorage.setItem(
      LOCKOUT_STORAGE_KEY + email.toLowerCase(),
      JSON.stringify({ attempts, locked, timestamp: Date.now() })
    );
    setLoginAttempts(attempts);
    setIsLockedOut(locked);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });
      if (error) {
        toast({
          title: "Errore",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
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
    
    // Check if locked out
    if (isLockedOut) {
      toast({
        title: "Account bloccato",
        description: "Troppi tentativi falliti. Accedi con Google o reimposta la password.",
        variant: "destructive",
      });
      return;
    }
    
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
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          updateLockoutStatus(newAttempts, true);
          toast({
            title: "Account bloccato",
            description: "Troppi tentativi falliti. Usa Google per accedere o reimposta la password.",
            variant: "destructive",
          });
        } else {
          updateLockoutStatus(newAttempts, false);
          toast({
            title: "Credenziali non valide",
            description: `Email o password errati. Tentativo ${newAttempts}/${MAX_LOGIN_ATTEMPTS}.`,
            variant: "destructive",
          });
        }
      } else {
        // Reset lockout on successful login
        localStorage.removeItem(LOCKOUT_STORAGE_KEY + email.toLowerCase());
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

  const handleSendOtp = async () => {
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
      const response = await supabase.functions.invoke('send-otp', {
        body: { 
          email: email.toLowerCase(),
          type: resetType
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Codice inviato",
        description: "Controlla la tua email per il codice OTP.",
      });
      setShowOtpVerification(true);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile inviare il codice OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6) {
      toast({
        title: "Errore",
        description: "Inserisci il codice completo a 6 cifre.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('verify-otp', {
        body: { 
          email: email.toLowerCase(),
          otp: otpValue,
          type: resetType
        }
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Verifica fallita");
      }

      toast({
        title: "Verifica completata",
        description: "Ora puoi impostare la nuova password.",
      });
      
      // Show new password form
      setShowOtpVerification(false);
      setShowNewPassword(true);
      setOtpValue("");
      
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Codice OTP non valido.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetNewPassword = async () => {
    // Validate password
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast({
        title: "Errore di validazione",
        description: passwordResult.error.issues[0].message,
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non coincidono.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update password in Supabase
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Reset lockout status
      localStorage.removeItem(LOCKOUT_STORAGE_KEY + email.toLowerCase());
      
      toast({
        title: "Password aggiornata",
        description: "La tua password è stata reimpostata con successo.",
      });
      
      // Reset all states
      setShowNewPassword(false);
      setShowResetPassword(false);
      setNewPassword("");
      setConfirmPassword("");
      setLoginAttempts(0);
      setIsLockedOut(false);
      
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare la password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification Screen
  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Verifica OTP</h1>
            <p className="text-muted-foreground text-sm">
              Inserisci il codice a 6 cifre inviato a<br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="flex justify-center">
              <InputOTP
                value={otpValue}
                onChange={setOtpValue}
                maxLength={6}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="rounded-xl" />
                  <InputOTPSlot index={1} className="rounded-xl" />
                  <InputOTPSlot index={2} className="rounded-xl" />
                  <InputOTPSlot index={3} className="rounded-xl" />
                  <InputOTPSlot index={4} className="rounded-xl" />
                  <InputOTPSlot index={5} className="rounded-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full rounded-2xl py-6 font-medium"
              onClick={handleVerifyOtp}
              disabled={isLoading || otpValue.length !== 6}
            >
              {isLoading ? "Verifica..." : "Verifica Codice"}
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleSendOtp}
                disabled={isLoading}
              >
                Non hai ricevuto il codice? <span className="text-primary font-medium">Rinvia</span>
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full rounded-2xl"
              onClick={() => {
                setShowOtpVerification(false);
                setOtpValue("");
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna indietro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset Password Screen
  if (showResetPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Mail className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              Ti invieremo un codice di verifica via email
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl pl-12 py-6"
                  placeholder="La tua email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              className="w-full rounded-2xl py-6 font-medium"
              onClick={handleSendOtp}
              disabled={isLoading}
            >
              {isLoading ? "Invio..." : "Invia Codice OTP"}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              className="w-full rounded-2xl"
              onClick={() => {
                setShowResetPassword(false);
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna al login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // New Password Screen (after OTP verification)
  if (showNewPassword) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Lock className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Nuova Password</h1>
            <p className="text-muted-foreground text-sm">
              Imposta la tua nuova password (6-10 caratteri alfanumerici)
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-medium">Nuova Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  placeholder="• • • • • •"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-2xl pl-12 py-6"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-medium">Conferma Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="• • • • • •"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-2xl pl-12 py-6"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              className="w-full rounded-2xl py-6 font-medium"
              onClick={handleSetNewPassword}
              disabled={isLoading || !newPassword || !confirmPassword}
            >
              {isLoading ? "Aggiornamento..." : "Imposta Password"}
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>

            <Button
              variant="ghost"
              className="w-full rounded-2xl"
              onClick={() => {
                setShowNewPassword(false);
                setNewPassword("");
                setConfirmPassword("");
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annulla
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin login form - Show lockout screen if locked
  if (isAdminEmail && isLockedOut) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 text-destructive-foreground rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Account Bloccato</h1>
            <p className="text-muted-foreground text-sm">
              Troppi tentativi di accesso falliti.<br />
              Usa Google per accedere o reimposta la password.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Google Sign In */}
            <Button
              className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 bg-card border-2 border-border text-foreground hover:bg-muted"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">{isLoading ? "Caricamento..." : "Continua con Google"}</span>
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">oppure</span>
              </div>
            </div>

            <div className="text-center">
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setShowResetPassword(true);
                  setResetType("password_reset");
                }}
              >
                Hai dimenticato la password? <span className="text-primary font-medium">Reimposta</span>
              </button>
            </div>

            <Separator />

            <Button
              variant="ghost"
              className="w-full rounded-2xl"
              onClick={() => setEmail("")}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambia account
            </Button>

            {onBack && (
              <Button
                variant="ghost"
                className="w-full rounded-2xl text-muted-foreground"
                onClick={onBack}
                disabled={isLoading}
              >
                Torna alla Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin login form - Normal login
  if (isAdminEmail) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
              E
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Accesso Admin</h1>
            <p className="text-muted-foreground text-sm">
              Inserisci le tue credenziali
            </p>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-2xl pl-12 py-6"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="• • • • • •"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-2xl pl-12 py-6"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              {loginAttempts > 0 && (
                <p className="text-sm text-destructive text-center">
                  Tentativi falliti: {loginAttempts}/{MAX_LOGIN_ATTEMPTS}
                </p>
              )}
              
              <Button
                type="submit"
                className="w-full rounded-2xl py-6 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Caricamento..." : "Accedi"}
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </form>

            <div className="text-center">
              <button
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  setShowResetPassword(true);
                  setResetType("password_reset");
                }}
              >
                Hai dimenticato la password? <span className="text-primary font-medium">Reimposta</span>
              </button>
            </div>

            <Separator />

            {/* Google Sign In for Admin */}
            <Button
              className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 bg-card border-2 border-border text-foreground hover:bg-muted"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium">Oppure accedi con Google</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full rounded-2xl"
              onClick={() => setEmail("")}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Non sei admin? Cambia account
            </Button>

            {onBack && (
              <Button
                variant="ghost"
                className="w-full rounded-2xl text-muted-foreground"
                onClick={onBack}
                disabled={isLoading}
              >
                Torna alla Home
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Regular user login with Google - iOS style
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl shadow-xl border-0 bg-card">
        <CardHeader className="text-center space-y-3 pb-2">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Accedi</h1>
          <p className="text-muted-foreground text-sm">
            Bentornato su Emmegi S.r.l.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {/* Google Sign In - iOS style */}
          <Button
            className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 bg-card border-2 border-border text-foreground hover:bg-muted"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">{isLoading ? "Caricamento..." : "Continua con Google"}</span>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">oppure</span>
            </div>
          </div>

          {/* Admin login hint */}
          <div className="space-y-3">
            <p className="text-xs text-center text-muted-foreground">
              Sei un amministratore? Inserisci la tua email admin
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl pl-12 py-6"
                disabled={isLoading}
              />
            </div>
          </div>

          {onBack && (
            <Button
              variant="ghost"
              className="w-full rounded-2xl text-muted-foreground"
              onClick={onBack}
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
