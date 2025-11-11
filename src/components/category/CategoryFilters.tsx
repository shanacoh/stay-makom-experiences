import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, MapPin } from "lucide-react";
import { useState } from "react";

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
}

const CategoryFilters = ({ onFilterChange, onShowMapToggle, showMap = false }: CategoryFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "recommended",
    priceRange: [0, 1000],
    partySize: 2,
  });

  const handleFilterUpdate = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleFilterUpdate("sortBy", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommandé</SelectItem>
              <SelectItem value="price_asc">Prix croissant</SelectItem>
              <SelectItem value="price_desc">Prix décroissant</SelectItem>
              <SelectItem value="duration">Durée</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="default">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtrer les expériences</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div>
                  <label className="text-sm font-medium mb-3 block">Budget (par personne)</label>
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
                  <label className="text-sm font-medium mb-3 block">Nombre de personnes</label>
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
                          {size} {size === 1 ? "personne" : "personnes"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Button
          variant={showMap ? "default" : "outline"}
          onClick={() => onShowMapToggle?.(!showMap)}
        >
          <MapPin className="h-4 w-4 mr-2" />
          {showMap ? "Masquer la carte" : "Afficher la carte"}
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;
