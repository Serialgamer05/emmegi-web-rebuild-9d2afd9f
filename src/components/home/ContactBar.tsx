import { Phone, Mail, MapPin } from "lucide-react";

const ContactBar = () => {
  return (
    <div className="bg-primary text-primary-foreground px-4 py-4 space-y-2">
      <a href="tel:+390444317185" className="flex items-center gap-3">
        <Phone className="h-4 w-4" />
        <span className="text-sm">Tel. +39.0444317185 | Fax +39.0444317185</span>
      </a>
      <a href="mailto:info@emmegisrl.com" className="flex items-center gap-3">
        <Mail className="h-4 w-4" />
        <span className="text-sm">info@emmegisrl.com</span>
      </a>
      <div className="flex items-center gap-3">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">Via dell'Industria, 12 - Cavazzale (VI)</span>
      </div>
    </div>
  );
};

export default ContactBar;
