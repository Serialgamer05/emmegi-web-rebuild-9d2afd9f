import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, LogOut, LogIn, Mail, Phone, MapPin, Key } from "lucide-react";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
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
      setNewPassword("");
      setConfirmPassword("");
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Account</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {userEmail?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{userEmail}</p>
                    <p className="text-sm text-muted-foreground">Account attivo</p>
                  </div>
                </div>

                {/* Reset Password Section */}
                {!showResetPassword ? (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => setShowResetPassword(true)}
                  >
                    <Key className="h-4 w-4 mr-2" />
                    Cambia Password
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border rounded-xl">
                    <div>
                      <Label htmlFor="newPassword">Nuova Password (6-10 caratteri alfanumerici)</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nuova password"
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Conferma Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Conferma password"
                        maxLength={10}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setShowResetPassword(false);
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      >
                        Annulla
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleResetPassword}
                        disabled={isResetting}
                      >
                        {isResetting ? "Salvataggio..." : "Salva"}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Esci
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Accedi per gestire il tuo account.
                </p>
                <Button className="w-full rounded-xl" onClick={onLogin}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Accedi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aspetto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emmegi S.r.l.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="tel:+390444317185"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block">+39 0444 317185</span>
                <span className="text-sm text-muted-foreground">Tel. / Fax</span>
              </div>
            </a>

            <a
              href="mailto:Venturi2005@libero.it"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span>Venturi2005@libero.it</span>
            </a>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="block">Via dell'Industria, 12</span>
                <span className="text-sm text-muted-foreground">36010 Cavazzale di Monticello Conte Otto (VI)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App version */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Emmegi S.r.l. App v1.0</p>
          <p className="mt-1">© 2026 Tutti i diritti riservati</p>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
