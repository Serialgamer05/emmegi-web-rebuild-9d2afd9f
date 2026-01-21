import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAddMacchinario, useMacchinari, useDeleteMacchinario } from "@/hooks/useMacchinari";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2, Upload, ArrowLeft } from "lucide-react";

interface AdminDashboardProps {
  currentTab: "admin" | "macchine";
  onTabChange: (tab: "admin" | "macchine") => void;
  onExit: () => void;
}

const AdminDashboard = ({ currentTab, onTabChange, onExit }: AdminDashboardProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: macchinari, isLoading } = useMacchinari();
  const addMacchinario = useAddMacchinario();
  const deleteMacchinario = useDeleteMacchinario();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `macchinari/${fileName}`;

    const { error } = await supabase.storage
      .from("Photos")
      .upload(filePath, file);

    if (error) {
      console.error("Upload error:", error);
      return null;
    }

    const { data } = supabase.storage.from("Photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handlePublish = async () => {
    if (!nome.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il nome del macchinario",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      let fotoUrl: string | undefined;

      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          fotoUrl = uploadedUrl;
        }
      }

      await addMacchinario.mutateAsync({
        nome: nome.trim(),
        descrizione: description.trim() || undefined,
        prezzo: price ? parseFloat(price) : undefined,
        foto_url: fotoUrl,
      });

      // Reset form
      setNome("");
      setPrice("");
      setDescription("");
      setImageFile(null);
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo macchinario?")) {
      deleteMacchinario.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onExit}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1">
          Dashboard Admin <span className="text-2xl">⚙️</span>
        </h1>
      </header>

      {/* Content */}
      <main className="p-4 pb-24 space-y-6">
        {currentTab === "macchine" && (
          <>
            {/* Add new product form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Aggiungi Macchinario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image upload */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    disabled={isUploading}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}
                </div>

                <Input
                  placeholder="Nome macchinario *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-secondary/50 rounded-xl"
                  disabled={isUploading}
                />
                
                <Input
                  placeholder="Prezzo (€)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary/50 rounded-xl"
                  disabled={isUploading}
                />
                
                <Textarea
                  placeholder="Descrizione"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/50 min-h-24 rounded-xl"
                  disabled={isUploading}
                />
                
                <Button
                  onClick={handlePublish}
                  disabled={isUploading || addMacchinario.isPending}
                  className="w-full bg-success hover:bg-success/90 text-success-foreground rounded-full py-6"
                >
                  {isUploading ? "Caricamento..." : "Pubblica"}
                </Button>
              </CardContent>
            </Card>

            {/* Existing products list */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">
                  Macchinari Pubblicati ({macchinari?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-muted-foreground">Caricamento...</p>
                ) : macchinari?.length === 0 ? (
                  <p className="text-muted-foreground">Nessun macchinario pubblicato</p>
                ) : (
                  <div className="space-y-3">
                    {macchinari?.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl"
                      >
                        {m.foto_url && (
                          <img
                            src={m.foto_url}
                            alt={m.nome}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{m.nome}</p>
                          {m.prezzo && (
                            <p className="text-primary font-semibold">
                              €{m.prezzo.toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(m.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
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
              <p className="text-sm mt-4 text-muted-foreground">
                Admin autorizzati:
              </p>
              <ul className="text-sm mt-2 space-y-1">
                <li className="text-primary">• lucafinaldi3@gmail.com</li>
                <li className="text-primary">• matviso03@gmail.com</li>
              </ul>
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
                ? "text-primary"
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
