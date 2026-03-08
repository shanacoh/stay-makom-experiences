import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MOBILE_HEADER_HEIGHT } from "@/constants/layout";
import { useLanguage } from "@/hooks/useLanguage";

const MobileStickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { lang, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
        isScrolled
          ? "bg-mobile-header"
          : "bg-transparent"
      }`}
      style={{ height: MOBILE_HEADER_HEIGHT }}
    >
      <div className="flex justify-between items-center h-full px-4">
        <Link
          to="/launch"
          className={`font-sans font-bold tracking-[-0.04em] uppercase text-[20px] leading-none transition-colors duration-300 ${
            isScrolled ? "text-mobile-logo" : "text-white"
          }`}
        >
          STAYMAKOM
        </Link>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLanguage("en")}
            className={`text-[11px] transition-colors ${
              lang === "en"
                ? isScrolled ? "text-mobile-logo font-medium" : "text-white font-medium"
                : isScrolled ? "text-mobile-logo/50" : "text-white/50"
            }`}
          >
            EN
          </button>
          <span className={`text-[11px] ${isScrolled ? "text-mobile-logo/30" : "text-white/30"}`}>|</span>
          <button
            onClick={() => setLanguage("he")}
            className={`text-[11px] transition-colors ${
              lang === "he"
                ? isScrolled ? "text-mobile-logo font-medium" : "text-white font-medium"
                : isScrolled ? "text-mobile-logo/50" : "text-white/50"
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
