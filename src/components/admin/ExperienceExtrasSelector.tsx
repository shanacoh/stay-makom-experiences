import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

interface ExperienceExtrasSelectorProps {
  experienceId: string;
  hotelId: string;
}

const ExperienceExtrasSelector = ({ experienceId, hotelId }: ExperienceExtrasSelectorProps) => {
  const queryClient = useQueryClient();

  // Fetch all hotel extras
  const { data: hotelExtras, isLoading: isLoadingExtras } = useQuery({
    queryKey: ["hotel-extras", hotelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("hotel_id", hotelId)
        .eq("is_available", true)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
  });

  // Fetch selected extras for this experience
  const { data: selectedExtras, isLoading: isLoadingSelected } = useQuery({
    queryKey: ["experience-extras-links", experienceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experience_extras")
        .select("extra_id")
        .eq("experience_id", experienceId);

      if (error) throw error;
      return data.map(item => item.extra_id);
    },
  });

  const toggleExtraMutation = useMutation({
    mutationFn: async ({ extraId, isChecked }: { extraId: string; isChecked: boolean }) => {
      if (isChecked) {
        // Add link
        const { error } = await supabase
          .from("experience_extras")
          .insert([{ experience_id: experienceId, extra_id: extraId }]);
        if (error) throw error;
      } else {
        // Remove link
        const { error } = await supabase
          .from("experience_extras")
          .delete()
          .eq("experience_id", experienceId)
          .eq("extra_id", extraId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experience-extras-links", experienceId] });
      toast.success("Extras updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  if (isLoadingExtras || isLoadingSelected) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!hotelExtras || hotelExtras.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No extras available for this hotel yet.</p>
        <p className="text-sm mt-1">Hotel admins can create extras in their back-office.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hotelExtras.map((extra) => {
        const isChecked = selectedExtras?.includes(extra.id) || false;
        
        return (
          <div
            key={extra.id}
            className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <Checkbox
              id={`extra-${extra.id}`}
              checked={isChecked}
              onCheckedChange={(checked) => 
                toggleExtraMutation.mutate({ extraId: extra.id, isChecked: checked as boolean })
              }
              disabled={toggleExtraMutation.isPending}
            />
            <div className="flex-1">
              <Label 
                htmlFor={`extra-${extra.id}`}
                className="cursor-pointer font-medium"
              >
                {extra.name}
                {extra.name_he && (
                  <span className="text-muted-foreground ml-2 text-sm" dir="rtl">/ {extra.name_he}</span>
                )}
              </Label>
              <div className="text-sm font-semibold text-primary mt-1">
                {extra.price} {extra.currency} / {extra.pricing_type.replace("_", " ")}
              </div>
              {(extra.description || extra.description_he) && (
                <div className="text-sm text-muted-foreground mt-1">
                  {extra.description}
                  {extra.description_he && (
                    <span className="block mt-1" dir="rtl">{extra.description_he}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExperienceExtrasSelector;
