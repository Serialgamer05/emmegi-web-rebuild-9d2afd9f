import { Home, LogOut, Settings, X, LogIn, Package, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  isAdmin?: boolean;
}

const Sidebar = ({ isOpen, onClose, currentPage, onNavigate, isAdmin = false }: SidebarProps) => {
  const { user } = useAuth();
  
  const menuItems = [
    { id: "home", label: "Home Catalogo", icon: Home },
    { id: "settings", label: "Impostazioni", icon: Settings },
  ];

  const adminItems = [
    { id: "gestione-macchinari", label: "Gestione Macchinari", icon: Package },
    { id: "gestione-admin", label: "Gestione Admin", icon: Users },
  ];

  const handleNavigation = (page: string) => {
    // Map the sidebar navigation to the appropriate page/tab
    if (page === "gestione-macchinari") {
      onNavigate("add-product");
    } else if (page === "gestione-admin") {
      onNavigate("admin");
    } else {
      onNavigate(page);
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar - iOS style */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-card z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ borderTopRightRadius: '24px', borderBottomRightRadius: '24px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold tracking-tight">
            Emmegi <span className="text-primary">S.r.l.</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info if logged in */}
        {user && (
          <div className="px-5 py-4 border-b border-border bg-muted/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Accesso come</p>
            <p className="font-medium text-sm truncate mt-1">{user.email}</p>
            {isAdmin && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                <Shield className="w-3 h-3" />
                Modalità Admin
              </span>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted active:scale-[0.98]"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <>
              <Separator className="my-4" />
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Amministrazione
              </p>
              {adminItems.map((item) => {
                const Icon = item.icon;
                const isActive = 
                  (item.id === "gestione-macchinari" && currentPage === "add-product") ||
                  (item.id === "gestione-admin" && currentPage === "admin");
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground hover:bg-muted active:scale-[0.98]"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </>
          )}

          <Separator className="my-4" />

          {user ? (
            <button
              onClick={() => handleNavigation("logout")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.98]"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Esci</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("login")}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-primary hover:bg-primary/10 transition-all duration-200 active:scale-[0.98]"
            >
              <LogIn className="h-5 w-5" />
              <span className="font-medium">Accedi</span>
            </button>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
