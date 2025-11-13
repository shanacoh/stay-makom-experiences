import { Link } from "react-router-dom";
import { Instagram, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
const Footer = () => {
  const [email, setEmail] = useState("");
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log("Newsletter signup:", email);
    setEmail("");
  };
  return <footer className="bg-[#1a1a1a] text-white mt-20">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-sans text-2xl font-bold uppercase tracking-[-0.04em] mb-3 text-slate-50">
              STAYMAKOM
            </h3>
            <p className="text-sm text-white leading-relaxed">
              Book extraordinary stays — beyond the usual.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              STAYMAKOM
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-white hover:text-primary transition-smooth">
                  About
                </Link>
              </li>
              <li>
                <Link to="/hotel" className="text-sm text-white hover:text-primary transition-smooth">
                  I'm a hotel
                </Link>
              </li>
              <li>
                <Link to="/companies" className="text-sm text-white hover:text-primary transition-smooth">
                  Company gift
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-white hover:text-primary transition-smooth">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-white hover:text-primary transition-smooth">
                  Become partner
                </Link>
              </li>
              <li>
                <Link to="/journal" className="text-sm text-white hover:text-primary transition-smooth">
                  Journal
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/50">More to come</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Experiences */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              EXPERIENCES
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/romantic" className="text-sm text-white hover:text-primary transition-smooth">
                  Romantic escapes
                </Link>
              </li>
              <li>
                <Link to="/category/family" className="text-sm text-white hover:text-primary transition-smooth">
                  Family fun
                </Link>
              </li>
              <li>
                <Link to="/category/golden-age" className="text-sm text-white hover:text-primary transition-smooth">
                  Golden age
                </Link>
              </li>
              <li>
                <Link to="/category/active" className="text-sm text-white hover:text-primary transition-smooth">
                  Active break
                </Link>
              </li>
              <li>
                <Link to="/category/nature" className="text-sm text-white hover:text-primary transition-smooth">
                  Beyond nature
                </Link>
              </li>
              <li>
                <Link to="/category/taste" className="text-sm text-white hover:text-primary transition-smooth">
                  Taste affair
                </Link>
              </li>
              <li>
                <span className="text-sm text-white/50">More to come</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4">
              Get on the list
            </h4>
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <Input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50 focus-visible:border-primary" required />
              <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
                Subscribe
              </Button>
            </form>

            {/* Contact Info */}
            <div className="space-y-2">
              <a href="mailto:hello@staymakom.com" className="flex items-center gap-2 text-sm text-white hover:text-primary transition-smooth">
                <Mail className="h-4 w-4" />
                hello@staymakom.com
              </a>
              <a href="tel:+15551234567" className="flex items-center gap-2 text-sm text-white hover:text-primary transition-smooth">
                <Phone className="h-4 w-4" />
                +1 (555) 123-4567
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-4">
              <a href="https://instagram.com/staymakom" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://tiktok.com/@staymakom" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-smooth">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/staymakom" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary transition-smooth">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <p className="text-sm text-white">
            © 2025 STAYMAKOM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;