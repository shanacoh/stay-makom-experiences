import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, LayoutDashboard, Hotel, UserCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
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
  return <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border shadow-soft">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-sans text-2xl text-logo font-bold tracking-[-0.04em]">STAYMAKOM</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Home
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            About
          </Link>
          <Link to="/faq" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            FAQ
          </Link>
          <Link to="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-smooth">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">EN</span>
            <span className="text-xs text-muted-foreground/40">|</span>
            <span className="text-xs text-muted-foreground/40 cursor-not-allowed">HE (soon)</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          
          {user ? <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <User className="h-4 w-4 mr-2" />
                  Account
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
            </DropdownMenu> : <Button variant="outline" size="sm" asChild className="hidden md:flex">
              <Link to="/auth">Sign In</Link>
            </Button>}
        </div>
      </div>
    </header>;
};
export default Header;