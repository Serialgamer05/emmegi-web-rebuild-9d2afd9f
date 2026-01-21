import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Macchinario {
  id: string;
  nome: string;
  descrizione: string | null;
  prezzo: number | null;
  foto_url: string | null;
  created_at: string | null;
}

export const useMacchinari = () => {
  return useQuery({
    queryKey: ["macchinari"],
    queryFn: async (): Promise<Macchinario[]> => {
      const { data, error } = await supabase
        .from("macchinari")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddMacchinario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (macchinario: {
      nome: string;
      descrizione?: string;
      prezzo?: number;
      foto_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("macchinari")
        .insert(macchinario)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["macchinari"] });
      toast({
        title: "Macchinario aggiunto",
        description: "Il macchinario è stato pubblicato con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMacchinario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("macchinari").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["macchinari"] });
      toast({
        title: "Macchinario eliminato",
        description: "Il macchinario è stato rimosso con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
