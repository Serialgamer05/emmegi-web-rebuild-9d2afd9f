import { Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SettingsPageProps {
  isLoggedIn: boolean;
  onLogin: () => void;
}

const SettingsPage = ({ isLoggedIn, onLogin }: SettingsPageProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold text-primary">Impostazioni</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Account section */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoggedIn ? (
              <p className="text-muted-foreground text-sm">
                Gestisci il tuo account e le preferenze.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Accedi per salvare i tuoi preferiti
                </p>
                <Button 
                  onClick={onLogin}
                  className="w-full"
                >
                  Accedi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company info */}
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="font-semibold">Emmegi S.r.l.</h3>
            <p className="text-muted-foreground text-sm">
              Macchinari Industriali – Cavazzale (VI)
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;
