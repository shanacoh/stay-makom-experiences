import { Link } from "react-router-dom";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import { Compass, Heart } from "lucide-react";
import { useState, useEffect } from "react";

const MobileStickyHeader = () => {
  const { getLocalizedPath } = useLocalizedNavigation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show header only after scrolling past the hero
      const heroHeight = window.innerHeight * 0.62;
      setIsScrolled(window.scrollY > heroHeight - 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-[12px] border-b border-foreground/8 translate-y-0"
          : "-translate-y-full"
      }`}
    >
      {/* Row 1: Logo */}
      <div className="flex justify-center py-2">
        <Link
          to="/launch"
          className={`font-sans font-bold tracking-[-0.04em] uppercase text-[20px] transition-colors duration-300 ${
            isScrolled ? "text-foreground" : "text-white"
          }`}
        >
          STAYMAKOM
        </Link>
      </div>

      {/* Row 2: Category pills */}
      <div className="flex justify-center gap-2 pb-2.5">
        <Link
          to={getLocalizedPath("/launch/experiences?filter=adventure&context=launch")}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary text-[12px] font-medium tracking-wide transition-colors hover:bg-primary/5"
        >
          <Compass size={13} strokeWidth={1.5} />
          Feeling Adventurous
        </Link>
        <Link
          to={getLocalizedPath("/launch/experiences?filter=romantic&context=launch")}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary text-primary text-[12px] font-medium tracking-wide transition-colors hover:bg-primary/5"
        >
          <Heart size={13} strokeWidth={1.5} />
          Romantic Escape
        </Link>
      </div>
    </header>
  );
};

export default MobileStickyHeader;
