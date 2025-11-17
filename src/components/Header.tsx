import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, LogOut, LayoutDashboard, Hotel, UserCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isExperiencePage = location.pathname.startsWith("/experience/");
  const isTransparentPage = isHomePage || isExperiencePage;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const {
    user,
    role,
    roles,
    signOut
  } = useAuth();
  const navigate = useNavigate();
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

  const headerClasses = isTransparentPage && !isScrolled
    ? `fixed left-0 right-0 z-50 w-full bg-transparent backdrop-blur-none border-none transition-all duration-200 ${isVisible ? 'top-0' : '-top-full'}`
    : `fixed left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200 ${isVisible ? 'top-0' : '-top-full'}`;

  const textClasses = isTransparentPage && !isScrolled
    ? "text-white"
    : "text-foreground";

  const logoClasses = isTransparentPage && !isScrolled
    ? "text-white"
    : "text-logo";

  return <header className={headerClasses}>
      <div className="container flex h-16 items-center justify-between bg-transparent">
        <Link to="/" className="flex items-center space-x-2">
          <span className={`font-sans text-2xl font-bold tracking-[-0.04em] uppercase ${logoClasses}`}>STAYMAKOM</span>
        </Link>
        
        <div className="flex-1"></div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <span className={`text-xs ${isTransparentPage && !isScrolled ? 'text-white/80' : 'text-muted-foreground'}`}>EN</span>
            <span className={`text-xs ${isTransparentPage && !isScrolled ? 'text-white/40' : 'text-muted-foreground/40'}`}>|</span>
            <span className={`text-xs ${isTransparentPage && !isScrolled ? 'text-white/40' : 'text-muted-foreground/40'} cursor-not-allowed`}>HE (soon)</span>
          </div>
          
          <Link to="/partners">
            <Button 
              variant="outline" 
              size="sm" 
              className={`hidden md:flex ${isTransparentPage && !isScrolled ? 'border-white/30 text-white hover:bg-white/10 hover:text-white' : ''}`}
            >
              Hotel partnership
            </Button>
          </Link>
          
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${isTransparentPage && !isScrolled ? 'text-white hover:bg-white/10' : ''}`}
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {roles.length > 0 && (
                    <div className="font-medium text-foreground mb-1">
                      Roles: {roles.join(", ")}
                    </div>
                  )}
                  {user?.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                  {role === "admin" && <LayoutDashboard className="h-4 w-4 mr-2" />}
                  {role === "hotel_admin" && <Hotel className="h-4 w-4 mr-2" />}
                  {role === "customer" && <UserCircle className="h-4 w-4 mr-2" />}
                  {role === "admin" && "Admin Dashboard"}
                  {role === "hotel_admin" && "Hotel Dashboard"}
                  {role === "customer" && "My Account"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> : <Button 
              variant="ghost" 
              size="icon" 
              asChild 
              className={`${isTransparentPage && !isScrolled ? 'text-white hover:bg-white/10' : ''}`}
            >
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>}
          
          <HamburgerMenu isScrolled={isScrolled} />
        </div>
      </div>
    </header>;
};
export default Header;