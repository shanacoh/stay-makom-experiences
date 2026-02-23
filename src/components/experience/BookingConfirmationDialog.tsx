/**
 * Booking Confirmation Dialog — Shown after successful HyperGuest booking
 * Displays: confirmation number, hotel, room, board type, dates, price, remarks
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Check, CalendarDays, Hotel, Users, MessageSquare, Copy } from "lucide-react";
import { DualPrice } from "@/components/ui/DualPrice";
import { getBoardTypeLabel } from "@/services/hyperguest";
import { toast } from "sonner";

export interface BookingConfirmationData {
  hgBookingId: string;
  confirmationNumber?: string;
  status: string;
  hotelName: string;
  roomName: string;
  boardType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  partySize: number;
  sellPrice: number;
  currency: string;
  remarks: string[];
  specialRequests: string;
  experienceTitle: string;
  staymakomRef: string;
}

interface BookingConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  data: BookingConfirmationData | null;
  lang?: "en" | "he" | "fr";
}

const translations = {
  en: {
    title: "Booking Confirmed!",
    subtitle: "Your experience has been booked successfully.",
    ref: "Reference",
    hgRef: "Confirmation #",
    hotel: "Hotel",
    room: "Room",
    board: "Board",
    dates: "Dates",
    guests: "Guests",
    price: "Total price",
    remarks: "Important notices",
    specialRequests: "Your special requests",
    close: "Close",
    copyRef: "Copy reference",
    nights: "nights",
    vatNote: "Prices do not include VAT. Israeli residents are subject to 18% VAT payable at the hotel.",
  },
  he: {
    title: "!ההזמנה אושרה",
    subtitle: "החוויה שלך הוזמנה בהצלחה.",
    ref: "מספר הפניה",
    hgRef: "מספר אישור",
    hotel: "מלון",
    room: "חדר",
    board: "ארוחות",
    dates: "תאריכים",
    guests: "אורחים",
    price: "מחיר כולל",
    remarks: "הערות חשובות",
    specialRequests: "הבקשות המיוחדות שלך",
    close: "סגור",
    copyRef: "העתק מספר הפניה",
    nights: "לילות",
    vatNote: "המחירים אינם כוללים מע\"מ. תושבי ישראל חייבים ב-18% מע\"מ המשולם ישירות במלון.",
  },
  fr: {
    title: "Réservation confirmée !",
    subtitle: "Votre expérience a été réservée avec succès.",
    ref: "Référence",
    hgRef: "N° de confirmation",
    hotel: "Hôtel",
    room: "Chambre",
    board: "Pension",
    dates: "Dates",
    guests: "Voyageurs",
    price: "Prix total",
    remarks: "Remarques importantes",
    specialRequests: "Vos demandes spéciales",
    close: "Fermer",
    copyRef: "Copier la référence",
    nights: "nuits",
    vatNote: "Les prix n'incluent pas la TVA. Les résidents israéliens sont soumis à 18% de TVA payable à l'hôtel.",
  },
};

export function BookingConfirmationDialog({ open, onClose, data, lang = "en" }: BookingConfirmationDialogProps) {
  const t = translations[lang];

  if (!data) return null;

  const copyRef = () => {
    navigator.clipboard.writeText(data.staymakomRef);
    toast.success(lang === "he" ? "הועתק!" : lang === "fr" ? "Copié !" : "Copied!");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-lg">{t.title}</DialogTitle>
              <DialogDescription className="text-sm">{t.subtitle}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Experience name */}
          <p className="font-semibold text-base">{data.experienceTitle}</p>

          {/* References */}
          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.ref}</span>
              <div className="flex items-center gap-1">
                <span className="font-mono font-medium">{data.staymakomRef}</span>
                <button onClick={copyRef} className="text-muted-foreground hover:text-foreground">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
            {data.hgBookingId && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.hgRef}</span>
                <span className="font-mono text-xs">{data.hgBookingId}</span>
              </div>
            )}
            <Badge variant={data.status === "Confirmed" ? "default" : "secondary"} className="text-xs">
              {data.status}
            </Badge>
          </div>

          <Separator />

          {/* Hotel & Room details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Hotel className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{data.hotelName}</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              <p>{t.room}: {data.roomName}</p>
              <p>{t.board}: {getBoardTypeLabel(data.boardType)}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span>{data.checkIn} → {data.checkOut} ({data.nights} {t.nights})</span>
          </div>

          {/* Guests */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{data.partySize} {t.guests}</span>
          </div>

          <Separator />

          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="font-medium">{t.price}</span>
            <DualPrice amount={data.sellPrice} currency={data.currency} className="text-primary text-lg items-end" />
          </div>

          {/* VAT note */}
          <p className="text-xs text-muted-foreground">{t.vatNote}</p>

          {/* Remarks */}
          {data.remarks.filter(r => !/general message that should be shown/i.test(r)).length > 0 && (
            <>
              <Separator />
              <div className="space-y-1.5 p-3 rounded-md bg-amber-50 border border-amber-200">
                {data.remarks.filter(r => !/general message that should be shown/i.test(r)).map((remark, idx) => (
                  <p key={idx} className="text-xs text-amber-700">{remark}</p>
                ))}
              </div>
            </>
          )}

          {/* Special requests */}
          {data.specialRequests && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                {t.specialRequests}
              </div>
              <p className="text-sm text-muted-foreground pl-6">{data.specialRequests}</p>
            </div>
          )}

          <Button onClick={onClose} className="w-full mt-2">
            {t.close}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
