import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";
const Footer = () => {
  return <footer className="border-t border-border mt-20" style={{
    backgroundColor: '#FAF8F5'
  }}>
      <div className="container py-10 bg-neutral-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-sans text-xl font-bold uppercase tracking-[-0.04em] mb-4 text-white hover:text-primary transition-smooth">STAYMAKOM</h3>
            <p className="text-sm text-white">
              Book extraordinary stays — beyond the usual.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/partners" className="text-sm text-white hover:text-primary transition-smooth">
                  For Partners
                </Link>
              </li>
              <li>
                <Link to="/gift-card" className="text-sm text-white hover:text-primary transition-smooth">
                  Gift Card
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-sm text-white hover:text-primary transition-smooth">
                  Journal
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/legal" className="text-sm text-white hover:text-primary transition-smooth">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-sm text-white hover:text-primary transition-smooth">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-white">
                <Mail className="h-4 w-4 text-white" />
                hello@staymakom.com
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <Phone className="h-4 w-4 text-white" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <Instagram className="h-4 w-4 text-white" />
                @staymakom
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-white">
            © 2025 STAYMAKOM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;