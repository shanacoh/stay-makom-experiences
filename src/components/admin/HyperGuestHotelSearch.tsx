import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, MapPin, Star, Check, Image } from "lucide-react";
import { 
  getAllHotels, 
  getPropertyDetails,
  extractHotelImages,
  getHotelMainImage,
  type HyperGuestHotel 
} from "@/services/hyperguest";
import { Hotel } from "@/models/hyperguest";
import { cn } from "@/lib/utils";

export interface HyperGuestHotelWithDetails extends HyperGuestHotel {
  // Extended with full Hotel model data
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

interface HyperGuestHotelSearchProps {
  onSelect: (hotel: HyperGuestHotelWithDetails) => void;
  disabled?: boolean;
  fetchFullDetails?: boolean; // If true, fetches complete hotel details on selection
}

export function HyperGuestHotelSearch({ 
  onSelect, 
  disabled,
  fetchFullDetails = true 
}: HyperGuestHotelSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<HyperGuestHotel | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch hotels from HyperGuest filtered by Israel
  const { data: hotels, isLoading, error } = useQuery({
    queryKey: ["hyperguest-hotels-il"],
    queryFn: () => getAllHotels('IL'),
    staleTime: 1000 * 60 * 30,
    retry: 2,
  });

  // Filter hotels based on search term
  const filteredHotels = hotels?.filter((hotel) => {
    if (!searchTerm || searchTerm.length < 2) return false;
    const term = searchTerm.toLowerCase();
    return (
      hotel.name?.toLowerCase().includes(term) ||
      hotel.cityName?.toLowerCase().includes(term) ||
      hotel.regionName?.toLowerCase().includes(term)
    );
  }).slice(0, 10) || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (hotel: HyperGuestHotel) => {
    setSelectedHotel(hotel);
    setSearchTerm(hotel.name || "");
    setIsOpen(false);

    if (fetchFullDetails && hotel.id) {
      setIsLoadingDetails(true);
      try {
        // Fetch complete hotel details using the model
        const hotelModel = await getPropertyDetails(hotel.id);
        
        // Extract images and other data
        const images = extractHotelImages(hotelModel);
        const heroImage = getHotelMainImage(hotelModel);
        
        const enrichedHotel: HyperGuestHotelWithDetails = {
          ...hotel,
          hotelModel,
          images,
          heroImage,
          description: hotelModel.descriptions?.general || undefined,
          contact: hotelModel.contact ? {
            email: hotelModel.contact.email || undefined,
            phone: hotelModel.contact.phone || undefined,
            website: hotelModel.contact.website || undefined,
          } : undefined,
          facilities: hotelModel.facilities?.popular?.slice(0, 10).map(f => f.name) || [],
          checkIn: hotelModel.settings?.checkIn,
          checkOut: hotelModel.settings?.checkOut,
          // Update coordinates from full data if available
          latitude: hotelModel.coordinates?.latitude || hotel.latitude,
          longitude: hotelModel.coordinates?.longitude || hotel.longitude,
          address: hotelModel.location?.fullAddress || hotel.address,
        };
        
        onSelect(enrichedHotel);
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
        // Fallback to basic hotel data
        onSelect(hotel);
      } finally {
        setIsLoadingDetails(false);
      }
    } else {
      onSelect(hotel);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedHotel(null);
    if (e.target.value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Label htmlFor="hyperguest-search" className="flex items-center gap-2 mb-2">
        <Building2 className="h-4 w-4 text-primary" />
        Import from HyperGuest
      </Label>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          id="hyperguest-search"
          placeholder="Search HyperGuest hotels..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
          disabled={disabled || isLoading || isLoadingDetails}
          className={cn(
            "pl-10 pr-10",
            selectedHotel && "border-green-500 bg-green-50/50"
          )}
        />
        {(isLoading || isLoadingDetails) && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selectedHotel && !isLoadingDetails && (
          <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-1">
          Failed to load HyperGuest hotels. Please try again.
        </p>
      )}

      {isLoadingDetails && (
        <p className="text-xs text-primary mt-1 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" />
          Loading hotel details and images...
        </p>
      )}

      {!isLoading && !isLoadingDetails && hotels && (
        <p className="text-xs text-muted-foreground mt-1">
          {hotels.length} hotels available • Type at least 2 characters to search
        </p>
      )}

      {/* Dropdown */}
      {isOpen && filteredHotels.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-[320px] overflow-y-auto"
        >
          {filteredHotels.map((hotel, index) => (
            <button
              key={hotel.id ?? `hotel-${index}`}
              type="button"
              onClick={() => handleSelect(hotel)}
              className="w-full px-4 py-3 text-left hover:bg-accent transition-colors border-b last:border-b-0 flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{hotel.name}</span>
                  {hotel.starRating && (
                    <div className="flex items-center gap-0.5 text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs">{hotel.starRating}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {[hotel.cityName, hotel.regionName, hotel.countryCode]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {hotel.propertyType && (
                    <Badge variant="secondary" className="text-xs">
                      {hotel.propertyType}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    ID: {hotel.id}
                  </Badge>
                  {fetchFullDetails && (
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      <Image className="h-2.5 w-2.5" />
                      + Details
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm.length >= 2 && filteredHotels.length === 0 && !isLoading && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-popover border rounded-lg shadow-lg p-4 text-center text-muted-foreground"
        >
          No hotels found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
