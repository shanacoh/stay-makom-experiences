import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Calendar,
  Heart,
  Gift,
  User,
  Globe,
  MessageCircle,
  LogOut,
  ChevronRight,
  Bookmark,
  Trophy,
  Info,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import AvatarUpload from "./AvatarUpload";
import TiersDrawer from "./TiersDrawer";

const TIER_CONFIG = {
  explorer: { label: "Explorer", nextLabel: "Traveler", nextPoints: 500, min: 0 },
  traveler: { label: "Traveler", nextLabel: "Wanderer", nextPoints: 1500, min: 500 },
  wanderer: { label: "Wanderer", nextLabel: "Makom", nextPoints: 5000, min: 1500 },
  insider: { label: "Insider", nextLabel: "Makom", nextPoints: 5000, min: 1500 },
  circle: { label: "Makom", nextLabel: null, nextPoints: null, min: 5000 },
  makom: { label: "Makom", nextLabel: null, nextPoints: null, min: 5000 },
};

export default function MobileAccountHome() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tiersOpen, setTiersOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile-header", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url, created_at, membership_progress, loyalty_tier")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="px-6 pt-20 pb-32 space-y-6">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-[72px] w-[72px] rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Member";
  const tier = (profile?.loyalty_tier as keyof typeof TIER_CONFIG) || "explorer";
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.explorer;
  const progress = profile?.membership_progress || 0;
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), "MMM yyyy")
    : "";

  const nextPoints = tierConfig.nextPoints;
  const tierMin = tierConfig.min;
  const progressPercent = nextPoints
    ? Math.min(100, Math.max(0, ((progress - tierMin) / (nextPoints - tierMin)) * 100))
    : 100;
  const remaining = nextPoints ? Math.max(0, nextPoints - progress) : 0;

  const menuItems = [
    { icon: Calendar, label: "My Bookings", onClick: () => navigate("/account?tab=bookings") },
    { icon: Trophy, label: "My Club", onClick: () => setTiersOpen(true) },
    { icon: Heart, label: "Saved Escapes", onClick: () => navigate("/account?tab=wishlist") },
    { icon: Bookmark, label: "Saved for Later", onClick: () => navigate("/account?tab=savedcarts") },
    { icon: Gift, label: "Gift Cards", onClick: () => navigate("/account?tab=giftcards") },
    { icon: User, label: "Personal Information", onClick: () => navigate("/account?tab=profile") },
    { icon: Globe, label: "Language & Currency", onClick: () => toast.info("Use the language switcher in the header bar.") },
    { icon: MessageCircle, label: "Help & Support", onClick: () => navigate("/contact") },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/launch");
  };

  return (
    <>
      <div className="px-6 pt-20 pb-32">
        {/* TOP — Avatar + Name */}
        <div className="flex flex-col items-center text-center pt-4 mb-4">
          <AvatarUpload
            userId={user?.id || ""}
            avatarUrl={profile?.avatar_url}
            displayName={displayName}
            size="sm"
          />
          <h1 className="text-[20px] font-bold text-foreground leading-tight mt-3">
            {displayName}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Member since {memberSince}
          </p>
        </div>

        {/* Club card */}
        <div className="rounded-xl border border-border/50 bg-card p-4 mb-6">
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            STAYMAKOM CLUB
          </p>

          <button
            onClick={() => setTiersOpen(true)}
            className="flex items-center gap-1 mb-3 group"
          >
            <span className="font-serif text-xl text-foreground border-b border-dashed border-muted-foreground/40 group-hover:border-foreground transition-colors">
              {tierConfig.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>

          {/* Progress bar */}
          <div className="h-1 w-full bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-[#C4714A] transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">
              {progress} pts
              {nextPoints && tierConfig.nextLabel && (
                <> · {remaining.toLocaleString()} pts to {tierConfig.nextLabel}</>
              )}
            </p>
          </div>
        </div>

        {/* MENU LIST */}
        <div>
          {menuItems.map((item, i) => (
            <div key={item.label}>
              {i > 0 && <Separator className="my-0" />}
              <button
                onClick={item.onClick}
                className="w-full flex items-center gap-3.5 h-14 text-left transition-colors active:bg-muted/40"
              >
                <item.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="flex-1 text-[15px] text-foreground">{item.label}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
              </button>
            </div>
          ))}

          <Separator className="my-0" />

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3.5 h-14 text-left transition-colors active:bg-muted/40"
          >
            <LogOut className="h-5 w-5 text-destructive/70 flex-shrink-0" />
            <span className="flex-1 text-[15px] text-destructive/80">Sign Out</span>
          </button>
        </div>
      </div>

      <TiersDrawer
        open={tiersOpen}
        onOpenChange={setTiersOpen}
        currentTier={tier}
        currentPoints={progress}
      />
    </>
  );
}
