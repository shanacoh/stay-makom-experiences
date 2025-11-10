import { Separator } from "@/components/ui/separator";

interface PriceBreakdownProps {
  roomPrice: number;
  experiencePrice: number;
  extrasTotal: number;
  totalPrice: number;
  currency: string;
}

const PriceBreakdown = ({
  roomPrice,
  experiencePrice,
  extrasTotal,
  totalPrice,
  currency,
}: PriceBreakdownProps) => {
  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <h4 className="font-medium">Price breakdown</h4>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Room</span>
          <span>${roomPrice}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-muted-foreground">Experience</span>
          <span>${experiencePrice}</span>
        </div>
        
        {extrasTotal > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Add-ons</span>
            <span>${extrasTotal}</span>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="flex justify-between items-center font-bold text-lg">
        <span>Total</span>
        <span className="text-primary">${totalPrice}</span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Final price in {currency}. All fees included.
      </p>
    </div>
  );
};

export default PriceBreakdown;
