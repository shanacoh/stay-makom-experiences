import { Heart, Calendar, Gift, User, Bookmark, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface AccountSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const getCopy = (lang: string) => {
  if (lang === "he") {
    return {
      bookings: "הזמנות",
      club: "המועדון שלי",
      wishlist: "מועדפים",
      savedCarts: "שמור להמשך",
      giftCards: "כרטיסי מתנה",
      myAccount: "החשבון שלי",
    };
  }
  return {
    bookings: "My Bookings",
    club: "My Club",
    wishlist: "Wishlist",
    savedCarts: "Saved for Later",
    giftCards: "Gift Cards",
    myAccount: "My Account",
  };
};

export default function AccountSidebar({ activeTab, onTabChange }: AccountSidebarProps) {
  const { lang } = useLanguage();
  const copy = getCopy(lang);

  const navItems = [
    { id: "bookings", icon: Calendar, label: copy.bookings },
    { id: "club", icon: Trophy, label: copy.club },
    { id: "wishlist", icon: Heart, label: copy.wishlist },
    { id: "savedcarts", icon: Bookmark, label: copy.savedCarts },
    { id: "giftcards", icon: Gift, label: copy.giftCards },
    { id: "profile", icon: User, label: copy.myAccount },
  ];

  return (
    <nav className="sticky top-24 space-y-1">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              "hover:bg-muted/50",
              isActive && "bg-accent/10 text-accent border-l-2 border-accent"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 transition-colors",
                isActive ? "text-accent" : "text-muted-foreground"
              )}
            />
            <span className={cn(
              "transition-colors",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
