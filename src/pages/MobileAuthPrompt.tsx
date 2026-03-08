import { useSearchParams, useNavigate } from "react-router-dom";
import { Heart, CalendarDays, User, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useState, useEffect } from "react";

// --- Saved Tab (logged out) ---
const SavedOnboarding = ({ onDismiss }: { onDismiss: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 animate-fade-in">
    <div className="w-full max-w-xs mx-auto rounded-2xl bg-accent/30 border border-border/40 p-8 flex flex-col items-center text-center shadow-sm">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Heart size={26} className="text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="text-xl font-serif font-semibold text-foreground mb-2">
        Your saved escapes
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        Tap the heart on any stay or experience to save it here
      </p>
      <Button
        variant="outline"
        className="rounded-full px-8 border-primary text-primary hover:bg-primary/5"
        onClick={onDismiss}
      >
        Got it
      </Button>
    </div>
  </div>
);

const SavedEmptyState = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 animate-fade-in">
      <Heart size={32} strokeWidth={1.2} className="text-muted-foreground/40 mb-4" />
      <p className="text-base text-foreground font-serif mb-1">Nothing saved yet.</p>
      <p className="text-sm text-muted-foreground mb-6">Start exploring.</p>
      <button
        onClick={() => navigate("/launch")}
        className="text-sm text-primary underline underline-offset-2 hover:text-primary-glow flex items-center gap-1.5"
      >
        <Compass size={14} />
        Explore
      </button>
    </div>
  );
};

const SavedTab = () => {
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("saved_onboarding_seen");
    if (seen) setShowOnboarding(false);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("saved_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  return showOnboarding ? <SavedOnboarding onDismiss={handleDismiss} /> : <SavedEmptyState />;
};

// --- Bookings Tab (logged out) ---
const BookingsTab = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 animate-fade-in">
      <CalendarDays size={36} strokeWidth={1.2} className="text-primary/70 mb-4" />
      <h1 className="text-xl font-serif font-semibold text-foreground mb-2 text-center">
        Your bookings
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Log in to view your upcoming stays
      </p>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full px-6 border-primary text-primary hover:bg-primary/5"
        onClick={() => navigate("/auth?tab=login")}
      >
        Log in
      </Button>
    </div>
  );
};

// --- Account Tab (logged out) ---
const AccountTab = () => {
  const navigate = useNavigate();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-24 animate-fade-in">
      <User size={36} strokeWidth={1.2} className="text-primary/70 mb-4" />
      <h1 className="text-xl font-serif font-semibold text-foreground mb-2 text-center">
        My Account
      </h1>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Log in to manage your profile & preferences
      </p>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full px-6 border-primary text-primary hover:bg-primary/5"
        onClick={() => navigate("/auth?tab=login")}
      >
        Log in
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        New here?{" "}
        <button
          onClick={() => navigate("/auth?tab=signup")}
          className="text-primary underline underline-offset-2 hover:text-primary-glow"
        >
          Join the list
        </button>
      </p>
    </div>
  );
};

// --- Router ---
const tabs: Record<string, React.FC> = {
  wishlist: SavedTab,
  bookings: BookingsTab,
  account: AccountTab,
};

const MobileAuthPrompt = () => {
  const [searchParams] = useSearchParams();
  const context = searchParams.get("context") || "account";
  const TabComponent = tabs[context] || AccountTab;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TabComponent />
      <MobileBottomNav />
    </div>
  );
};

export default MobileAuthPrompt;
