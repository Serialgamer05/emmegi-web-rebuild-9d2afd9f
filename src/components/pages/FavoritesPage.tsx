import { useState } from "react";
import { Heart } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/hooks/useAuth";

interface FavoritesPageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const FavoritesPage = ({ onNavigate, currentPage }: FavoritesPageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isMenuOpen={isSidebarOpen}
      />

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isAdmin={isAdmin}
      />

      <main className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-semibold">I tuoi Preferiti</h1>
        </div>

        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Non hai ancora salvato nessun preferito.</p>
          <p className="text-sm mt-2">
            Tocca il cuore sui macchinari per salvarli qui.
          </p>
        </div>
      </main>
    </div>
  );
};

export default FavoritesPage;
