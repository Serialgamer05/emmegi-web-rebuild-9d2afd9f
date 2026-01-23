import { Phone, Mail, MapPin, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactFooter = () => {
  const handleOpenMaps = () => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=Via+dell'Industria+12+Cavazzale+Monticello+Conte+Otto+Vicenza",
      "_blank"
    );
  };

  const businessHours = [
    { day: "Lunedì", hours: "08:30 - 13:00 | 14:00 - 17:00" },
    { day: "Martedì", hours: "08:30 - 13:00 | 14:00 - 17:00" },
    { day: "Mercoledì", hours: "08:30 - 13:00 | 14:00 - 17:00" },
    { day: "Giovedì", hours: "08:30 - 13:00 | 14:00 - 17:00" },
    { day: "Venerdì", hours: "08:30 - 13:00 | 14:00 - 17:00" },
    { day: "Sabato", hours: "Chiuso" },
    { day: "Domenica", hours: "Chiuso" },
  ];

  return (
    <section className="bg-card border-t border-border mt-8">
      <div className="px-4 py-8 space-y-6">
        <h3 className="text-xl font-bold text-center">Contattaci</h3>
        
        <div className="space-y-4">
          <a 
            href="tel:+390444317185" 
            className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
          >
            <div className="bg-primary p-3 rounded-full">
              <Phone className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefono / Fax</p>
              <p className="font-semibold">+39 0444 317185</p>
            </div>
          </a>
          
          <a 
            href="mailto:Venturi2005@libero.it" 
            className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
          >
            <div className="bg-primary p-3 rounded-full">
              <Mail className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">Venturi2005@libero.it</p>
            </div>
          </a>
          
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <div className="bg-primary p-3 rounded-full">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Indirizzo</p>
              <p className="font-semibold">Via dell'Industria, 12</p>
              <p className="text-sm text-muted-foreground">36010 Cavazzale di Monticello Conte Otto (VI)</p>
            </div>
          </div>
        </div>

        {/* Mini Map Preview */}
        <div 
          onClick={handleOpenMaps}
          className="relative rounded-xl overflow-hidden cursor-pointer group"
        >
          <div className="aspect-video bg-muted flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2796.8!2d11.5833!3d45.5833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x477f2c5b8b4e2e1d%3A0x4c2e8e5a8d8d8d8d!2sVia%20dell'Industria%2C%2012%2C%2036010%20Cavazzale%20VI!5e0!3m2!1sit!2sit!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, pointerEvents: "none" }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mappa Emmegi S.r.l. - Via dell'Industria, 12 Cavazzale"
            />
          </div>
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
            <Button variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-4 w-4 mr-2" />
              Apri in Google Maps
            </Button>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-muted rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Orari di Apertura</h4>
          </div>
          <div className="space-y-2">
            {businessHours.map((item) => (
              <div 
                key={item.day} 
                className={`flex justify-between text-sm ${
                  item.hours === "Chiuso" ? "text-muted-foreground" : ""
                }`}
              >
                <span className="font-medium">{item.day}</span>
                <span>{item.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactFooter;
