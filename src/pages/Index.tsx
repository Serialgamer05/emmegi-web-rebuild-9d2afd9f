import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import HomePage from "@/components/pages/HomePage";
import SettingsPage from "@/components/settings/SettingsPage";
import AuthPage from "@/components/auth/AuthPage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ProductDetailPage from "@/components/product/ProductDetailPage";
import { useAuth } from "@/hooks/useAuth";
import { useMacchinari, Macchinario } from "@/hooks/useMacchinari";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [adminTab, setAdminTab] = useState<"admin" | "macchine">("macchine");
  const [selectedProduct, setSelectedProduct] = useState<Macchinario | null>(null);

  const { user, isAdmin, signOut, isLoading } = useAuth();
  const { data: macchinari } = useMacchinari();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle URL-based product routing
  useEffect(() => {
    const path = location.pathname;
    if (path !== "/" && macchinari) {
      const productSlug = path.slice(1); // Remove leading /
      const product = macchinari.find(
        (m) => slugify(m.nome) === productSlug
      );
      if (product) {
        setSelectedProduct(product);
        setCurrentPage("product");
      }
    }
  }, [location.pathname, macchinari]);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  };

  const handleNavigate = (page: string) => {
    if (page === "logout") {
      signOut();
      setCurrentPage("home");
      setSelectedProduct(null);
      navigate("/");
      return;
    }
    if (page === "login") {
      setShowAuth(true);
      return;
    }
    if (page === "home") {
      setSelectedProduct(null);
      navigate("/");
    }
    setCurrentPage(page);
  };

  const handleProductClick = (product: Macchinario) => {
    setSelectedProduct(product);
    setCurrentPage("product");
    navigate(`/${slugify(product.nome)}`);
  };

  const handleBackFromProduct = () => {
    setSelectedProduct(null);
    setCurrentPage("home");
    navigate("/");
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  // Show auth page
  if (showAuth) {
    return (
      <AuthPage
        onBack={() => {
          setShowAuth(false);
          setCurrentPage("home");
        }}
      />
    );
  }

  // Show product detail
  if (currentPage === "product" && selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={handleBackFromProduct}
        onProductClick={handleProductClick}
      />
    );
  }

  // Show admin dashboard (only if admin)
  if ((currentPage === "admin" || currentPage === "add-product") && isAdmin) {
    // Set the correct tab based on the page
    const tab = currentPage === "admin" ? "admin" : "macchine";
    return (
      <AdminDashboard
        currentTab={tab}
        onTabChange={setAdminTab}
        onExit={() => handleNavigate("home")}
      />
    );
  }

  // Regular pages
  switch (currentPage) {
    case "settings":
      return (
        <SettingsPage
          isLoggedIn={!!user}
          onLogin={() => setShowAuth(true)}
          userEmail={user?.email}
          onLogout={() => signOut()}
          onNavigate={handleNavigate}
        />
      );
    default:
      return (
        <HomePage
          onNavigate={handleNavigate}
          currentPage={currentPage}
          onProductClick={handleProductClick}
        />
      );
  }
};

export default Index;
