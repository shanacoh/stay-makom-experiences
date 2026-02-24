import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface AccountHeaderProps {
  userId?: string;
  userEmail?: string;
}

const TIER_CONFIG = {
  explorer: {
    label: "Explorer",
    nextTier: "traveler" as const,
    nextLabel: "Traveler",
    nextPoints: 500,
    min: 0,
  },
  traveler: {
    label: "Traveler",
    nextTier: "insider" as const,
    nextLabel: "Insider",
    nextPoints: 1500,
    min: 500,
  },
  insider: {
    label: "Insider",
    nextTier: "circle" as const,
    nextLabel: "Circle",
    nextPoints: 3000,
    min: 1500,
  },
  circle: {
    label: "Circle",
    nextTier: null,
    nextLabel: null,
    nextPoints: null,
    min: 3000,
  },
};

const NEXT_UNLOCK_TEXT: Record<string, string> = {
  explorer: "Next unlock: Early access to limited experiences, member-only opportunities and exclusive offers.",
  traveler: "Next unlock: Priority reservations, curated insider recommendations and seasonal perks.",
  insider: "Next unlock: Private concierge, bespoke itineraries and invitation-only events.",
  circle: "You have unlocked the highest level of membership privileges.",
};

export default function AccountHeader({ userId, userEmail }: AccountHeaderProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile-header", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url, created_at, membership_progress, loyalty_tier")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 mb-8 border border-border/50">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || userEmail?.split("@")[0] || "Member";
  const tier = (profile?.loyalty_tier as keyof typeof TIER_CONFIG) || "explorer";
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.explorer;
  const progress = profile?.membership_progress || 0;
  const memberSince = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "";

  // Progress calculation
  const nextPoints = tierConfig.nextPoints;
  const tierMin = tierConfig.min;
  const progressPercent = nextPoints
    ? Math.min(100, Math.max(0, ((progress - tierMin) / (nextPoints - tierMin)) * 100))
    : 100;
  const remaining = nextPoints ? Math.max(0, nextPoints - progress) : 0;

  return (
    <div className="bg-gradient-to-br from-card to-muted/30 rounded-2xl p-6 mb-8 border border-border/50 shadow-soft">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {/* Avatar */}
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg">
          <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl font-serif">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="font-serif text-2xl sm:text-3xl text-foreground truncate">
            Welcome, {displayName.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground text-sm">Member since {memberSince}</p>
        </div>

        {/* Club Box */}
        <div className="w-full sm:w-auto sm:min-w-[260px] bg-background rounded-xl p-5 border border-border/50 shadow-sm">
          {/* Title */}
          <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            STAYMAKOM Club
          </p>

          {/* Current tier */}
          <p className="font-serif text-lg text-foreground mb-3">
            {tierConfig.label}
          </p>

          {/* Progress section */}
          <p className="text-[11px] font-medium tracking-[0.08em] uppercase text-muted-foreground mb-1.5">
            Membership Progress
          </p>

          {/* Numeric */}
          <div className="flex items-baseline gap-0.5 mb-2">
            <span className="text-lg font-semibold text-foreground">{progress.toLocaleString()}</span>
            {nextPoints && (
              <span className="text-sm text-muted-foreground">
                {" "}/ {nextPoints.toLocaleString()}
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-[3px] w-full bg-muted rounded-full overflow-hidden mb-2.5">
            <div
              className="h-full bg-foreground/70 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Distance text */}
          {nextPoints && tierConfig.nextLabel && (
            <p className="text-xs text-muted-foreground mb-2">
              You're {remaining.toLocaleString()} away from {tierConfig.nextLabel}.
            </p>
          )}

          {/* Next unlock */}
          <p className="text-[11px] leading-relaxed text-muted-foreground/80 italic">
            {NEXT_UNLOCK_TEXT[tier] || NEXT_UNLOCK_TEXT.explorer}
          </p>
        </div>
      </div>
    </div>
  );
}
