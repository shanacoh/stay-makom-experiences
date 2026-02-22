import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";

interface LaunchHamburgerMenuProps {
  isScrolled?: boolean;
}

const LaunchHamburgerMenu = ({ isScrolled = false }: LaunchHamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookExpanded, setBookExpanded] = useState(false);
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { getLocalizedPath } = useLocalizedNavigation();
  const isRTL = lang === "he";

  const handleNavClick = () => {
    setIsOpen(false);
    setBookExpanded(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setBookExpanded(false); }}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${!isScrolled ? "text-white hover:bg-white/10" : "hover:bg-foreground/5"}`}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[230px] p-2 bg-white border border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl"
        sideOffset={8}
      >
        <nav className="flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
          {/* Book Your Stay with sub-items */}
          <button
            onClick={() => setBookExpanded(!bookExpanded)}
            className="flex items-center justify-between px-4 py-3 text-[15px] text-foreground hover:bg-foreground/5 rounded-lg transition-colors w-full text-left"
          >
            <span>{isRTL ? "הזמן את השהות שלך" : "Book Your Stay"}</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${bookExpanded ? "rotate-180" : ""}`} />
          </button>
          {bookExpanded && (
            <div className={`${isRTL ? "mr-3 border-r pr-2" : "ml-3 border-l pl-2"} border-border/20`}>
              <Link
                to={getLocalizedPath("/experiences2?filter=adventure")}
                onClick={handleNavClick}
                className="px-4 py-2.5 text-[14px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors block"
              >
                {isRTL ? "הרפתקה" : "Feel Adventurous"}
              </Link>
              <Link
                to={getLocalizedPath("/experiences2?filter=romantic")}
                onClick={handleNavClick}
                className="px-4 py-2.5 text-[14px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-lg transition-colors block"
              >
                {isRTL ? "בריחה רומנטית" : "Romantic Escape"}
              </Link>
            </div>
          )}

          <Link
            to={getLocalizedPath("/about")}
            onClick={handleNavClick}
            className="px-4 py-3 text-[15px] text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
          >
            {isRTL ? "אודות" : "About"}
          </Link>

          <Link
            to={getLocalizedPath("/contact")}
            onClick={handleNavClick}
            className="px-4 py-3 text-[15px] text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
          >
            {isRTL ? "צרו קשר" : "Contact Us"}
          </Link>

          {!user && (
            <Link
              to={getLocalizedPath("/auth")}
              onClick={handleNavClick}
              className="px-4 py-3 text-[15px] text-foreground hover:bg-foreground/5 rounded-lg transition-colors"
            >
              {isRTL ? "התחברות" : "Sign In"}
            </Link>
          )}
        </nav>
      </PopoverContent>
    </Popover>
  );
};

export default LaunchHamburgerMenu;
