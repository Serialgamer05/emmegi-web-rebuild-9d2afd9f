import { useState } from "react";
import { ArrowLeft, Mail, Phone, MessageCircle, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Macchinario, useMacchinari } from "@/hooks/useMacchinari";
import { useAuth } from "@/hooks/useAuth";

interface ProductDetailPageProps {
  product: Macchinario;
  onBack: () => void;
  onProductClick: (product: Macchinario) => void;
}

const ProductDetailPage = ({ product, onBack, onProductClick }: ProductDetailPageProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { data: allProducts } = useMacchinari();
  
  // For now, we use single image, but structure supports multiple
  const images = product.foto_url ? [product.foto_url] : ["/placeholder.svg"];
  
  const formatPrice = (price: number | null) => {
    if (!price) return "Prezzo su richiesta";
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const userEmail = user?.email || "cliente";
  const productName = product.nome;
  
  const emailSubject = encodeURIComponent(`Richiesta informazioni: ${productName}`);
  const emailBody = encodeURIComponent(`Ciao, sono ${userEmail} e sono interessato/a al prodotto "${productName}". Vorrei ricevere maggiori informazioni.`);
  
  const whatsappMessage = encodeURIComponent(`Ciao, sono ${userEmail} e sono interessato/a al prodotto "${productName}". Vorrei ricevere maggiori informazioni.`);
  
  // Related products (excluding current)
  const relatedProducts = allProducts?.filter(p => p.id !== product.id).slice(0, 6) || [];

  const companyPhone = "+390444317185";
  const companyEmail = "Venturi2005@libero.it";
  const companyAddress = "Via dell'Industria, 12, 36010 Cavazzale di Monticello Conte Otto (VI)";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="ml-3 text-lg font-semibold line-clamp-1">{product.nome}</h1>
        </div>
      </header>

      <main className="pb-8">
        {/* Image Carousel */}
        <div className="relative aspect-square bg-muted">
          <img
            src={images[currentImageIndex]}
            alt={product.nome}
            className="w-full h-full object-cover"
          />
          
          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="p-4 border-b border-border">
          <p className="text-2xl font-bold text-primary">
            {formatPrice(product.prezzo)}
          </p>
        </div>

        {/* Description */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold mb-2">Descrizione</h2>
          <p className="text-muted-foreground">
            {product.descrizione || "Nessuna descrizione disponibile per questo macchinario."}
          </p>
        </div>

        {/* Contact Form Section */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold mb-4">Contattaci per informazioni</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Email */}
            <a
              href={`mailto:${companyEmail}?subject=${emailSubject}&body=${emailBody}`}
              className="flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors"
            >
              <Mail className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-center">Email</span>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/393270573481?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors"
            >
              <MessageCircle className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-center">WhatsApp</span>
            </a>

            {/* Phone Call */}
            <a
              href={`tel:${companyPhone}`}
              className="flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary transition-colors"
            >
              <Phone className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-center">Chiama</span>
            </a>
          </div>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Tel. +39 0444 317185 | {companyEmail}
          </p>
        </div>

        {/* Map Section */}
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold mb-3">Dove siamo</h2>
          
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative rounded-xl overflow-hidden border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2794.8!2d11.583!3d45.583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477f2f0a0a0a0a0a%3A0x0!2sVia%20dell'Industria%2C%2012%2C%2036010%20Cavazzale%20di%20Monticello%20Conte%20Otto%20VI!5e0!3m2!1sit!2sit!4v1"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Emmegi S.r.l. Location"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center text-white text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{companyAddress}</span>
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="p-4">
            <h2 className="font-semibold mb-4">Agli altri utenti interessa anche...</h2>
            
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="flex-shrink-0 w-32 cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onProductClick(relatedProduct)}
                >
                  <div className="aspect-square bg-muted">
                    <img
                      src={relatedProduct.foto_url || "/placeholder.svg"}
                      alt={relatedProduct.nome}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium line-clamp-2">{relatedProduct.nome}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetailPage;
