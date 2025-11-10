import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, LayoutDashboard, Hotel, UserCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    user,
    role,
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
    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const headerClasses = isHomePage && !isScrolled
    ? "sticky top-0 z-50 w-full bg-transparent backdrop-blur-none border-none transition-all duration-200"
    : "sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-200";

  const textClasses = isHomePage && !isScrolled
    ? "text-white"
    : "text-foreground";

  const logoClasses = "text-logo";

  return <header className={headerClasses}>
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className={`font-sans text-2xl font-bold tracking-[-0.04em] uppercase ${logoClasses}`}>STAYMAKOM</span>
        </Link>
        
        <div className="flex-1"></div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <span className={`text-xs ${isHomePage && !isScrolled ? 'text-white/80' : 'text-muted-foreground'}`}>EN</span>
            <span className={`text-xs ${isHomePage && !isScrolled ? 'text-white/40' : 'text-muted-foreground/40'}`}>|</span>
            <span className={`text-xs ${isHomePage && !isScrolled ? 'text-white/40' : 'text-muted-foreground/40'} cursor-not-allowed`}>HE (soon)</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`hidden md:flex ${isHomePage && !isScrolled ? 'border-white/30 text-white hover:bg-white/10 hover:text-white' : ''}`}
          >
            Become a Partner
          </Button>
          
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${isHomePage && !isScrolled ? 'text-white hover:bg-white/10' : ''}`}
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
              className={`${isHomePage && !isScrolled ? 'text-white hover:bg-white/10' : ''}`}
            >
              <Link to="/auth">
                <User className="h-5 w-5" />
              </Link>
            </Button>}
          
          <Button variant="ghost" size="icon" className={`${isHomePage && !isScrolled ? 'text-white hover:bg-white/10' : ''}`}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>;
};
export default Header;