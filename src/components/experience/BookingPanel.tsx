import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Calendar } from "lucide-react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import RoomOptions from "./RoomOptions";
import ExtrasSelector from "./ExtrasSelector";
import PriceBreakdown from "./PriceBreakdown";
import { cn } from "@/lib/utils";

interface BookingPanelProps {
  experienceId: string;
  hotelId: string;
  basePrice: number;
  basePriceType: "fixed" | "per_person" | "per_booking";
  currency: string;
  minParty: number;
  maxParty: number;
}

interface DateOption {
  id: string;
  checkin: Date;
  checkout: Date;
  nights: number;
  price: number;
  originalPrice: number;
  discount: number;
  featured?: boolean;
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
  const [partySize, setPartySize] = useState(minParty);
  const [selectedNights, setSelectedNights] = useState<1 | 2 | 3>(1);
  const [selectedDateId, setSelectedDateId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});
  const [extrasTotal, setExtrasTotal] = useState(0);

  // Generate date options based on selected nights
  const dateOptions = useMemo((): DateOption[] => {
    const options: DateOption[] = [];
    const today = new Date();
    
    // Generate 10 date options starting from tomorrow
    for (let i = 1; i <= 10; i++) {
      const checkin = addDays(today, i);
      const checkout = addDays(checkin, selectedNights);
      
      // Random discount between 20% and 30%
      const discount = 20 + Math.floor(Math.random() * 11);
      const originalPrice = basePrice * (1 + (i * 0.1)); // Vary prices
      const price = originalPrice * (1 - discount / 100);
      
      options.push({
        id: `date-${i}`,
        checkin,
        checkout,
        nights: selectedNights,
        price: Math.round(price),
        originalPrice: Math.round(originalPrice),
        discount,
        featured: i === 1, // First option is featured
      });
    }
    
    return options;
  }, [selectedNights, basePrice]);

  const selectedDate = dateOptions.find(d => d.id === selectedDateId);

  // Calculate prices
  const experiencePrice = selectedDate 
    ? (basePriceType === "per_person" ? selectedDate.price * partySize : selectedDate.price)
    : 0;
  const roomPrice = selectedRoom?.price_total || 0;
  const totalPrice = experiencePrice + roomPrice + extrasTotal;

  const canBook = selectedDateId && selectedRoom;

  // Generate party size options
  const partySizeOptions = Array.from(
    { length: maxParty - minParty + 1 },
    (_, i) => minParty + i
  );

  return (
    <Card className="p-6 sticky top-24 shadow-strong">
      <div className="space-y-6">
        {/* Party Size Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Nombre de personnes</Label>
          <Select
            value={partySize.toString()}
            onValueChange={(value) => setPartySize(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {partySizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} {size === 1 ? "adulte" : "adultes"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nights Selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Durée du séjour</Label>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map((nights) => (
              <button
                key={nights}
                type="button"
                onClick={() => {
                  setSelectedNights(nights);
                  setSelectedDateId(null); // Reset selection when changing nights
                }}
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg border-2 transition-all",
                  "hover:border-primary/50",
                  selectedNights === nights
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border"
                )}
              >
                {nights} {nights === 1 ? "nuit" : "nuits"}
              </button>
            ))}
          </div>
        </div>

        {/* Date Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sélectionnez vos dates</Label>
          <RadioGroup
            value={selectedDateId || ""}
            onValueChange={setSelectedDateId}
          >
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {dateOptions.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    "hover:border-primary/50",
                    selectedDateId === option.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <RadioGroupItem value={option.id} id={option.id} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                      {format(option.checkin, "EEE. dd MMM", { locale: fr })}
                      {" → "}
                      {format(option.checkout, "EEE. dd MMM", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-base">
                        {option.price}€
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {option.originalPrice}€
                      </span>
                      <span className="text-xs font-medium text-primary">
                        -{option.discount}%
                      </span>
                      {option.featured && (
                        <span className="text-xs font-medium bg-foreground text-background px-2 py-0.5 rounded">
                          Plus que 2 restantes
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Show booking button if no date selected */}
        {!selectedDateId && (
          <Button size="lg" className="w-full" disabled>
            Choisissez une date
          </Button>
        )}

        {/* Room & Extras after date selection */}
        {selectedDate && (
          <>
            <RoomOptions
              hotelId={hotelId}
              checkin={selectedDate.checkin}
              checkout={selectedDate.checkout}
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

        {/* Price Breakdown & Book Button */}
        {canBook && (
          <>
            <PriceBreakdown
              roomPrice={roomPrice}
              experiencePrice={experiencePrice}
              extrasTotal={extrasTotal}
              totalPrice={totalPrice}
              currency={currency}
            />

            <Button size="lg" className="w-full">
              <Calendar className="mr-2 h-5 w-5" />
              Réserver & Payer
            </Button>
          </>
        )}

        {selectedDateId && !selectedRoom && (
          <p className="text-sm text-muted-foreground text-center">
            Sélectionnez une chambre pour continuer
          </p>
        )}
      </div>
    </Card>
  );
};

export default BookingPanel;
