import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  X, 
  User, 
  Heart, 
  Calendar, 
  Settings,
  LayoutDashboard,
  Hotel,
  Gift,
  Users,
  BookOpen,
  HelpCircle,
  Globe,
  LogOut,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface HamburgerMenuProps {
  isScrolled?: boolean;
}

const HamburgerMenu = ({ isScrolled = false }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const categoryLinks = [
    { name: "Romantic Escapes", slug: "romantic" },
    { name: "Family Adventures", slug: "family" },
    { name: "Beyond Nature", slug: "beyond-nature" },
    { name: "Taste Affairs", slug: "taste-affair" },
    { name: "Active Breaks", slug: "active-break" },
    { name: "Golden Age Retreats", slug: "golden-age" },
  ];

  const places = [
    "Tel Aviv & Around",
    "Jerusalem & Judean Hills",
    "Negev Desert",
    "Galilee & North",
    "Dead Sea",
  ];

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={`${!isScrolled ? 'text-white hover:bg-white/10' : ''}`}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-[100] animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#FAF8F5] z-[101] overflow-y-auto animate-in slide-in-from-right duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#FAF8F5] border-b border-border/50 p-4 flex justify-between items-center">
              <span className="font-sans text-xl font-bold uppercase tracking-tight">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-6 space-y-8">
              {/* Account Section */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Account
                </h3>
                <div className="space-y-1">
                  {!user ? (
                    <>
                      <Link
                        to="/auth"
                        onClick={handleNavClick}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                      >
                        <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium">Sign in / Sign up</span>
                      </Link>
                      <div className="flex items-center gap-3 p-3 rounded-lg opacity-40 cursor-not-allowed">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Wishlist (sign in required)</span>
                      </div>
                    </>
                  ) : role === "customer" ? (
                    <>
                      <Link
                        to="/wishlist"
                        onClick={handleNavClick}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                      >
                        <Heart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/account"
                        onClick={handleNavClick}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                      >
                        <Calendar className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>My Bookings</span>
                      </Link>
                      <Link
                        to="/account"
                        onClick={handleNavClick}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                      >
                        <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span>Account Settings</span>
                      </Link>
                    </>
                  ) : role === "hotel_admin" ? (
                    <Link
                      to="/hotel-admin"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                    >
                      <Hotel className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">Hotel Dashboard</span>
                    </Link>
                  ) : role === "admin" ? (
                    <Link
                      to="/admin"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                    >
                      <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">Admin Dashboard</span>
                    </Link>
                  ) : null}
                </div>
              </section>

              <div className="border-t border-border/50" />

              {/* Explore Section */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Explore
                </h3>
                <div className="space-y-1">
                  {(categories || categoryLinks).map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      onClick={handleNavClick}
                      className="block p-3 rounded-lg hover:bg-background/60 transition-colors"
                    >
                      <span className="text-sm">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="border-t border-border/50" />

              {/* Places Section */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Places
                </h3>
                <div className="space-y-1">
                  {places.map((place) => (
                    <button
                      key={place}
                      onClick={handleNavClick}
                      className="block w-full text-left p-3 rounded-lg hover:bg-background/60 transition-colors"
                    >
                      <span className="text-sm">{place}</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="border-t border-border/50" />

              {/* Gifting & Community */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Gifting & Community
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/gift-card"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                  >
                    <Gift className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Gift Card</span>
                  </Link>
                  <Link
                    to="/journal"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                  >
                    <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Journal</span>
                  </Link>
                </div>
              </section>

              <div className="border-t border-border/50" />

              {/* For Business */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  For Business
                </h3>
                <Link
                  to="/corporate"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                >
                  <Briefcase className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span>For Companies</span>
                </Link>
              </section>

              <div className="border-t border-border/50" />

              {/* For Hotels */}
              {role !== "hotel_admin" && (
                <>
                  <section>
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                      For Hotels
                    </h3>
                    <Link
                      to="/partners"
                      onClick={handleNavClick}
                      className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors group border border-primary/20"
                    >
                      <Hotel className="h-5 w-5 text-primary" />
                      <span className="font-medium text-primary">Become a Partner</span>
                    </Link>
                  </section>
                  <div className="border-t border-border/50" />
                </>
              )}

              {/* Help & Legal */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Help & Legal
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/faq"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                  >
                    <HelpCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Help / FAQ</span>
                  </Link>
                  <Link
                    to="/legal"
                    onClick={handleNavClick}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group"
                  >
                    <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span>Terms & Privacy</span>
                  </Link>
                </div>
              </section>

              <div className="border-t border-border/50" />

              {/* Language & Session */}
              <section>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">
                  Language
                </h3>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">EN</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-muted-foreground/40">HE (coming soon)</span>
                  </div>
                </div>

                {user && (
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-background/60 transition-colors group mt-2 text-muted-foreground"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-sm">Sign out</span>
                  </button>
                )}
              </section>
            </div>

            {/* Sticky Bottom CTA for non-authenticated mobile users */}
            {!user && (
              <div className="sticky bottom-0 bg-[#FAF8F5] border-t border-border/50 p-4 sm:hidden">
                <Link to="/auth" onClick={handleNavClick}>
                  <Button size="lg" className="w-full">
                    Sign in
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default HamburgerMenu;
