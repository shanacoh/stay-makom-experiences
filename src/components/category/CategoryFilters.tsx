import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { SlidersHorizontal, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface CategoryFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  onShowMapToggle?: (show: boolean) => void;
  showMap?: boolean;
}

export interface FilterState {
  sortBy: string;
  priceRange: [number, number];
  partySize: number;
  region?: string;
  dateRange?: DateRange;
}

const CategoryFilters = ({ onFilterChange, onShowMapToggle, showMap = false }: CategoryFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "recommended",
    priceRange: [0, 1000],
    partySize: 2,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleFilterUpdate = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-3 sm:py-4">
      <div className="container flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal flex-1 sm:flex-none sm:min-w-[280px]",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "d MMM", { locale: fr })} -{" "}
                        {format(dateRange.to, "d MMM yyyy", { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, "d MMM yyyy", { locale: fr })
                    )
                  ) : (
                    "When?"
                  )}
                </span>
                <span className="sm:hidden">
                  When?
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                disabled={(date) => date < new Date()}
                locale={fr}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterUpdate("sortBy", value)}
          >
            <SelectTrigger className="w-[180px] hidden sm:flex">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>

          {/* Filters Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="default" className="sm:px-4 px-2">
                <SlidersHorizontal className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Filter experiences</h3>
                <div>
                  <label className="text-sm font-medium mb-3 block">Budget (per person)</label>
                  <Slider
                    min={0}
                    max={1000}
                    step={50}
                    value={filters.priceRange}
                    onValueChange={(value) => handleFilterUpdate("priceRange", value as [number, number])}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Number of guests</label>
                  <Select
                    value={filters.partySize.toString()}
                    onValueChange={(value) => handleFilterUpdate("partySize", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} {size === 1 ? "guest" : "guests"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          variant={showMap ? "default" : "outline"}
          onClick={() => onShowMapToggle?.(!showMap)}
          className="sm:px-4 px-2"
        >
          <MapPin className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">{showMap ? "Hide map" : "Show map"}</span>
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;
