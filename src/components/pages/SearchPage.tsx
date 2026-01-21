import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/layout/BottomNav";
import ProductGrid from "@/components/home/ProductGrid";

const demoProducts = [
  { id: "1", name: "Tornio CNC industriale", price: 15000, imageUrl: "/placeholder.svg" },
  { id: "2", name: "Fresa verticale automatica", price: 8500, imageUrl: "/placeholder.svg" },
  { id: "3", name: "Pressa idraulica 100T", price: 12000, imageUrl: "/placeholder.svg" },
  { id: "4", name: "Saldatrice MIG professionale", price: 3500, imageUrl: "/placeholder.svg" },
];

interface SearchPageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const SearchPage = ({ onNavigate, currentPage }: SearchPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredProducts = demoProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca macchinario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>
      </header>

      <main>
        <ProductGrid
          products={filteredProducts}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onProductClick={() => {}}
        />
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default SearchPage;
