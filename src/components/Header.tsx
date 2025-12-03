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
  const isTransparentPage = isHomePage || isExperiencePage;
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
    <header className={headerClasses}>
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
            HOTEL + EXPERIENCE
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
              <DropdownMenuContent align="end" className="w-72 p-0 bg-background border border-border/60 shadow-xl rounded-lg overflow-hidden">
                {/* Header Section */}
                <div className="px-5 py-4 bg-gradient-to-br from-muted/50 to-muted/30 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      role === "admin" 
                        ? "bg-primary/10 text-primary" 
                        : role === "hotel_admin" 
                          ? "bg-amber-500/10 text-amber-600" 
                          : "bg-emerald-500/10 text-emerald-600"
                    }`}>
                      {role === "admin" ? (
                        <LayoutDashboard className="h-5 w-5" />
                      ) : role === "hotel_admin" ? (
                        <Hotel className="h-5 w-5" />
                      ) : (
                        <UserCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                        {role === "admin" ? "Administrator" : role === "hotel_admin" ? "Hotel Partner" : "Member"}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions Section */}
                <div className="p-2">
                  <DropdownMenuItem 
                    onClick={() => navigate(getDashboardLink())}
                    className="px-3 py-2.5 rounded-md cursor-pointer focus:bg-muted/80"
                  >
                    {role === "admin" ? (
                      <>
                        <LayoutDashboard className="h-4 w-4 mr-3 text-primary" />
                        <span className="font-medium">Admin Dashboard</span>
                      </>
                    ) : role === "hotel_admin" ? (
                      <>
                        <Hotel className="h-4 w-4 mr-3 text-amber-600" />
                        <span className="font-medium">Hotel Dashboard</span>
                      </>
                    ) : (
                      <>
                        <UserCircle className="h-4 w-4 mr-3 text-emerald-600" />
                        <span className="font-medium">My Account</span>
                      </>
                    )}
                  </DropdownMenuItem>
                </div>
                
                {/* Sign Out Section */}
                <div className="p-2 pt-0 border-t border-border/40">
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="px-3 py-2.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground focus:bg-muted/80"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    <span>Sign Out</span>
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
