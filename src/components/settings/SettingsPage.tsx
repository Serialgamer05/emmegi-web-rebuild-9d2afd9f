import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, LogOut, LogIn, Mail, Phone, MapPin, Key, Shield, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

interface SettingsPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  userEmail?: string;
  onLogout: () => void;
  onNavigate: (page: string) => void;
}

const SettingsPage = ({ isLoggedIn, onLogin, userEmail, onLogout, onNavigate }: SettingsPageProps) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { isAdmin } = useAuth();

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(!isDarkMode);
  };

  const handleNavigate = (page: string) => {
    if (page === "logout") {
      onLogout();
    } else if (page === "login") {
      onLogin();
    } else {
      onNavigate(page);
    }
    setIsSidebarOpen(false);
  };

  const handleSendOtp = async () => {
    if (!userEmail) return;

    setIsResetting(true);
    try {
      const response = await supabase.functions.invoke('send-otp', {
        body: { 
          email: userEmail.toLowerCase(),
          type: "password_reset"
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
      setIsResetting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpValue.length !== 6 || !userEmail) {
      toast({
        title: "Errore",
        description: "Inserisci il codice completo a 6 cifre.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const response = await supabase.functions.invoke('verify-otp', {
        body: { 
          email: userEmail.toLowerCase(),
          otp: otpValue,
          type: "password_reset"
        }
      });

      if (response.error || !response.data?.success) {
        throw new Error(response.data?.error || "Verifica fallita");
      }

      toast({
        title: "Verifica completata",
        description: "Ora puoi impostare la nuova password.",
      });
      setIsVerified(true);
      setShowOtpVerification(false);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Codice OTP non valido.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6 || newPassword.length > 10) {
      toast({
        title: "Errore",
        description: "La password deve essere tra 6 e 10 caratteri.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[a-zA-Z0-9]+$/.test(newPassword)) {
      toast({
        title: "Errore",
        description: "La password deve contenere solo lettere e numeri.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password aggiornata",
        description: "La tua password è stata cambiata con successo.",
      });
      setShowResetPassword(false);
      setIsVerified(false);
      setNewPassword("");
      setConfirmPassword("");
      setOtpValue("");
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile aggiornare la password.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const resetPasswordFlow = () => {
    setShowResetPassword(false);
    setShowOtpVerification(false);
    setIsVerified(false);
    setNewPassword("");
    setConfirmPassword("");
    setOtpValue("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage="settings"
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
      />

      <main className="p-4 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">Impostazioni</h1>
        </div>

        {/* Account section */}
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {userEmail?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{userEmail}</p>
                    <p className="text-sm text-muted-foreground">Account attivo</p>
                  </div>
                </div>

                {/* Reset Password Section */}
                {!showResetPassword && !showOtpVerification && !isVerified ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl py-6 justify-between"
                    onClick={() => {
                      setShowResetPassword(true);
                      handleSendOtp();
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Cambia Password
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : showOtpVerification ? (
                  <div className="space-y-4 p-4 border rounded-2xl">
                    <div className="text-center">
                      <h3 className="font-semibold mb-1">Verifica OTP</h3>
                      <p className="text-sm text-muted-foreground">
                        Inserisci il codice a 6 cifre inviato a {userEmail}
                      </p>
                    </div>
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl"
                        onClick={resetPasswordFlow}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Annulla
                      </Button>
                      <Button
                        className="flex-1 rounded-2xl"
                        onClick={handleVerifyOtp}
                        disabled={isResetting || otpValue.length !== 6}
                      >
                        {isResetting ? "Verifica..." : "Verifica"}
                      </Button>
                    </div>
                    <button
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={handleSendOtp}
                      disabled={isResetting}
                    >
                      Non hai ricevuto il codice? <span className="text-primary font-medium">Rinvia</span>
                    </button>
                  </div>
                ) : isVerified ? (
                  <div className="space-y-3 p-4 border rounded-2xl">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-6 w-6 text-green-500" />
                      </div>
                      <h3 className="font-semibold">Verifica completata</h3>
                      <p className="text-sm text-muted-foreground">Imposta la nuova password</p>
                    </div>
                    <div>
                      <Label htmlFor="newPassword" className="text-sm font-medium">Nuova Password (6-10 caratteri alfanumerici)</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nuova password"
                        maxLength={10}
                        className="rounded-2xl mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium">Conferma Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Conferma password"
                        maxLength={10}
                        className="rounded-2xl mt-1"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1 rounded-2xl"
                        onClick={resetPasswordFlow}
                      >
                        Annulla
                      </Button>
                      <Button
                        className="flex-1 rounded-2xl"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                      >
                        {isResetting ? "Salvataggio..." : "Salva"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <Button
                  variant="outline"
                  className="w-full rounded-2xl py-6 justify-between text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={onLogout}
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    Esci
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Accedi per gestire il tuo account.
                </p>
                <Button className="w-full rounded-2xl py-6" onClick={onLogin}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Accedi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isDarkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
              Aspetto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl">
              <div className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Modalità Scura</p>
                  <p className="text-sm text-muted-foreground">
                    {isDarkMode ? "Attiva" : "Disattiva"}
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Company info */}
        <Card className="rounded-3xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Emmegi S.r.l.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="tel:+390444317185"
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl text-foreground hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block font-medium">+39 0444 317185</span>
                <span className="text-sm text-muted-foreground">Tel. / Fax</span>
              </div>
            </a>

            <a
              href="mailto:Venturi2005@libero.it"
              className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl text-foreground hover:bg-muted/50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">Venturi2005@libero.it</span>
            </a>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block font-medium">Via dell'Industria, 12</span>
                <span className="text-sm text-muted-foreground">36010 Cavazzale di Monticello Conte Otto (VI)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App version */}
        <div className="text-center text-sm text-muted-foreground pt-4 pb-8">
          <p>Emmegi S.r.l. App v1.0</p>
          <p className="mt-1">© 2026 Tutti i diritti riservati</p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
