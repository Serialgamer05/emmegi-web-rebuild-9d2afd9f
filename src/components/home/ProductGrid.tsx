import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

interface ProductGridProps {
  products: Product[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, favorites, onToggleFavorite, onProductClick }: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun macchinario disponibile</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          isFavorite={favorites.includes(product.id)}
          onToggleFavorite={onToggleFavorite}
          onClick={() => onProductClick(product)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
