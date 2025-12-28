import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr, he } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExperienceSearchHeaderProps {
  categories?: { id: string; name: string; name_he?: string }[];
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  guestCount: number;
  onGuestChange: (count: number) => void;
  minGuests?: number;
  maxGuests?: number;
  onViewDates: () => void;
  lang: 'en' | 'he' | 'fr';
  isVisible: boolean;
}

const ExperienceSearchHeader = ({
  selectedDate,
  onDateChange,
  guestCount,
  onGuestChange,
  minGuests = 1,
  maxGuests = 8,
  onViewDates,
  lang,
  isVisible
}: ExperienceSearchHeaderProps) => {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);

  const dateLocale = lang === 'fr' ? fr : lang === 'he' ? he : undefined;

  const formatDateLabel = () => {
    if (!selectedDate) {
      return lang === 'he' ? 'בחרו תאריך' : lang === 'fr' ? 'Ajouter des dates' : 'Add dates';
    }
    return format(selectedDate, "dd MMM", { locale: dateLocale });
  };

  const guestLabel = guestCount === 1
    ? (lang === 'he' ? 'אורח 1' : lang === 'fr' ? '1 voyageur' : '1 guest')
    : (lang === 'he' ? `${guestCount} אורחים` : lang === 'fr' ? `${guestCount} voyageurs` : `${guestCount} guests`);

  return (
    <div
      className={cn(
        "fixed top-16 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border transition-all duration-300",
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
      )}
    >
      <div className="container px-4 py-2.5">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Date & Guest selectors */}
          <div className="flex items-center gap-2">
            {/* Date Selector */}
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-foreground/30 transition-colors text-sm">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{formatDateLabel()}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    onDateChange?.(date);
                    setIsDateOpen(false);
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  locale={dateLocale}
                />
              </PopoverContent>
            </Popover>

            {/* Guest Selector */}
            <Popover open={isGuestOpen} onOpenChange={setIsGuestOpen}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:border-foreground/30 transition-colors text-sm">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{guestLabel}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-3" align="start">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {lang === 'he' ? 'מספר אורחים' : lang === 'fr' ? 'Voyageurs' : 'Guests'}
                  </p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onGuestChange(Math.max(minGuests, guestCount - 1))}
                      disabled={guestCount <= minGuests}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-foreground/50 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold">{guestCount}</span>
                    <button
                      onClick={() => onGuestChange(Math.min(maxGuests, guestCount + 1))}
                      disabled={guestCount >= maxGuests}
                      className="w-8 h-8 rounded-full border border-border flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-foreground/50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Right: CTA */}
          <Button 
            onClick={onViewDates}
            size="sm"
            className="rounded-full px-4 text-sm font-medium"
          >
            {lang === 'he' ? 'לתאריכים' : lang === 'fr' ? 'Voir les dates' : 'Check availability'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceSearchHeader;
