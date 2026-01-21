import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminDashboardProps {
  currentTab: "admin" | "macchine";
  onTabChange: (tab: "admin" | "macchine") => void;
  onExit: () => void;
}

const AdminDashboard = ({ currentTab, onTabChange, onExit }: AdminDashboardProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handlePublish = () => {
    // TODO: Implement publish logic with Supabase
    console.log({ imageFile, price, description });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 text-center">
        <h1 className="text-xl font-semibold">
          Dashboard Admin <span className="text-2xl">⚙️</span>
        </h1>
      </header>

      {/* Content */}
      <main className="p-4 pb-20">
        {currentTab === "macchine" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                Sezione 2: Macchine 🎡
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-muted file:text-foreground hover:file:bg-muted/80"
                />
              </div>
              <Input
                placeholder="Prezzo"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-secondary/50"
              />
              <Textarea
                placeholder="Descrizione"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary/50 min-h-24"
              />
              <Button 
                onClick={handlePublish}
                className="w-full bg-success hover:bg-success/90 text-success-foreground rounded-full py-6"
              >
                Pubblica
              </Button>
            </CardContent>
          </Card>
        )}

        {currentTab === "admin" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                Sezione 1: Admin 👤
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestione amministratori e impostazioni avanzate.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Bottom tabs */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="flex">
          <button
            onClick={() => onTabChange("admin")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              currentTab === "admin" 
                ? "text-foreground" 
                : "text-muted-foreground"
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => onTabChange("macchine")}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              currentTab === "macchine" 
                ? "text-primary" 
                : "text-muted-foreground"
            }`}
          >
            Macchine
          </button>
          <button
            onClick={onExit}
            className="flex-1 py-4 text-center font-medium text-muted-foreground"
          >
            Esci
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
