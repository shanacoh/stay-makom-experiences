import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MOBILE_HEADER_HEIGHT } from "@/constants/layout";

const MobileStickyHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

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
    >
      <div className="flex justify-center py-2">
        <Link
          to="/launch"
          className={`font-sans font-bold tracking-[-0.04em] uppercase text-[20px] transition-colors duration-300 ${
            isScrolled ? "text-mobile-logo" : "text-white"
          }`}
        >
          STAYMAKOM
        </Link>
      </div>
    </header>
  );
};

export default MobileStickyHeader;
