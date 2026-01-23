import { useState } from "react";
import { Settings as SettingsIcon, Moon, Sun, LogOut, LogIn, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface SettingsPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  userEmail?: string;
  onLogout: () => void;
}

const SettingsPage = ({ isLoggedIn, onLogin, userEmail, onLogout }: SettingsPageProps) => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    }
    setIsSidebarOpen(false);
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
                  Accedi per gestire i tuoi preferiti e molto altro.
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
              href="mailto:info@emmegisrl.com"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span>info@emmegisrl.com</span>
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
