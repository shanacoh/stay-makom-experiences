import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import DateRangePicker from "./DateRangePicker";
import PartySizeSelector from "./PartySizeSelector";
import RoomOptions from "./RoomOptions";
import ExtrasSelector from "./ExtrasSelector";
import PriceBreakdown from "./PriceBreakdown";

interface BookingPanelProps {
  experienceId: string;
  hotelId: string;
  basePrice: number;
  basePriceType: "fixed" | "per_person" | "per_booking";
  currency: string;
  minParty: number;
  maxParty: number;
}

const BookingPanel = ({
  experienceId,
  hotelId,
  basePrice,
  basePriceType,
  currency,
  minParty,
  maxParty,
}: BookingPanelProps) => {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [partySize, setPartySize] = useState(minParty);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [extrasTotal, setExtrasTotal] = useState(0);

  // Calculate experience price
  const experiencePrice = 
    basePriceType === "per_person" 
      ? basePrice * partySize 
      : basePriceType === "per_booking"
      ? basePrice
      : basePrice;

  const roomPrice = selectedRoom?.price_total || 0;
  const totalPrice = experiencePrice + roomPrice + extrasTotal;

  const canBook = dateRange.from && dateRange.to && selectedRoom;

  return (
    <Card className="p-6 sticky top-24 shadow-strong">
      <div className="space-y-6">
        <div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="font-serif text-3xl font-bold">
              ${basePrice}
            </span>
            <span className="text-muted-foreground">
              {basePriceType === "per_person" 
                ? "per person" 
                : basePriceType === "per_booking" 
                ? "per booking"
                : "per stay"}
            </span>
          </div>
        </div>

        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />

        <PartySizeSelector
          value={partySize}
          onChange={setPartySize}
          min={minParty}
          max={maxParty}
        />

        {dateRange.from && dateRange.to && (
          <>
            <RoomOptions
              hotelId={hotelId}
              checkin={dateRange.from}
              checkout={dateRange.to}
              guests={partySize}
              selectedRoom={selectedRoom}
              onSelectRoom={setSelectedRoom}
            />

            <ExtrasSelector
              experienceId={experienceId}
              partySize={partySize}
              selectedExtras={selectedExtras}
              onExtrasChange={(extras, total) => {
                setSelectedExtras(extras);
                setExtrasTotal(total);
              }}
            />
          </>
        )}

        {canBook && (
          <PriceBreakdown
            roomPrice={roomPrice}
            experiencePrice={experiencePrice}
            extrasTotal={extrasTotal}
            totalPrice={totalPrice}
            currency={currency}
          />
        )}

        <Button 
          size="lg" 
          className="w-full"
          disabled={!canBook}
        >
          <Calendar className="mr-2 h-5 w-5" />
          Reserve & Pay
        </Button>

        {!canBook && (
          <p className="text-sm text-muted-foreground text-center">
            Select dates and room to continue
          </p>
        )}
      </div>
    </Card>
  );
};

export default BookingPanel;
