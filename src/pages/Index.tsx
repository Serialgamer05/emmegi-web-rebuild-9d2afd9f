import { useState } from "react";
import HomePage from "@/components/pages/HomePage";
import SearchPage from "@/components/pages/SearchPage";
import FavoritesPage from "@/components/pages/FavoritesPage";
import SettingsPage from "@/components/settings/SettingsPage";
import LoginForm from "@/components/auth/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminTab, setAdminTab] = useState<"admin" | "macchine">("macchine");

  const adminEmails = ["lucafinaldi3@gmail.com", "matviso03@gmail.com"];

  const handleLogin = (email: string, password: string) => {
    // Mock login - will be replaced with Supabase auth
    setIsLoggedIn(true);
    setShowLogin(false);
    if (adminEmails.includes(email.toLowerCase())) {
      setIsAdmin(true);
    }
    setCurrentPage("home");
  };

  const handleNavigate = (page: string) => {
    if (page === "logout") {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentPage("home");
      return;
    }
    setCurrentPage(page);
  };

  // Show login form
  if (showLogin) {
    return (
      <LoginForm
        onLogin={handleLogin}
        onRegister={() => console.log("Register")}
      />
    );
  }

  // Show admin dashboard
  if (currentPage === "admin" || currentPage === "add-product") {
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
      return <SearchPage onNavigate={handleNavigate} currentPage={currentPage} />;
    case "favorites":
      return <FavoritesPage onNavigate={handleNavigate} currentPage={currentPage} />;
    case "settings":
      return (
        <>
          <SettingsPage 
            isLoggedIn={isLoggedIn} 
            onLogin={() => setShowLogin(true)} 
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
                      currentPage === item.id ? "text-primary" : "text-muted-foreground"
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
          isAdmin={isAdmin}
        />
      );
  }
};

export default Index;
