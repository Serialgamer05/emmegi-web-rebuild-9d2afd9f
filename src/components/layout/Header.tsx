import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header = ({ onMenuToggle, isMenuOpen }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-xl font-bold">
          Emmegi <span className="text-primary">S.r.l.</span>
        </h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMenuToggle}
          className="h-10 w-10"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>
    </header>
  );
};

export default Header;
