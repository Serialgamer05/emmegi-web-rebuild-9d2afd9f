import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import ContactBar from "@/components/home/ContactBar";
import HeroSection from "@/components/home/HeroSection";
import ProductGrid from "@/components/home/ProductGrid";
import { useMacchinari } from "@/hooks/useMacchinari";
import { useAuth } from "@/hooks/useAuth";

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const HomePage = ({ onNavigate, currentPage }: HomePageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const productsRef = useRef<HTMLDivElement>(null);
  
  const { data: macchinari, isLoading } = useMacchinari();
  const { isAdmin } = useAuth();

  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleScrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProductClick = (product: { id: string; name: string }) => {
    console.log("Product clicked:", product);
    // TODO: Navigate to product detail
  };

  // Transform macchinari to product format
  const products = macchinari?.map((m) => ({
    id: m.id,
    name: m.nome,
    price: m.prezzo || 0,
    imageUrl: m.foto_url || "/placeholder.svg",
  })) || [];

  return (
    <div className="min-h-screen bg-background pb-20">
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
        <HeroSection onScrollToProducts={handleScrollToProducts} />

        <div ref={productsRef}>
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">
              Caricamento macchinari...
            </div>
          ) : (
            <ProductGrid
              products={products}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onProductClick={handleProductClick}
            />
          )}
        </div>
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default HomePage;
