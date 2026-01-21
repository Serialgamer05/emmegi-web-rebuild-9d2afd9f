import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onClick?: () => void;
}

const ProductCard = ({ 
  id, 
  name, 
  price, 
  imageUrl, 
  isFavorite = false, 
  onToggleFavorite,
  onClick 
}: ProductCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-square bg-muted">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(id);
          }}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : ""}`} 
          />
        </Button>
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
        <p className="text-primary font-bold mt-1">{formatPrice(price)}</p>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
