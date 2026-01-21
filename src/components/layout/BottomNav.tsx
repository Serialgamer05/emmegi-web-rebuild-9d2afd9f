import { Home, Search, Heart, Settings } from "lucide-react";

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const BottomNav = ({ currentPage, onNavigate }: BottomNavProps) => {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Cerca", icon: Search },
    { id: "favorites", label: "Preferiti", icon: Heart },
    { id: "settings", label: "Impostazioni", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
