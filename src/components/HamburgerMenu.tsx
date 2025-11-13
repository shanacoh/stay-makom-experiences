import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

interface HamburgerMenuProps {
  isScrolled?: boolean;
}

const HamburgerMenu = ({ isScrolled = false }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { label: "Gift card", to: "/gift-card" },
    { label: "Company reward", to: "/corporate" },
    { label: "Hotel partnership", to: "/partners" },
    { label: "Journal blogging", to: "/journal" },
    { label: "About staymakom", to: "/about" },
    { label: "Contact us", to: "/contact" },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${!isScrolled ? 'text-white hover:bg-white/10' : ''}`}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[230px] p-2 bg-white border border-border/10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] rounded-xl"
        sideOffset={8}
      >
        <nav className="flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className="px-4 py-3 text-[15px] text-[#111111] hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
          {!user && (
            <Link
              to="/auth"
              onClick={handleNavClick}
              className="px-4 py-3 text-[15px] text-[#111111] hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              Sign in
            </Link>
          )}
        </nav>
      </PopoverContent>
    </Popover>
  );
};

export default HamburgerMenu;
