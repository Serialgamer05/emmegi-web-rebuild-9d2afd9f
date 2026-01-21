import { Phone, Mail, MapPin } from "lucide-react";

const ContactBar = () => {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-4 space-y-2">
      <a href="tel:+393924484032" className="flex items-center gap-3">
        <Phone className="h-4 w-4" />
        <span className="text-sm">+39 392 448 4032</span>
      </a>
      <a href="mailto:lucafinaldi3@gmail.com" className="flex items-center gap-3">
        <Mail className="h-4 w-4" />
        <span className="text-sm">lucafinaldi3@gmail.com</span>
      </a>
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">Cavazzale (VI)</span>
      </div>
    </div>
  );
};

export default ContactBar;
