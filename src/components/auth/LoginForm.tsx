import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: () => void;
}

const LoginForm = ({ onLogin, onRegister }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl font-bold">
            E
          </div>
          <h1 className="text-2xl font-bold">Accedi</h1>
          <p className="text-muted-foreground">Benvenuto su Emmegi S.r.l.</p>
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
                className="rounded-lg"
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
                className="rounded-lg"
              />
            </div>
            <Button type="submit" className="w-full rounded-lg py-6">
              Accedi
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Non hai un account?{" "}
            <button 
              onClick={onRegister}
              className="text-primary font-medium hover:underline"
            >
              Registrati
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
