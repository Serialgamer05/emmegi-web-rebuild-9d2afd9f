import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const emailSchema = z.string().email("Email non valida");
const passwordSchema = z.string().min(6, "La password deve avere almeno 6 caratteri");

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage = ({ onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const validateInputs = () => {
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({
        title: "Errore di validazione",
        description: emailResult.error.issues[0].message,
        variant: "destructive",
      });
      return false;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({
        title: "Errore di validazione",
        description: passwordResult.error.issues[0].message,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInputs()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Credenziali non valide",
              description: "Email o password errati. Riprova.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Errore di accesso",
              description: error.message,
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
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Utente già registrato",
              description: "Questa email è già registrata. Prova ad accedere.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Errore di registrazione",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Registrazione completata",
            description: "Controlla la tua email per confermare l'account.",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-bold">
            {isLogin ? "Accedi" : "Registrati"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Bentornato su Emmegi S.r.l."
              : "Crea il tuo account su Emmegi S.r.l."}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@esempio.it"
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
                placeholder="• • • • • • • •"
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
              {isLoading ? "Caricamento..." : isLogin ? "Accedi" : "Registrati"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Non hai un account?" : "Hai già un account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
              disabled={isLoading}
            >
              {isLogin ? "Registrati" : "Accedi"}
            </button>
          </p>

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
