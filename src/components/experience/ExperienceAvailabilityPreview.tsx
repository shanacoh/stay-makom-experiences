/**
 * ExperienceAvailabilityPreview
 * Shows a live HyperGuest availability check for a given property inside the admin form.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarSearch } from "lucide-react";
import { useHyperGuestAvailability } from "@/hooks/useHyperGuestAvailability";
import { RoomOptionsV2 } from "@/components/experience/RoomOptionsV2";
import { addDays, format } from "date-fns";

interface ExperienceAvailabilityPreviewProps {
  hyperguestPropertyId: string | null;
  hotelName?: string;
  experienceId?: string | null;
  currency?: string;
  lang?: string;
  nights?: number;
}

export function ExperienceAvailabilityPreview({
  hyperguestPropertyId,
  hotelName,
  nights = 2,
}: ExperienceAvailabilityPreviewProps) {
  const [checkin, setCheckin] = useState<string>(format(addDays(new Date(), 14), "yyyy-MM-dd"));
  const [shouldFetch, setShouldFetch] = useState(false);

  const propertyId = hyperguestPropertyId ? parseInt(hyperguestPropertyId, 10) : null;
  const validPropertyId = propertyId && !isNaN(propertyId) ? propertyId : null;

  const { data: searchResult, isLoading, error } = useHyperGuestAvailability(
    shouldFetch ? validPropertyId : null,
    shouldFetch
      ? { checkIn: checkin, nights, guests: "2" }
      : null,
  );

  if (!hyperguestPropertyId) return null;

  const handleCheck = () => {
    setShouldFetch(true);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <CalendarSearch className="h-4 w-4" />
          Availability {hotelName ? `– ${hotelName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div>
            <label className="text-xs font-medium">Check-in</label>
            <input
              type="date"
              className="block mt-1 rounded-md border px-3 py-1.5 text-sm"
              value={checkin}
              onChange={(e) => {
                setCheckin(e.target.value);
                setShouldFetch(false);
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium">Nights</label>
            <span className="block mt-1 px-3 py-1.5 text-sm">{nights}</span>
          </div>
          <Button onClick={handleCheck} disabled={isLoading} size="sm" variant="outline">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Check
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}

        {searchResult && (
          <div className="mt-2">
            <RoomOptionsV2 searchResult={searchResult as any} onSelect={() => {}} isLoading={false} selectedRoomId={null} selectedRatePlanId={null} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
