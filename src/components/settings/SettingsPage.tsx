import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, LogOut, User } from "lucide-react";

interface SettingsPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

const SettingsPage = ({ isLoggedIn, onLogin, userEmail, onLogout }: SettingsPageProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 text-center">
        <h1 className="text-xl font-semibold">Impostazioni</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Account section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{userEmail || "Utente"}</p>
                    <p className="text-sm text-muted-foreground">Account attivo</p>
                  </div>
                </div>
                {onLogout && (
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={onLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Esci
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Accedi per gestire i tuoi preferiti e molto altro.
                </p>
                <Button className="w-full rounded-xl" onClick={onLogin}>
                  Accedi o Registrati
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Emmegi S.r.l.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="tel:+393924484032"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <span>+39 392 448 4032</span>
            </a>

            <a
              href="mailto:lucafinaldi3@gmail.com"
              className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <span>lucafinaldi3@gmail.com</span>
            </a>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <span>Cavazzale (VI), Italia</span>
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
