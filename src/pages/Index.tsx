import { useState } from "react";
import HomePage from "@/components/pages/HomePage";
import SearchPage from "@/components/pages/SearchPage";
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
    case "search":
      return (
        <SearchPage onNavigate={handleNavigate} currentPage={currentPage} />
      );
    case "favorites":
      return (
        <FavoritesPage onNavigate={handleNavigate} currentPage={currentPage} />
      );
    case "settings":
      return (
        <>
          <SettingsPage
            isLoggedIn={!!user}
            onLogin={() => setShowAuth(true)}
            userEmail={user?.email}
            onLogout={() => signOut()}
          />
          <div className="fixed bottom-0 left-0 right-0">
            <nav className="bg-card border-t border-border">
              <div className="flex items-center justify-around py-2">
                {[
                  { id: "home", label: "Home", icon: "🏠" },
                  { id: "search", label: "Cerca", icon: "🔍" },
                  { id: "favorites", label: "Preferiti", icon: "❤️" },
                  { id: "settings", label: "Impostazioni", icon: "⚙️" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                      currentPage === item.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </>
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
