/**
 * Tiers Drawer — shows STAYMAKOM Club membership tiers.
 * Mobile: slide-up drawer. Desktop: centered dialog.
 */

import { useNavigate } from "react-router-dom";
import { Lock, ChevronRight } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface TiersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: string;
  currentPoints: number;
}

const TIERS = [
  {
    key: "explorer",
    label: "Explorer",
    emoji: "🧭",
    points: 0,
    perks: [
      "Access to all curated experiences",
      "Member newsletter & early news",
      "Wishlist & saved escapes",
    ],
  },
  {
    key: "traveler",
    label: "Traveler",
    emoji: "✈️",
    points: 500,
    perks: [
      "Early access to new experiences",
      "Member-only rates",
      "Exclusive event invitations",
    ],
  },
  {
    key: "wanderer",
    label: "Wanderer",
    emoji: "🌿",
    points: 1500,
    perks: [
      "Priority booking",
      "Dedicated concierge chat",
      "Surprise gift on first Wanderer stay",
    ],
  },
  {
    key: "makom",
    label: "Makom",
    emoji: "✨",
    points: 5000,
    perks: [
      "VIP access to private STAYMAKOM events",
      "Complimentary upgrade requests",
      "Personalized escape curation",
    ],
  },
];

function getTierIndex(tier: string) {
  const idx = TIERS.findIndex((t) => t.key === tier);
  return idx >= 0 ? idx : 0;
}

function TiersContent({ currentTier, currentPoints, onClose }: TiersDrawerProps & { onClose: () => void }) {
  const navigate = useNavigate();
  const currentIdx = getTierIndex(currentTier);
  const nextTier = currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
  const remaining = nextTier ? Math.max(0, nextTier.points - currentPoints) : 0;
  const progressMax = nextTier ? nextTier.points : TIERS[TIERS.length - 1].points;
  const progressPct = nextTier
    ? Math.min(100, Math.max(0, ((currentPoints - TIERS[currentIdx].points) / (nextTier.points - TIERS[currentIdx].points)) * 100))
    : 100;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground mb-1">
          STAYMAKOM CLUB
        </p>
        <p className="text-sm text-muted-foreground">
          The more you explore, the more you belong.
        </p>
      </div>

      {/* Progress */}
      <div className="px-1">
        <p className="text-xs text-muted-foreground mb-2">
          You're at <span className="font-semibold text-foreground">{currentPoints} pts</span>
          {nextTier && (
            <> · {remaining.toLocaleString()} pts to {nextTier.label}</>
          )}
        </p>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-[#C4714A] transition-all duration-1000 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Tiers list */}
      <div className="space-y-3">
        {TIERS.map((tier, idx) => {
          const isCurrent = idx === currentIdx;
          const isNext = idx === currentIdx + 1;
          const isLocked = idx > currentIdx + 1;
          const ptsAway = Math.max(0, tier.points - currentPoints);

          return (
            <div
              key={tier.key}
              className={cn(
                "rounded-xl p-4 transition-all",
                isCurrent && "bg-[#FAF5EF] border-l-[3px] border-[#C4714A]",
                isNext && "border border-dashed border-border",
                isLocked && "opacity-50",
                !isCurrent && !isNext && !isLocked && "border border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{tier.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{tier.label}</span>
                    <span className="text-xs text-muted-foreground">— {tier.points.toLocaleString()} pts</span>
                    {isCurrent && (
                      <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C4714A] text-white">
                        YOUR TIER
                      </span>
                    )}
                    {isNext && (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground">
                        NEXT · {ptsAway.toLocaleString()} pts away
                      </span>
                    )}
                    {isLocked && (
                      <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground/50" />
                    )}
                  </div>
                  <ul className="mt-1.5 space-y-0.5">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="mt-0.5">·</span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          onClose();
          navigate("/experiences");
        }}
      >
        Start exploring to earn points
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

export default function TiersDrawer({ open, onOpenChange, currentTier, currentPoints }: TiersDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="sr-only">STAYMAKOM Club</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-6">
            <TiersContent
              open={open}
              onOpenChange={onOpenChange}
              currentTier={currentTier}
              currentPoints={currentPoints}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">STAYMAKOM Club</DialogTitle>
        </DialogHeader>
        <TiersContent
          open={open}
          onOpenChange={onOpenChange}
          currentTier={currentTier}
          currentPoints={currentPoints}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
