import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Crown, Compass, Mountain, Gem } from "lucide-react";
import { format } from "date-fns";

interface AccountHeaderProps {
  userId?: string;
  userEmail?: string;
}

const TIER_CONFIG = {
  explorer: {
    label: "Explorer",
    labelFr: "Explorateur",
    labelHe: "חוקר",
    icon: Compass,
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    nextTier: "traveler",
    nextPoints: 500,
  },
  traveler: {
    label: "Traveler",
    labelFr: "Voyageur",
    labelHe: "נוסע",
    icon: Mountain,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    nextTier: "adventurer",
    nextPoints: 1500,
  },
  adventurer: {
    label: "Adventurer",
    labelFr: "Aventurier",
    labelHe: "הרפתקן",
    icon: Star,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    nextTier: "elite",
    nextPoints: 5000,
  },
  elite: {
    label: "Elite Explorer",
    labelFr: "Explorateur Élite",
    labelHe: "חוקר עילית",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    nextTier: null,
    nextPoints: null,
  },
};

export default function AccountHeader({ userId, userEmail }: AccountHeaderProps) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile-header", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_profiles")
        .select("display_name, avatar_url, created_at, total_points, loyalty_tier")
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
  const tierConfig = TIER_CONFIG[tier];
  const TierIcon = tierConfig.icon;
  const totalPoints = profile?.total_points || 0;
  const memberSince = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "";

  // Calculate progress to next tier
  const currentTierMinPoints = tier === "explorer" ? 0 : tier === "traveler" ? 500 : tier === "adventurer" ? 1500 : 5000;
  const nextTierPoints = tierConfig.nextPoints;
  const progressPercent = nextTierPoints
    ? Math.min(100, ((totalPoints - currentTierMinPoints) / (nextTierPoints - currentTierMinPoints)) * 100)
    : 100;

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
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground truncate">
              Welcome, {displayName.split(" ")[0]}!
            </h2>
            <Badge variant="outline" className={`${tierConfig.bgColor} ${tierConfig.color} border-0 gap-1`}>
              <TierIcon className="h-3 w-3" />
              {tierConfig.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">Member since {memberSince}</p>
        </div>

        {/* Points Card */}
        <div className="w-full sm:w-auto sm:min-w-[200px] bg-background rounded-xl p-4 border border-border/50 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Gem className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{totalPoints.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">pts</span>
          </div>

          {nextTierPoints && (
            <>
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {nextTierPoints - totalPoints} pts to {TIER_CONFIG[tierConfig.nextTier as keyof typeof TIER_CONFIG]?.label}
              </p>
            </>
          )}

          {!nextTierPoints && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Crown className="h-3 w-3" /> You've reached the top tier!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
