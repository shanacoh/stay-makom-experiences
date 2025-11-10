import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartySizeSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

const PartySizeSelector = ({ value, onChange, min, max }: PartySizeSelectorProps) => {
  const decrease = () => {
    if (value > min) onChange(value - 1);
  };

  const increase = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Guests</label>
      <div className="flex items-center justify-between border rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>{value} {value === 1 ? "guest" : "guests"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={decrease}
            disabled={value <= min}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={increase}
            disabled={value >= max}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartySizeSelector;
