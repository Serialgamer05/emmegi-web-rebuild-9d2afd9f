import { Home, Heart, PlusCircle, Users, LogOut, Settings, X } from "lucide-react";
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
    { id: "favorites", label: "I tuoi Preferiti", icon: Heart },
    { id: "settings", label: "Impostazioni", icon: Settings },
  ];

  const adminItems = [
    { id: "add-product", label: "Aggiungi Prodotto", icon: PlusCircle },
    { id: "admin", label: "Gestione Admin", icon: Users },
  ];

  const handleNavigation = (page: string) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-80 bg-card z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-bold">
            Emmegi <span className="text-primary">S.r.l.</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info if logged in */}
        {user && (
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <p className="text-sm text-muted-foreground">Accesso come:</p>
            <p className="font-medium text-sm truncate">{user.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                Admin
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-primary" 
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
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
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive 
                        ? "bg-sidebar-accent text-primary" 
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Esci</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigation("login")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-primary hover:bg-muted transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Accedi</span>
            </button>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
