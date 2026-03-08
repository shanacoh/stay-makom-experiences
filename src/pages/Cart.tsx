/**
 * /cart — Shows the user's localStorage-persisted cart.
 * 48-hour TTL. Links back to checkout to continue.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import { ShoppingBag, Trash2, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import { DualPrice } from "@/components/ui/DualPrice";
import type { CheckoutState } from "@/pages/Checkout";

const CART_TTL_MS = 48 * 60 * 60 * 1000;

interface CartData extends CheckoutState {
  savedAt?: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartData | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("staymakom_cart");
      if (raw) {
        const parsed: CartData = JSON.parse(raw);
        const savedAt = parsed.savedAt ? new Date(parsed.savedAt).getTime() : 0;
        if (Date.now() - savedAt > CART_TTL_MS) {
          localStorage.removeItem("staymakom_cart");
          toast.info("Your saved escape has expired.");
          setCart(null);
        } else {
          setCart(parsed);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  const handleRemove = () => {
    localStorage.removeItem("staymakom_cart");
    setCart(null);
    toast.success("Cart cleared");
  };

  const handleContinue = () => {
    if (!cart) return;
    navigate("/checkout", { state: cart });
  };

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block"><Header /></div>
      <div className="pt-4 md:pt-20 pb-32 px-4 max-w-lg mx-auto">
        {cart ? (
          <div className="space-y-6">
            <h1 className="text-xl font-bold tracking-tight">Your saved escape</h1>

            <div className="border border-border rounded-xl p-5 space-y-4 bg-card">
              {/* Experience name */}
              <div>
                <h2 className="text-base font-semibold leading-snug">{cart.experienceTitle}</h2>
                {cart.hotelName && (
                  <p className="text-sm text-muted-foreground mt-0.5">{cart.hotelName}</p>
                )}
              </div>

              {/* Dates */}
              {cart.dateRange?.from && cart.dateRange?.to && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Dates</span>
                  <span className="ml-auto font-medium">
                    {format(parseISO(cart.dateRange.from), "dd MMM")} → {format(parseISO(cart.dateRange.to), "dd MMM")}
                    <span className="text-muted-foreground font-normal ml-1">
                      · {cart.nights} {cart.nights === 1 ? "night" : "nights"}
                    </span>
                  </span>
                </div>
              )}

              {/* Guests */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Guests</span>
                <span className="ml-auto font-medium">
                  {cart.adults} {cart.adults === 1 ? "guest" : "guests"}
                  {cart.childrenAges?.length > 0 && ` + ${cart.childrenAges.length} children`}
                </span>
              </div>

              {/* Room */}
              {cart.selectedRoomName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Room</span>
                  <span className="ml-auto font-medium">{cart.selectedRoomName}</span>
                </div>
              )}

              {/* Extras */}
              {cart.selectedExtras && cart.selectedExtras.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Extras</span>
                  <ul className="mt-1 space-y-0.5">
                    {cart.selectedExtras.map((e) => (
                      <li key={e.id} className="flex justify-between">
                        <span>{e.name}</span>
                        <DualPrice amount={e.price} currency={e.currency} inline className="text-sm" />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Saved time */}
              {cart.savedAt && (
                <p className="text-xs text-muted-foreground/70 pt-1">
                  Saved {formatDistanceToNow(new Date(cart.savedAt), { addSuffix: true })}
                </p>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleContinue}>
              Continue to booking
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <button
              onClick={handleRemove}
              className="w-full text-center text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-base font-medium mb-1">No escape saved yet.</p>
            <button
              onClick={() => navigate("/launch")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mt-2"
            >
              <Compass className="h-3.5 w-3.5" />
              Start exploring →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
