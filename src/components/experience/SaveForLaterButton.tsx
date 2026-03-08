import { useState } from "react";
import { Bookmark, Clock, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaveForLaterButtonProps {
  experienceId: string;
  checkin?: string;   // ISO date
  checkout?: string;  // ISO date
  partySize?: number;
  roomCode?: string;
  roomName?: string;
  lang?: "en" | "he" | "fr";
  className?: string;
  variant?: "inline" | "full";
}

const copy = {
  en: { save: "Save for later", saved: "Saved!", saving: "Saving…" },
  he: { save: "שמור להמשך", saved: "!נשמר", saving: "שומר…" },
  fr: { save: "Sauvegarder", saved: "Sauvegardé !", saving: "En cours…" },
};

export function SaveForLaterButton({
  experienceId,
  checkin,
  checkout,
  partySize = 2,
  roomCode,
  roomName,
  lang = "en",
  className,
  variant = "inline",
}: SaveForLaterButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const t = copy[lang] || copy.en;

  // Check if already saved
  const { data: existing } = useQuery({
    queryKey: ["saved-cart", user?.id, experienceId],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("saved_carts" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("experience_id", experienceId)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const isSaved = !!existing;

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");

      if (isSaved) {
        // Update existing
        await supabase
          .from("saved_carts" as any)
          .update({
            checkin: checkin || null,
            checkout: checkout || null,
            party_size: partySize,
            room_code: roomCode || null,
            room_name: roomName || null,
          } as any)
          .eq("user_id", user.id)
          .eq("experience_id", experienceId);
      } else {
        // Insert new
        await supabase
          .from("saved_carts" as any)
          .insert({
            user_id: user.id,
            experience_id: experienceId,
            checkin: checkin || null,
            checkout: checkout || null,
            party_size: partySize,
            room_code: roomCode || null,
            room_name: roomName || null,
            reminder_hours: 24,
          } as any);
      }
    },
    onSuccess: () => {
      toast.success(
        lang === "he" ? "נשמר! נזכיר לך בקרוב." : lang === "fr" ? "Sauvegardé ! Nous vous rappellerons." : "Saved! We'll remind you soon."
      );
      queryClient.invalidateQueries({ queryKey: ["saved-cart", user?.id, experienceId] });
      queryClient.invalidateQueries({ queryKey: ["saved-carts", user?.id] });
    },
    onError: () => {
      toast.error(lang === "he" ? "שגיאה בשמירה" : "Failed to save");
    },
  });

  if (!user) return null;

  if (variant === "full") {
    return (
      <button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-colors",
          isSaved
            ? "border-foreground/20 bg-foreground/5 text-foreground"
            : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
          className
        )}
      >
        {isSaved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saveMutation.isPending ? t.saving : isSaved ? t.saved : t.save}
      </button>
    );
  }

  return (
    <button
      onClick={() => saveMutation.mutate()}
      disabled={saveMutation.isPending}
      className={cn(
        "flex items-center gap-1.5 text-sm transition-colors",
        isSaved ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {isSaved ? <Check className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
      {saveMutation.isPending ? t.saving : isSaved ? t.saved : t.save}
    </button>
  );
}
