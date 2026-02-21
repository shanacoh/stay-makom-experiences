import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const LaunchFooter = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("leads").insert({
        source: "newsletter",
        email: email.trim(),
      });
      if (error) throw error;
      toast.success("You're in! Welcome to the journey.");
      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="container py-8">
        {/* Desktop Layout - 4 columns */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Column 1: Brand */}
          <div>
            <h3 className="font-sans text-xl font-bold uppercase tracking-[-0.04em] mb-2 text-slate-50">
              STAYMAKOM
            </h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Handpicked Hotels. Unforgettable Experiences.
            </p>
          </div>

          {/* Column 2: STAYMAKOM */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              STAYMAKOM
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/gift-card" className="text-sm text-white hover:text-primary transition-smooth">
                  Gift Card
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-sm text-white hover:text-primary transition-smooth">
                  Become a Partner
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              Explore
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/category/adventure" className="text-sm text-white hover:text-primary transition-smooth">
                  Feel Adventurous
                </Link>
              </li>
              <li>
                <Link to="/category/romantic" className="text-sm text-white hover:text-primary transition-smooth">
                  Romantic Escape
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Social & Email */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              Join the journey
            </h4>
            <form onSubmit={handleNewsletterSubmit} className="mb-5">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50 focus-visible:border-primary"
                required
              />
              <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
                Subscribe
              </Button>
            </form>

            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-slate-50">
              Follow us
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/staymakom/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-smooth"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@staymakom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-smooth"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Watch us build. Discover Israel differently.
            </p>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-6">
          {/* Brand */}
          <div className="pb-4 border-b border-white/20">
            <h3 className="font-sans text-2xl font-bold uppercase tracking-[-0.04em] mb-2 text-slate-50">
              STAYMAKOM
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              Handpicked Hotels. Unforgettable Experiences.
            </p>
          </div>

          {/* Links row */}
          <div className="grid grid-cols-2 gap-6 pb-4 border-b border-white/20">
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-3 text-slate-50">
                STAYMAKOM
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/gift-card" className="text-sm text-white/80 hover:text-primary transition-smooth">
                    Gift Card
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="text-sm text-white/80 hover:text-primary transition-smooth">
                    Become a Partner
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-3 text-slate-50">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/category/adventure" className="text-sm text-white/80 hover:text-primary transition-smooth">
                    Feel Adventurous
                  </Link>
                </li>
                <li>
                  <Link to="/category/romantic" className="text-sm text-white/80 hover:text-primary transition-smooth">
                    Romantic Escape
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h4 className="font-sans text-sm font-semibold uppercase tracking-wider mb-4 text-slate-50">
              Join the journey
            </h4>
            <form onSubmit={handleNewsletterSubmit} className="mb-5">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white text-sm placeholder:text-white/50 focus-visible:border-primary"
                required
              />
              <Button type="submit" variant="secondary" size="sm" className="mt-2 w-full">
                Subscribe
              </Button>
            </form>

            <p className="font-sans text-xs font-semibold uppercase tracking-wider mb-3 text-slate-50">
              Follow us
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/staymakom/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-smooth"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com/@staymakom"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-primary transition-smooth"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-white/60 mt-3 leading-relaxed">
              Watch us build. Discover Israel differently.
            </p>
          </div>
        </div>

        {/* Bottom legal line */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-white/60">
          <Link to="/privacy" className="hover:text-white transition-smooth">Privacy Policy</Link>
          <span className="hidden sm:inline">·</span>
          <Link to="/terms" className="hover:text-white transition-smooth">Terms</Link>
          <span className="hidden sm:inline">·</span>
          <span>© 2026 STAYMAKOM</span>
        </div>
      </div>
    </footer>
  );
};

export default LaunchFooter;
