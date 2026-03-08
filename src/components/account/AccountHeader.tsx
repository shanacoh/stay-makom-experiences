import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import AvatarUpload from "./AvatarUpload";
import TiersDrawer from "./TiersDrawer";

interface AccountHeaderProps {
  userId?: string;
  userEmail?: string;
}

const TIER_CONFIG = {
  explorer: { label: "Explorer", nextLabel: "Traveler", nextPoints: 500, min: 0 },
  traveler: { label: "Traveler", nextLabel: "Wanderer", nextPoints: 1500, min: 500 },
  wanderer: { label: "Wanderer", nextLabel: "Makom", nextPoints: 5000, min: 1500 },
  insider: { label: "Insider", nextLabel: "Makom", nextPoints: 5000, min: 1500 },
  circle: { label: "Makom", nextLabel: null, nextPoints: null, min: 5000 },
  makom: { label: "Makom", nextLabel: null, nextPoints: null, min: 5000 },
};

const NEXT_UNLOCK: Record<string, string> = {
  explorer: "Reach Traveler by booking 500 pts of experiences.\nUnlock: Early access · Member-only rates · Exclusive invitations",
  traveler: "Reach Wanderer with 1,500 pts.\nUnlock: Priority booking · Concierge chat · Surprise gifts",
  wanderer: "Reach Makom with 5,000 pts.\nUnlock: VIP events · Complimentary upgrades · Personal curation",
  insider: "Reach Makom with 5,000 pts.\nUnlock: VIP events · Complimentary upgrades · Personal curation",
  circle: "You've reached the highest membership level.",
  makom: "You've reached the highest membership level.",
};

export default function AccountHeader({ userId, userEmail }: AccountHeaderProps) {
  const [tiersOpen, setTiersOpen] = useState(false);
  const queryClient = useQueryClient();

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
      <div className="mb-8 flex items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || userEmail?.split("@")[0] || "Member";
  const tier = (profile?.loyalty_tier as keyof typeof TIER_CONFIG) || "explorer";
  const tierConfig = TIER_CONFIG[tier] || TIER_CONFIG.explorer;
  const progress = profile?.membership_progress || 0;
  const memberSince = profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "";

  const nextPoints = tierConfig.nextPoints;
  const tierMin = tierConfig.min;
  const progressPercent = nextPoints
    ? Math.min(100, Math.max(0, ((progress - tierMin) / (nextPoints - tierMin)) * 100))
    : 100;
  const remaining = nextPoints ? Math.max(0, nextPoints - progress) : 0;

  return (
    <>
      <div className="mb-8 flex flex-col sm:flex-row items-start gap-6">
        {/* Left: Avatar + name */}
        <div className="flex items-center gap-4">
          <AvatarUpload
            userId={userId!}
            avatarUrl={profile?.avatar_url}
            displayName={displayName}
            size="md"
            onUploaded={() => queryClient.invalidateQueries({ queryKey: ["user-profile-header", userId] })}
          />
          <div>
            <h2 className="text-[22px] font-bold text-foreground leading-tight">{displayName}</h2>
            <p className="text-[13px] text-muted-foreground">Member since {memberSince}</p>
          </div>
        </div>

        {/* Right: Club card */}
        <div className="w-full sm:w-auto sm:min-w-[280px] sm:ml-auto rounded-xl p-5 border border-border/50 bg-card">
          <p className="text-[10px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
            STAYMAKOM CLUB
          </p>

          {/* Clickable tier name */}
          <button
            onClick={() => setTiersOpen(true)}
            className="flex items-center gap-1 mb-3 group cursor-pointer"
          >
            <span className="font-serif text-2xl text-foreground border-b border-dashed border-muted-foreground/40 group-hover:border-foreground transition-colors">
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

          {/* Points label */}
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground">
              {progress} pts
              {nextPoints && tierConfig.nextLabel && (
                <> · {remaining.toLocaleString()} pts to {tierConfig.nextLabel}</>
              )}
            </p>
            {nextPoints && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[240px] text-xs whitespace-pre-line">
                  {NEXT_UNLOCK[tier] || NEXT_UNLOCK.explorer}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
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
