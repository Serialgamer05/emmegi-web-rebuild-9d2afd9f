import { Card, CardContent } from "@/components/ui/card";

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl: string;
  onClick?: () => void;
}

const ProductCard = ({ 
  name, 
  imageUrl, 
  onClick 
}: ProductCardProps) => {
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
      </div>
      <CardContent className="p-3">
        <h3 className="font-medium text-sm line-clamp-2">{name}</h3>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
