import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAddMacchinario, useMacchinari, useDeleteMacchinario, useUpdateMacchinario } from "@/hooks/useMacchinari";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2, Upload, ArrowLeft, Pencil, UserPlus, Send, Package, Users, Shield } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AdminDashboardProps {
  currentTab: "admin" | "macchine";
  onTabChange: (tab: "admin" | "macchine") => void;
  onExit: () => void;
}

interface EditingProduct {
  id: string;
  nome: string;
  prezzo: number | null;
  descrizione: string | null;
  foto_url: string | null;
}

const AdminDashboard = ({ currentTab, onTabChange, onExit }: AdminDashboardProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit product state
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  
  // Admin invitation state
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  const { data: macchinari, isLoading } = useMacchinari();
  const addMacchinario = useAddMacchinario();
  const deleteMacchinario = useDeleteMacchinario();
  const updateMacchinario = useUpdateMacchinario();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
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

  const handleEdit = (m: EditingProduct) => {
    setEditingProduct(m);
    setEditImagePreview(m.foto_url);
    setEditImageFile(null);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    
    setIsUploading(true);
    
    try {
      let fotoUrl = editingProduct.foto_url;
      
      if (editImageFile) {
        const uploadedUrl = await uploadImage(editImageFile);
        if (uploadedUrl) {
          fotoUrl = uploadedUrl;
        }
      }

      await updateMacchinario.mutateAsync({
        id: editingProduct.id,
        nome: editingProduct.nome,
        descrizione: editingProduct.descrizione,
        prezzo: editingProduct.prezzo,
        foto_url: fotoUrl,
      });

      setEditingProduct(null);
      setEditImageFile(null);
      setEditImagePreview(null);
      
      toast({
        title: "Successo",
        description: "Macchinario aggiornato con successo!",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida",
        variant: "destructive",
      });
      return;
    }

    setIsSendingInvite(true);

    try {
      // Send OTP via edge function
      const response = await supabase.functions.invoke('send-otp', {
        body: { 
          email: inviteEmail.trim().toLowerCase(),
          type: "admin_invite"
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Invito inviato",
        description: `Codice OTP inviato a ${inviteEmail}. L'utente dovrà inserirlo per confermare.`,
      });

      setInviteEmail("");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast({
        title: "Errore",
        description: "Impossibile inviare l'invito. Verifica la configurazione email.",
        variant: "destructive",
      });
    } finally {
      setIsSendingInvite(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - iOS style */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border p-4 flex items-center gap-4 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onExit} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1 flex items-center gap-2">
          Dashboard Admin
          <Shield className="h-5 w-5 text-primary" />
        </h1>
      </header>

      {/* Content */}
      <main className="p-4 pb-24 space-y-6">
        {currentTab === "macchine" && (
          <>
            {/* Add new product form */}
            <Card className="shadow-lg rounded-3xl border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
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
                    className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-2xl file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:font-medium"
                    disabled={isUploading}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                  )}
                </div>

                <Input
                  placeholder="Nome macchinario *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="bg-muted/50 rounded-2xl py-6"
                  disabled={isUploading}
                />
                
                <Input
                  placeholder="Prezzo (€)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-muted/50 rounded-2xl py-6"
                  disabled={isUploading}
                />
                
                <Textarea
                  placeholder="Descrizione"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-muted/50 min-h-24 rounded-2xl"
                  disabled={isUploading}
                />
                
                <Button
                  onClick={handlePublish}
                  disabled={isUploading || addMacchinario.isPending}
                  className="w-full bg-primary hover:bg-primary/90 rounded-full py-6 font-medium"
                >
                  {isUploading ? "Caricamento..." : "Pubblica"}
                </Button>
              </CardContent>
            </Card>

            {/* Existing products list */}
            <Card className="shadow-lg rounded-3xl border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
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
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-2xl"
                      >
                        {m.foto_url && (
                          <img
                            src={m.foto_url}
                            alt={m.nome}
                            className="w-16 h-16 object-cover rounded-xl"
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
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit({
                              id: m.id,
                              nome: m.nome,
                              prezzo: m.prezzo,
                              descrizione: m.descrizione,
                              foto_url: m.foto_url,
                            })}
                            className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
                          >
                            <Pencil className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(m.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {currentTab === "admin" && (
          <>
            <Card className="shadow-lg rounded-3xl border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Invita Nuovo Admin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email nuovo admin</Label>
                  <Input
                    type="email"
                    placeholder="email@esempio.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="rounded-2xl py-6"
                    disabled={isSendingInvite}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Verrà inviato un codice OTP a 6 cifre via email. Il nuovo admin dovrà inserirlo per verificare l'accesso. La password standard sarà: <strong>admin26</strong>
                </p>
                <Button
                  onClick={handleSendInvite}
                  disabled={isSendingInvite}
                  className="w-full rounded-2xl py-6 font-medium"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSendingInvite ? "Invio in corso..." : "Invia Invito"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg rounded-3xl border-0 bg-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Admin Autorizzati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">lucafinaldi3@gmail.com</span>
                      <p className="text-xs text-muted-foreground">Admin fisso</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">matviso03@gmail.com</span>
                      <p className="text-xs text-muted-foreground">Admin fisso</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">Venturi2005@libero.it</span>
                      <p className="text-xs text-muted-foreground">Admin fisso</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Bottom tabs - iOS style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="flex">
          <button
            onClick={() => onTabChange("admin")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${
              currentTab === "admin"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Admin</span>
          </button>
          <button
            onClick={() => onTabChange("macchine")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${
              currentTab === "macchine"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="text-xs font-medium">Macchine</span>
          </button>
        </div>
      </nav>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Modifica Macchinario
            </DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Immagine</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-2xl file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  disabled={isUploading}
                />
                {editImagePreview && (
                  <img
                    src={editImagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-2xl"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Nome *</Label>
                <Input
                  value={editingProduct.nome}
                  onChange={(e) => setEditingProduct({ ...editingProduct, nome: e.target.value })}
                  className="rounded-2xl"
                  disabled={isUploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Prezzo (€)</Label>
                <Input
                  type="number"
                  value={editingProduct.prezzo || ""}
                  onChange={(e) => setEditingProduct({ 
                    ...editingProduct, 
                    prezzo: e.target.value ? parseFloat(e.target.value) : null 
                  })}
                  className="rounded-2xl"
                  disabled={isUploading}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Descrizione</Label>
                <Textarea
                  value={editingProduct.descrizione || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descrizione: e.target.value })}
                  className="rounded-2xl min-h-20"
                  disabled={isUploading}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-2xl">
              Annulla
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUploading} className="rounded-2xl">
              {isUploading ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
