import { useState } from "react";
import HomePage from "@/components/pages/HomePage";
import FavoritesPage from "@/components/pages/FavoritesPage";
import SettingsPage from "@/components/settings/SettingsPage";
import AuthPage from "@/components/auth/AuthPage";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [showAuth, setShowAuth] = useState(false);
  const [adminTab, setAdminTab] = useState<"admin" | "macchine">("macchine");

  const { user, isAdmin, signOut, isLoading } = useAuth();

  const handleNavigate = (page: string) => {
    if (page === "logout") {
      signOut();
      setCurrentPage("home");
      return;
    }
    if (page === "login") {
      setShowAuth(true);
      return;
    }
    setCurrentPage(page);
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

  // Show admin dashboard (only if admin)
  if ((currentPage === "admin" || currentPage === "add-product") && isAdmin) {
    return (
      <AdminDashboard
        currentTab={adminTab}
        onTabChange={setAdminTab}
        onExit={() => setCurrentPage("home")}
      />
    );
  }

  // Regular pages
  switch (currentPage) {
    case "favorites":
      return (
        <FavoritesPage onNavigate={handleNavigate} currentPage={currentPage} />
      );
    case "settings":
      return (
        <SettingsPage
          isLoggedIn={!!user}
          onLogin={() => setShowAuth(true)}
          userEmail={user?.email}
          onLogout={() => signOut()}
        />
      );
    default:
      return (
        <HomePage
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      );
  }
};

export default Index;
