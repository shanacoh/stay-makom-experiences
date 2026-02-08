/**
 * Select avec liste préchargée des hôtels HyperGuest (Israël) + module de recherche
 * Remplace l’ancien champ "taper 2 caractères" par un vrai select + filtre
 */

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  getAllHotels,
  getPropertyDetails,
  extractHotelImages,
  getHotelMainImage,
  type HyperGuestHotel,
} from "@/services/hyperguest";
import { Hotel } from "@/models/hyperguest";
import { Loader2, Search, Building2, MapPin, Star, Check, ChevronDown, Image } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HyperGuestHotelWithDetails extends HyperGuestHotel {
  hotelModel?: Hotel;
  images?: string[];
  heroImage?: string | null;
  description?: string;
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  facilities?: string[];
  checkIn?: string;
  checkOut?: string;
}

interface HyperGuestHotelSelectProps {
  onSelect: (hotel: HyperGuestHotelWithDetails) => void;
  disabled?: boolean;
  fetchFullDetails?: boolean;
  placeholder?: string;
  className?: string;
}

export function HyperGuestHotelSelect({
  onSelect,
  disabled,
  fetchFullDetails = true,
  placeholder = "Select a hotel from HyperGuest (Israel)",
  className,
}: HyperGuestHotelSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<HyperGuestHotel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    data: hotels,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["hyperguest-hotels-il"],
    queryFn: () => getAllHotels("IL"),
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  const filteredHotels =
    hotels?.filter((hotel) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        hotel.name?.toLowerCase().includes(term) ||
        hotel.cityName?.toLowerCase().includes(term) ||
        hotel.regionName?.toLowerCase().includes(term) ||
        hotel.countryCode?.toLowerCase().includes(term)
      );
    }) ?? [];

  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = async (hotel: HyperGuestHotel) => {
    const hotelId = hotel.id ?? hotel.hotel_id;
    setSelectedHotel(hotel);
    setOpen(false);

    if (fetchFullDetails && hotelId) {
      setIsLoadingDetails(true);
      try {
        const hotelModel = await getPropertyDetails(hotelId);
        const images = extractHotelImages(hotelModel);
        const heroImage = getHotelMainImage(hotelModel);

        let city = hotelModel?.location?.city?.name || "";
        let region = hotelModel?.location?.region || "";
        if (city && region && city.toLowerCase() === region.toLowerCase()) {
          region = "";
        }
        if (!city) city = hotel.cityName || hotel.city || "";
        if (!region) {
          region = hotel.regionName || hotel.region || "";
          if (region.toLowerCase() === city.toLowerCase()) region = "";
        }

        const fullAddress = hotelModel?.location?.fullAddress || hotelModel?.location?.address || hotel.address || "";

        const enrichedHotel: HyperGuestHotelWithDetails = {
          ...hotel,
          id: hotelId,
          hotelModel,
          images,
          heroImage,
          description: hotelModel?.descriptions?.general || undefined,
          contact: hotelModel?.contact
            ? {
                email: hotelModel.contact.email || undefined,
                phone: hotelModel.contact.phone || undefined,
                website: hotelModel.contact.website || undefined,
              }
            : undefined,
          facilities: hotelModel?.facilities?.popular?.slice(0, 10).map((f) => f.name) || [],
          checkIn: hotelModel?.settings?.checkIn,
          checkOut: hotelModel?.settings?.checkOut,
          latitude: hotelModel?.coordinates?.latitude || hotel.latitude,
          longitude: hotelModel?.coordinates?.longitude || hotel.longitude,
          address: fullAddress,
          cityName: city,
          regionName: region,
        };
        onSelect(enrichedHotel);
      } catch (err) {
        console.error("[HyperGuest] Failed to fetch hotel details:", err);
        onSelect({ ...hotel, id: hotelId });
      } finally {
        setIsLoadingDetails(false);
      }
    } else {
      onSelect({ ...hotel, id: hotelId });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        Import from HyperGuest
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading || isLoadingDetails}
            className={cn(
              "w-full justify-between font-normal h-auto min-h-10",
              !selectedHotel && "text-muted-foreground",
            )}
          >
            <span className="truncate">
              {isLoading
                ? "Loading hotels..."
                : isLoadingDetails
                  ? "Loading details..."
                  : selectedHotel
                    ? selectedHotel.name
                    : placeholder}
            </span>
            {isLoading || isLoadingDetails ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <div className="flex items-center border-b px-2">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by name, city, region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto p-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="py-4 text-center text-sm text-destructive">Failed to load hotels. Please try again.</p>
            ) : filteredHotels.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {searchTerm.trim() ? `No hotel matching "${searchTerm}"` : "No hotels available"}
              </p>
            ) : (
              filteredHotels.map((hotel, index) => {
                const hotelId = hotel.id ?? hotel.hotel_id;
                const isSelected = selectedHotel?.id === hotelId || selectedHotel?.hotel_id === hotelId;
                return (
                  <button
                    key={hotelId ?? `hotel-${index}`}
                    type="button"
                    onClick={() => handleSelect(hotel)}
                    className={cn(
                      "w-full px-3 py-2 text-left rounded-md flex items-start gap-3 hover:bg-accent transition-colors",
                      isSelected && "bg-accent",
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isSelected ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-sm">{hotel.name}</span>
                        {hotel.starRating && (
                          <span className="flex items-center gap-0.5 text-amber-500 text-xs">
                            <Star className="h-3 w-3 fill-current" />
                            {hotel.starRating}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {[hotel.cityName || hotel.city, hotel.regionName || hotel.region].filter(Boolean).join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-muted-foreground">ID: {hotelId}</span>
                        {fetchFullDetails && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Image className="h-2.5 w-2.5" />+ details
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {!isLoading && hotels && (
            <div className="border-t px-3 py-2 text-xs text-muted-foreground">
              {hotels.length} hotels (Israel) • Use search to filter
            </div>
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="text-xs text-red-500">Failed to load HyperGuest hotels. Please try again.</p>}
    </div>
  );
}
