import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ContactBar from "@/components/home/ContactBar";
import SearchBar from "@/components/home/SearchBar";
import ProductGrid from "@/components/home/ProductGrid";
import ContactFooter from "@/components/home/ContactFooter";
import { useMacchinari } from "@/hooks/useMacchinari";
import { useAuth } from "@/hooks/useAuth";

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const HomePage = ({ onNavigate, currentPage }: HomePageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  
  const { data: macchinari, isLoading } = useMacchinari();
  const { isAdmin } = useAuth();

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleProductClick = (product: { id: string; name: string }) => {
    console.log("Product clicked:", product);
    // TODO: Navigate to product detail
  };

  // Transform macchinari to product format and filter by search
  const products = macchinari?.map((m) => ({
    id: m.id,
    name: m.nome,
    price: m.prezzo || 0,
    imageUrl: m.foto_url || "/placeholder.svg",
  })) || [];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main>
        <ContactBar />
        
        {/* Search Bar replaces Hero Section */}
        <div className="bg-gradient-to-b from-primary/5 to-background">
          <div className="text-center pt-6 pb-2">
            <h2 className="text-2xl font-bold">
              Macchinari <span className="text-primary">Industriali</span>
            </h2>
          </div>
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery} 
            placeholder="Cerca macchinario..."
          />
        </div>

        <div ref={productsRef}>
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Caricamento macchinari...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {searchQuery ? "Nessun macchinario trovato." : "Nessun macchinario disponibile."}
            </div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onProductClick={handleProductClick}
            />
          )}
        </div>

        <ContactFooter />
      </main>
    </div>
  );
};

export default HomePage;
