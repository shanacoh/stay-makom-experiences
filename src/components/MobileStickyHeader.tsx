import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { MOBILE_HEADER_HEIGHT } from "@/constants/layout";
import { useLanguage } from "@/hooks/useLanguage";
import { useCurrency } from "@/contexts/CurrencyContext";

const MobileStickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLanguage } = useLanguage();
  const { setDisplayCurrency } = useCurrency();
  const handleLang = (l: "en" | "he") => {
    setLanguage(l);
    setDisplayCurrency(l === "he" ? "ILS" : "USD");
  };
  const location = useLocation();
  const navigate = useNavigate();

  const isLaunchHome = location.pathname === "/launch" || location.pathname === "/launch/experiences";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 bg-mobile-header border-b border-mobile-border"
      style={{ height: MOBILE_HEADER_HEIGHT }}
    >
      <div className="relative flex items-center h-full px-2">
        {/* Left: Back arrow or spacer */}
        {!isLaunchHome ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-11 h-11 -ml-1 shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5 text-mobile-logo" />
          </button>
        ) : (
          <div className="w-11 shrink-0" />
        )}

        {/* Center: Logo */}
        <Link
          to="/launch"
          className="absolute left-1/2 -translate-x-1/2 font-sans font-bold tracking-[-0.04em] uppercase text-[20px] leading-none text-mobile-logo"
        >
          STAYMAKOM
        </Link>

        {/* Right: Language switcher */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => handleLang("en")}
            className={`text-[11px] transition-colors ${
              lang === "en"
                ? "text-mobile-logo font-medium"
                : "text-mobile-logo/50"
            }`}
          >
            EN · $
          </button>
          <span className="text-[11px] text-mobile-logo/30">|</span>
          <button
            onClick={() => handleLang("he")}
            className={`text-[11px] transition-colors ${
              lang === "he"
                ? "text-mobile-logo font-medium"
                : "text-mobile-logo/50"
            }`}
          >
            עב · ₪
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileStickyHeader;
