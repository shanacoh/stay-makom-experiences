import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { MOBILE_HEADER_HEIGHT } from "@/constants/layout";
import { useLanguage } from "@/hooks/useLanguage";
import { useCurrency } from "@/contexts/CurrencyContext";

const MobileStickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLanguage } = useLanguage();
  const { displayCurrency, setDisplayCurrency } = useCurrency();
  const handleLang = (l: "en" | "he") => {
    setLanguage(l);
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
      className="fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 bg-[#FAF8F4] border-b border-[#E8E0D4]"
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
            <ChevronLeft className="h-5 w-5 text-[#1A1814]" />
          </button>
        ) : (
          <div className="w-11 shrink-0" />
        )}

        {/* Center: Logo */}
        <Link
          to="/launch"
          className="absolute left-1/2 -translate-x-1/2 font-sans font-bold tracking-[-0.04em] uppercase text-[20px] leading-none text-[#1A1814]"
        >
          STAYMAKOM
        </Link>

        {/* Right: Language switcher */}
        <div className="ml-auto flex items-center gap-0.5" dir="ltr">
          <button
            onClick={() => handleLang("en")}
            className={`text-[11px] tracking-[0.05em] transition-colors px-0.5 min-w-[20px] text-center ${
              lang === "en"
                ? "text-[#1A1814] font-medium"
                : "text-[#8A8578]"
            }`}
          >
            EN
          </button>
          <span className="text-[11px] text-[#C8C0B4] select-none">|</span>
          <button
            onClick={() => handleLang("he")}
            className={`text-[12px] tracking-[0.05em] transition-colors px-0.5 min-w-[20px] text-center ${
              lang === "he"
                ? "text-[#1A1814] font-medium"
                : "text-[#8A8578]"
            }`}
          >
            עב
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileStickyHeader;
