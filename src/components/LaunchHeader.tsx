import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import LaunchHamburgerMenu from "@/components/LaunchHamburgerMenu";
import { useLanguage } from "@/hooks/useLanguage";
import { useLocalizedNavigation } from "@/hooks/useLocalizedNavigation";
import AccountBubble from "@/components/auth/AccountBubble";
import AuthPromptDialog from "@/components/auth/AuthPromptDialog";
import UserDropdown from "@/components/auth/UserDropdown";

const LaunchHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [authDialog, setAuthDialog] = useState<{ open: boolean; tab: "login" | "signup"; context: "favorites" | "account" | "signup" }>({ open: false, tab: "login", context: "account" });

  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { lang, setLanguage } = useLanguage();
  const { getLocalizedPath, navigateLocalized } = useLocalizedNavigation();

  const handleSignOut = async () => {
    await signOut();
    navigateLocalized("/");
  };

  const handleFavoritesClick = () => {
    if (user) {
      navigate("/account?tab=wishlist");
    } else {
      setAuthDialog({ open: true, tab: "login", context: "favorites" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolled = currentScrollY > 60;

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      setIsScrolled(scrolled);
      setLastScrollY(currentScrollY);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const headerClasses = !isScrolled
    ? `fixed left-0 right-0 z-50 w-full bg-transparent backdrop-blur-none border-b border-transparent transition-all duration-300 ease-in-out ${isVisible ? "top-0" : "-top-full"}`
    : `fixed left-0 right-0 z-50 w-full bg-background/95 backdrop-blur-[12px] border-b border-foreground/8 transition-all duration-300 ease-in-out ${isVisible ? "top-0" : "-top-full"}`;

  const logoClasses = !isScrolled ? "text-white" : "text-logo";

  return (
    <header className={headerClasses} dir="ltr">
      <div className="container flex items-center justify-between bg-transparent h-14">
        <Link to="/launch" className="flex items-center space-x-2">
          <span className={`font-sans font-bold tracking-[-0.04em] uppercase text-xl ${logoClasses}`}>
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
                  ? !isScrolled ? "text-white font-semibold" : "text-foreground font-semibold"
                  : !isScrolled ? "text-white/60 hover:text-white/80" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              EN
            </button>
            <span className={`text-xs ${!isScrolled ? "text-white/40" : "text-muted-foreground/40"}`}>|</span>
            <button
              onClick={() => setLanguage("he")}
              className={`text-xs transition-colors ${
                lang === "he"
                  ? !isScrolled ? "text-white font-semibold" : "text-foreground font-semibold"
                  : !isScrolled ? "text-white/60 hover:text-white/80" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              עב
            </button>
          </div>

          {/* No HOTEL + EXPERIENCE button on launch page */}

          {user ? (
            <UserDropdown
              user={user}
              isTransparent={!isScrolled}
              onSignOut={handleSignOut}
            />
          ) : (
            <AccountBubble
              lang={lang as "en" | "fr" | "he"}
              isTransparent={!isScrolled}
              onSignIn={() => setAuthDialog({ open: true, tab: "login", context: "account" })}
              onSignUp={() => setAuthDialog({ open: true, tab: "signup", context: "signup" })}
            />
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavoritesClick}
            className={`h-8 w-8 ${!isScrolled ? "text-white hover:bg-white/10" : "hover:bg-foreground/5"}`}
          >
            <Heart className="h-5 w-5" />
          </Button>

          <LaunchHamburgerMenu isScrolled={isScrolled} />
        </div>
      </div>

      <AuthPromptDialog
        open={authDialog.open}
        onOpenChange={(open) => setAuthDialog((prev) => ({ ...prev, open }))}
        lang={lang as "en" | "fr" | "he"}
        defaultTab={authDialog.tab}
        context={authDialog.context}
        onSignupSuccess={() => {
          setAuthDialog({ open: false, tab: "login", context: "account" });
          navigateLocalized("/account");
        }}
      />
    </header>
  );
};

export default LaunchHeader;
