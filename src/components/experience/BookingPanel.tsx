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
import { Users, Calendar, Loader2 } from "lucide-react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import RoomOptions from "./RoomOptions";
import ExtrasSelector from "./ExtrasSelector";
import PriceBreakdown from "./PriceBreakdown";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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

  // Booking creation mutation
  const createBookingMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to book");
      }

      if (!selectedDate) {
        throw new Error("Please select a date");
      }

      // Step 1: Find or create customer record
      const { data: existingCustomer, error: customerFetchError } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      let customerId: string;

      if (customerFetchError || !existingCustomer) {
        // Create customer record
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .single();

        const displayName = profile?.display_name || user.email?.split("@")[0] || "Guest";
        const nameParts = displayName.split(" ");
        
        const { data: newCustomer, error: customerCreateError } = await supabase
          .from("customers")
          .insert({
            user_id: user.id,
            first_name: nameParts[0] || "Guest",
            last_name: nameParts.slice(1).join(" ") || "User",
            default_party_size: partySize,
          })
          .select("id")
          .single();

        if (customerCreateError) throw customerCreateError;
        customerId = newCustomer.id;
      } else {
        customerId = existingCustomer.id;
      }

      // Step 2: Calculate final prices
      const nights = selectedDate.nights;
      const roomPriceSubtotal = roomPrice;
      const experiencePriceSubtotal = experiencePrice;
      const extrasSubtotal = extrasTotal;
      const totalPriceCalculated = roomPriceSubtotal + experiencePriceSubtotal + extrasSubtotal;

      // Step 3: Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: customerId,
          hotel_id: hotelId,
          experience_id: experienceId,
          checkin: format(selectedDate.checkin, "yyyy-MM-dd"),
          checkout: format(selectedDate.checkout, "yyyy-MM-dd"),
          party_size: partySize,
          room_price_subtotal: roomPriceSubtotal,
          experience_price_subtotal: experiencePriceSubtotal,
          extras_subtotal: extrasSubtotal,
          total_price: totalPriceCalculated,
          currency: currency || "ILS",
          status: "pending",
          payment_status: "none",
          selected_room_name: selectedRoom?.room_name || null,
          selected_room_code: selectedRoom?.room_code || null,
          selected_room_rate: selectedRoom?.rate_plan_code || null,
          notes: null,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Step 4: Create booking extras if any
      if (Object.keys(selectedExtras).length > 0 && extrasTotal > 0) {
        // Fetch extras details to get names and types
        const extraIds = Object.keys(selectedExtras).filter(id => selectedExtras[id] > 0);
        
        if (extraIds.length > 0) {
          const { data: extrasDetails } = await supabase
            .from("extras")
            .select("*")
            .in("id", extraIds);

          const extrasToInsert = Object.entries(selectedExtras)
            .filter(([_, quantity]) => quantity > 0)
            .map(([extraId, quantity]) => {
              const extraDetail = extrasDetails?.find((e) => e.id === extraId);
              return {
                booking_id: booking.id,
                extra_id: extraId,
                extra_name: extraDetail?.name || "Unknown",
                extra_type: extraDetail?.pricing_type || "per_booking",
                quantity,
                unit_price: extraDetail?.price || 0,
                price: (extraDetail?.price || 0) * quantity,
                status: "pending" as const,
              };
            });

          if (extrasToInsert.length > 0) {
            await supabase.from("booking_extras").insert(extrasToInsert);
          }
        }
      }

      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      toast.success("Booking request sent!", {
        description: "The hotel will review your request. Check your account for updates.",
      });
      
      // Navigate to account page after short delay
      setTimeout(() => {
        navigate("/account");
      }, 2000);
    },
    onError: (error: any) => {
      console.error("Booking creation error:", error);
      
      if (error.message === "You must be logged in to book") {
        toast.error("Please log in to book", {
          description: "You need to be logged in to make a booking.",
        });
        navigate("/auth");
      } else {
        toast.error("Booking failed", {
          description: error.message || "Unable to create booking. Please try again.",
        });
      }
    },
  });

  const handleBooking = () => {
    if (!user) {
      toast.error("Please log in to book");
      navigate("/auth");
      return;
    }

    createBookingMutation.mutate();
  };

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

            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleBooking}
              disabled={createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating booking...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-5 w-5" />
                  Réserver & Payer
                </>
              )}
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
