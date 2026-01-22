import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useState, useEffect } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import AccountBubble from "@/components/auth/AccountBubble";
import AuthPromptDialog from "@/components/auth/AuthPromptDialog";

const Header = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isDarkHeroPage = [
    "/gift-card",
    "/companies",
    "/corporate",
    "/contact",
    "/partners",
    "/about",
  ].includes(location.pathname);
  const isTransparentPage = isHomePage || isDarkHeroPage;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Auth popup state
  const [authDialog, setAuthDialog] = useState<{ open: boolean; tab: "login" | "signup" }>({ open: false, tab: "login" });

  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLanguage } = useLanguage();
  const { getLocalizedPath, navigateLocalized } = useLocalizedNavigation();

  const handleSignOut = async () => {
    await signOut();
    navigateLocalized("/");
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

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
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
      ? `fixed left-0 right-0 z-50 w-full bg-transparent backdrop-blur-none border-none transition-all duration-200 ${
          isVisible ? "top-0" : "-top-full"
        }`
      : `fixed left-0 right-0 z-50 w-full bg-background/98 backdrop-blur-sm border-b border-border/40 transition-all duration-200 ${
          isVisible ? "top-0" : "-top-full"
        }`;

  const logoClasses = isTransparentPage && !isScrolled ? "text-white" : "text-logo";

  return (
    <header className={headerClasses} dir="ltr">
      <div className="container flex items-center justify-between bg-transparent h-14">
        <Link to={getLocalizedPath("/")} className="flex items-center space-x-2">
          <span
            className={`font-sans font-bold tracking-[-0.04em] uppercase text-xl ${logoClasses}`}
          >
            STAYMAKOM
          </span>
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
              className={`text-xs ${
                isTransparentPage && !isScrolled
                  ? "text-white/40"
                  : "text-muted-foreground/40"
              }`}
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
            className={`hidden md:flex text-[11px] h-6 px-2.5 ${
              isTransparentPage && !isScrolled
                ? "border-white/30 text-white hover:bg-white/10 hover:text-white"
                : "border-border/60 hover:bg-foreground/5 hover:border-border"
            }`}
            onClick={() => {
              if (location.pathname !== "/") {
                navigate(getLocalizedPath("/#choose-escape"));
              } else {
                document
                  .getElementById("choose-escape")
                  ?.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            {lang === "he" ? "מלון + חוויה" : "HOTEL + EXPERIENCE"}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${
                    isTransparentPage && !isScrolled
                      ? "text-white hover:bg-white/10"
                      : "hover:bg-foreground/5"
                  }`}
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 p-0 bg-white border border-border/30 shadow-lg rounded-xl overflow-hidden"
              >
                <div className="px-3 py-2.5 border-b border-border/30">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                    {role === "admin"
                      ? "Administrator"
                      : role === "hotel_admin"
                        ? "Hotel Partner"
                        : "Member"}
                  </p>
                  <p className="text-sm text-foreground truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>

                <div className="py-1">
                  <DropdownMenuItem
                    onClick={() => navigate(getDashboardLink())}
                    className="px-3 py-2 cursor-pointer hover:bg-black/[0.03] focus:bg-black/[0.03]"
                  >
                    {role === "admin" ? (
                      <LayoutDashboard className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    ) : role === "hotel_admin" ? (
                      <Hotel className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    ) : (
                      <UserCircle className="h-4 w-4 mr-2.5 text-muted-foreground" />
                    )}
                    <span className="text-sm">
                      {role === "admin"
                        ? "Dashboard"
                        : role === "hotel_admin"
                          ? "Hotel Dashboard"
                          : "My Account"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="px-3 py-2 cursor-pointer text-muted-foreground hover:bg-black/[0.03] focus:bg-black/[0.03]"
                  >
                    <LogOut className="h-4 w-4 mr-2.5" />
                    <span className="text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <AccountBubble
              lang={lang as "en" | "fr" | "he"}
              isTransparent={isTransparentPage && !isScrolled}
              onSignIn={() => setAuthDialog({ open: true, tab: "login" })}
              onSignUp={() => setAuthDialog({ open: true, tab: "signup" })}
            />
          )}

          <HamburgerMenu isScrolled={isScrolled} />
        </div>
      </div>
      
      {/* Auth Dialog - All-in-one signup */}
      <AuthPromptDialog
        open={authDialog.open}
        onOpenChange={(open) => setAuthDialog((prev) => ({ ...prev, open }))}
        lang={lang as "en" | "fr" | "he"}
        defaultTab={authDialog.tab}
        onSignupSuccess={() => {
          setAuthDialog({ open: false, tab: "login" });
          navigateLocalized("/account");
        }}
      />
    </header>
  );
};

export default Header;
