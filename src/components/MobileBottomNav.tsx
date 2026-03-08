import { useLocation, useNavigate } from "react-router-dom";
import { Compass, Heart, CalendarDays, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import AuthPromptDialog from "@/components/auth/AuthPromptDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  labelEn: string;
  labelHe: string;
  path: string;
  requiresAuth?: boolean;
  authContext?: "favorites" | "account";
}

const navItems: NavItem[] = [
  { icon: Compass, labelEn: "Explore", labelHe: "גלה", path: "/launch" },
  { icon: Heart, labelEn: "Saved", labelHe: "שמור", path: "/account?tab=wishlist", requiresAuth: true, authContext: "favorites" },
  { icon: CalendarDays, labelEn: "Bookings", labelHe: "הזמנות", path: "/account?tab=my-staymakom", requiresAuth: true, authContext: "account" },
  { icon: User, labelEn: "My Account", labelHe: "החשבון שלי", path: "/account", requiresAuth: true, authContext: "account" },
];

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [authDialog, setAuthDialog] = useState<{ open: boolean; tab: "login" | "signup"; context: "favorites" | "account" }>({
    open: false, tab: "login", context: "account",
  });

  const isActive = (path: string) => {
    if (path === "/launch") return location.pathname === "/launch" || location.pathname === "/launch/experiences";
    return location.pathname + location.search === path;
  };

  const handleTap = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      setAuthDialog({ open: true, tab: "login", context: item.authContext || "account" });
      return;
    }
    navigate(item.path);
  };

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-secondary/60 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => handleTap(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 pt-1.5 transition-colors",
                  active ? "text-primary" : "text-[#9e9e9e]"
                )}
              >
                <item.icon size={22} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] leading-tight">{item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AuthPromptDialog
        open={authDialog.open}
        onOpenChange={(open) => setAuthDialog((prev) => ({ ...prev, open }))}
        lang={lang as "en" | "fr" | "he"}
        defaultTab={authDialog.tab}
        context={authDialog.context}
        onSignupSuccess={() => {
          setAuthDialog({ open: false, tab: "login", context: "account" });
          navigate("/account");
        }}
      />
    </>
  );
};

export default MobileBottomNav;
