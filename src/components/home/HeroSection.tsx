import { ArrowDown, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onScrollToProducts: () => void;
}

const HeroSection = ({ onScrollToProducts }: HeroSectionProps) => {
  return (
    <section className="px-4 py-8 text-center relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 gap-4 h-full">
          {Array.from({ length: 64 }).map((_, i) => (
            <div key={i} className="text-primary text-2xl">+</div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <span className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-primary text-sm font-medium">
            Macchinari disponibili in pronta consegna
          </span>
        </div>

        {/* Main heading */}
        <h2 className="text-3xl font-bold mb-2">
          Macchinari<br />
          Industriali di<br />
          <span className="text-primary">Qualità</span>
        </h2>

        {/* Subtitle */}
        <p className="text-muted-foreground mt-4 mb-2">
          Scopri la nostra selezione di<br />
          macchinari usati garantiti.
        </p>

        <p className="text-sm mb-6">
          <strong>Emmegi S.r.l.</strong> – Affidabilità, qualità e<br />
          prezzi competitivi per la tua attività.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={onScrollToProducts}
            className="w-full max-w-xs rounded-full py-6"
          >
            Scopri i Macchinari
            <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline"
            className="w-full max-w-xs rounded-full py-6"
            asChild
          >
            <a href="tel:+393924484032">
              <Phone className="mr-2 h-4 w-4" />
              Chiama Ora
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
