import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard, Hotel, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useLanguage } from "@/hooks/useLanguage";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isExperiencePage = location.pathname.startsWith("/experience/");
  const isDarkHeroPage = ["/gift-card", "/companies", "/corporate", "/contact", "/partners", "/about"].includes(location.pathname);
  const isTransparentPage = isHomePage || isExperiencePage || isDarkHeroPage;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, role, roles, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLanguage } = useLanguage();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };
  const getDashboardLink = () => {
    if (role === "admin") return "/admin";
    if (role === "hotel_admin") return "/hotel-admin";
    return "/account";
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 80;

      // Show/hide header based on scroll direction
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold - hide
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show immediately
        setIsVisible(true);
      }

      setIsScrolled(isTransparentPage ? scrolled : true);
      setLastScrollY(currentScrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isTransparentPage, lastScrollY]);

  const headerClasses =
    isTransparentPage && !isScrolled
      ? `fixed left-0 right-0 z-50 w-full bg-transparent backdrop-blur-none border-none transition-all duration-200 ${isVisible ? "top-0" : "-top-full"}`
      : `fixed left-0 right-0 z-50 w-full bg-background/98 backdrop-blur-sm border-b border-border/40 transition-all duration-200 ${isVisible ? "top-0" : "-top-full"}`;

  const textClasses = isTransparentPage && !isScrolled ? "text-white" : "text-foreground";

  const logoClasses = isTransparentPage && !isScrolled ? "text-white" : "text-logo";

  return (
    <header className={headerClasses} dir="ltr">
      <div className={`container flex items-center justify-between bg-transparent ${isTransparentPage && !isScrolled ? "h-16" : "h-12"}`}>
        <Link to="/" className="flex items-center space-x-2">
          <span className={`font-sans font-bold tracking-[-0.04em] uppercase ${isTransparentPage && !isScrolled ? "text-2xl" : "text-xl"} ${logoClasses}`}>STAYMAKOM</span>
        </Link>

        <div className="flex-1"></div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => setLanguage("en")}
              className={`text-xs transition-colors ${
                lang === "en"
                  ? isTransparentPage && !isScrolled
                    ? "text-white font-semibold"
                    : "text-foreground font-semibold"
                  : isTransparentPage && !isScrolled
                    ? "text-white/60 hover:text-white/80"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <span
              className={`text-xs ${isTransparentPage && !isScrolled ? "text-white/40" : "text-muted-foreground/40"}`}
            >
              |
            </span>
            <button
              onClick={() => setLanguage("he")}
              className={`text-xs transition-colors ${
                lang === "he"
                  ? isTransparentPage && !isScrolled
                    ? "text-white font-semibold"
                    : "text-foreground font-semibold"
                  : isTransparentPage && !isScrolled
                    ? "text-white/60 hover:text-white/80"
                    : "text-muted-foreground hover:text-foreground"
              }`}
            >
              עב
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className={`hidden md:flex text-xs h-7 px-3 ${isTransparentPage && !isScrolled ? "border-white/30 text-white hover:bg-white/10 hover:text-white" : "border-border/60"}`}
            onClick={() => {
              if (location.pathname !== "/") {
                navigate("/#choose-escape");
              } else {
                document.getElementById("choose-escape")?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {lang === 'he' ? 'מלון + חוויה' : 'HOTEL + EXPERIENCE'}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isTransparentPage && !isScrolled ? "text-white hover:bg-white/10" : ""}`}
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 p-0 bg-background border border-border/50 shadow-lg rounded-md overflow-hidden">
                <div className="px-3 py-2.5 border-b border-border/30">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    {role === "admin" ? "Administrator" : role === "hotel_admin" ? "Hotel Partner" : "Member"}
                  </p>
                  <p className="text-sm text-foreground truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                
                <div className="py-1">
                  <DropdownMenuItem 
                    onClick={() => navigate(getDashboardLink())}
                    className="px-3 py-2 cursor-pointer"
                  >
                    {role === "admin" ? (
                      <LayoutDashboard className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    ) : role === "hotel_admin" ? (
                      <Hotel className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    ) : (
                      <UserCircle className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {role === "admin" ? "Dashboard" : role === "hotel_admin" ? "Hotel Dashboard" : "My Account"}
                    </span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="px-3 py-2 cursor-pointer text-muted-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span className="text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className={`${isTransparentPage && !isScrolled ? "text-white hover:bg-white/10" : ""}`}
            >
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}

          <HamburgerMenu isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  );
};
export default Header;
