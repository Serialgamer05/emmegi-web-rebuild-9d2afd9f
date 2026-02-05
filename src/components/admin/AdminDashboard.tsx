import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useAddMacchinario, useMacchinari, useDeleteMacchinario, useUpdateMacchinario } from "@/hooks/useMacchinari";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Trash2, Upload, ArrowLeft, Pencil, UserPlus, Send, Package, Users, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

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
  
  // Confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showGoogleReauth, setShowGoogleReauth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);
  const [adminList, setAdminList] = useState<string[]>([]);
  
  const { user } = useAuth();

  const { data: macchinari, isLoading } = useMacchinari();
  const addMacchinario = useAddMacchinario();
  const deleteMacchinario = useDeleteMacchinario();
  const updateMacchinario = useUpdateMacchinario();

  // Load admin list from database
  useEffect(() => {
    const loadAdmins = async () => {
      const { data } = await supabase
        .from("user_sessions")
        .select("email")
        .eq("otp_type", "admin_invite")
        .eq("is_verified", true);
      
      const verifiedAdmins = data?.map(d => d.email) || [];
      // Always include fixed admins
      const fixedAdmins = ["lucafinaldi3@gmail.com", "matviso03@gmail.com", "venturi2005@libero.it"];
      const allAdmins = [...new Set([...fixedAdmins, ...verifiedAdmins])];
      setAdminList(allAdmins);
    };
    loadAdmins();
  }, []);

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

  const handleRequestDelete = (id: string) => {
    setShowDeleteConfirm(id);
  };

  const handleConfirmDelete = async () => {
    if (!showDeleteConfirm) return;
    
    // Require Google re-auth
    setPendingAction(async () => {
      deleteMacchinario.mutate(showDeleteConfirm);
      toast({
        title: "Eliminato",
        description: "Macchinario eliminato con successo.",
      });
    });
    setShowDeleteConfirm(null);
    setShowGoogleReauth(true);
  };

  const handleRequestSave = () => {
    if (!editingProduct) return;
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    // Require Google re-auth
    setPendingAction(async () => {
      await handleSaveEdit();
    });
    setShowSaveConfirm(false);
    setShowGoogleReauth(true);
  };

  const handleGoogleReauth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        }
      });
      if (error) throw error;
      
      // Execute pending action after successful reauth
      if (pendingAction) {
        await pendingAction();
        setPendingAction(null);
      }
      setShowGoogleReauth(false);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Autenticazione Google fallita.",
        variant: "destructive",
      });
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
      // Send invite via new admin-invite edge function
      const response = await supabase.functions.invoke('admin-invite', {
        body: { 
          email: inviteEmail.trim().toLowerCase(), 
          inviterName: user?.email
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Invito inviato",
        description: `Email inviata a ${inviteEmail}. L'utente riceverà un link per accettare o rifiutare.`,
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
                            onClick={() => handleRequestDelete(m.id)}
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
                  Verrà inviata un'email con un link di conferma. L'utente dovrà cliccare "Sì" o "No" per accettare o rifiutare. La password standard sarà: <strong>admin26</strong>
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
                  {adminList.map((adminEmail) => {
                    const isFixedAdmin = ["lucafinaldi3@gmail.com", "matviso03@gmail.com", "venturi2005@libero.it"].includes(adminEmail.toLowerCase());
                    return (
                      <li key={adminEmail} className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{adminEmail}</span>
                          <p className="text-xs text-muted-foreground">
                            {isFixedAdmin ? "Admin fisso" : "Admin invitato"}
                          </p>
                        </div>
                      </li>
                    );
                  })}
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
            <Button onClick={handleRequestSave} disabled={isUploading} className="rounded-2xl">
              {isUploading ? "Salvataggio..." : "Salva"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Conferma Eliminazione</DialogTitle>
            <DialogDescription className="text-center">
              Sei sicuro di voler eliminare questo macchinario? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)} className="rounded-2xl">
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} className="rounded-2xl">
              Elimina
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <Dialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Conferma Modifiche</DialogTitle>
            <DialogDescription className="text-center">
              Vuoi salvare le modifiche apportate a questo macchinario?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setShowSaveConfirm(false)} className="rounded-2xl">
              Annulla
            </Button>
            <Button onClick={handleConfirmSave} className="rounded-2xl">
              Conferma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Re-authentication Dialog */}
      <Dialog open={showGoogleReauth} onOpenChange={setShowGoogleReauth}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-center">Conferma Identità</DialogTitle>
            <DialogDescription className="text-center">
              Per sicurezza, conferma il login con il tuo account Google prima di procedere.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2">
            <Button 
              onClick={handleGoogleReauth} 
              className="w-full rounded-2xl py-6 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Conferma con Google
            </Button>
            <Button variant="ghost" onClick={() => {
              setShowGoogleReauth(false);
              setPendingAction(null);
            }} className="rounded-2xl">
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
