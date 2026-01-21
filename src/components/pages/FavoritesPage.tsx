import { Heart } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const FavoritesPage = ({ onNavigate, currentPage }: FavoritesPageProps) => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">I tuoi Preferiti</h1>
        </div>
      </header>

      <main className="p-4">
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Non hai ancora salvato nessun preferito.</p>
          <p className="text-sm mt-2">
            Tocca il cuore sui macchinari per salvarli qui.
          </p>
        </div>
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default FavoritesPage;
