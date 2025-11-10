import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-serif text-2xl font-bold text-primary">STAYMAKOM</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            FAQ
          </Link>
          <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">EN</span>
            <span className="text-xs text-muted-foreground/40">|</span>
            <span className="text-xs text-muted-foreground/40 cursor-not-allowed">HE (soon)</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden md:flex">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;