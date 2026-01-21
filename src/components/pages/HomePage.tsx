import { useState, useRef } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import ContactBar from "@/components/home/ContactBar";
import HeroSection from "@/components/home/HeroSection";
import ProductGrid from "@/components/home/ProductGrid";

// Demo products - will be replaced with Supabase data
const demoProducts = [
  { id: "1", name: "Tornio CNC industriale", price: 15000, imageUrl: "/placeholder.svg" },
  { id: "2", name: "Fresa verticale automatica", price: 8500, imageUrl: "/placeholder.svg" },
  { id: "3", name: "Pressa idraulica 100T", price: 12000, imageUrl: "/placeholder.svg" },
  { id: "4", name: "Saldatrice MIG professionale", price: 3500, imageUrl: "/placeholder.svg" },
];

interface HomePageProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  isAdmin?: boolean;
}

const HomePage = ({ onNavigate, currentPage, isAdmin = false }: HomePageProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const productsRef = useRef<HTMLDivElement>(null);

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
          <ProductGrid
            products={demoProducts}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onProductClick={handleProductClick}
          />
        </div>
      </main>

      <BottomNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};

export default HomePage;
