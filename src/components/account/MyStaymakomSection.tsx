import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, MapPin, ChevronRight, Clock, Plane, X, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInDays, format, parseISO, isPast, isBefore, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface MyStaymakomSectionProps {
  userId?: string;
}

export default function MyStaymakomSection({ userId }: MyStaymakomSectionProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lang } = useLanguage();
  const isHebrew = lang === "he";
  const [timeFilter, setTimeFilter] = useState<string>("all");
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  // Fetch V2 bookings (bookings_hg) for the logged-in user
  const { data: bookingsHg, isLoading: loadingHg } = useQuery({
    queryKey: ["my-bookings-hg", userId, timeFilter],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from("bookings_hg")
        .select(`
          *,
          experiences2 (title, title_he, slug, hero_image, thumbnail_image),
          hotels2 (name, name_he, city, city_he)
        `)
        .eq("user_id", userId)
        .order("checkin", { ascending: true });

      const today = new Date().toISOString().split("T")[0];
      if (timeFilter === "upcoming") {
        query = query.gte("checkin", today);
      } else if (timeFilter === "past") {
        query = query.lt("checkin", today);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Also fetch V1 bookings (legacy)
  const { data: customer } = useQuery({
    queryKey: ["customer", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const { data: bookingsV1, isLoading: loadingV1 } = useQuery({
    queryKey: ["my-bookings-v1", customer?.id, timeFilter],
    queryFn: async () => {
      if (!customer?.id) return [];

      let query = supabase
        .from("bookings")
        .select(`
          *,
          hotels (name, city),
          experiences (title, slug)
        `)
        .eq("customer_id", customer.id)
        .order("checkin", { ascending: true });

      const today = new Date().toISOString().split("T")[0];
      if (timeFilter === "upcoming") {
        query = query.gte("checkin", today);
      } else if (timeFilter === "past") {
        query = query.lt("checkin", today);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.id,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      // Find the booking to get HG booking ID
      const booking = bookingsHg?.find((b: any) => b.id === bookingId);
      if (!booking) throw new Error("Booking not found");

      // Call HyperGuest cancel API
      const { data, error } = await supabase.functions.invoke("hyperguest", {
        body: {
          action: "cancel-booking",
          bookingId: booking.hg_booking_id,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Update local DB
      await supabase
        .from("bookings_hg")
        .update({
          is_cancelled: true,
          cancelled_at: new Date().toISOString(),
          status: "cancelled",
        } as any)
        .eq("id", bookingId);

      return data;
    },
    onSuccess: () => {
      toast.success(isHebrew ? "ההזמנה בוטלה בהצלחה" : "Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-bookings-hg"] });
      setCancellingBookingId(null);
    },
    onError: (error: any) => {
      toast.error(isHebrew ? "שגיאה בביטול ההזמנה" : `Cancellation failed: ${error.message}`);
      setCancellingBookingId(null);
    },
  });

  const canCancel = (booking: any) => {
    if (booking.is_cancelled || booking.status === "cancelled") return false;
    const checkin = parseISO(booking.checkin);
    // Allow cancellation if check-in is at least 2 days away
    return isBefore(new Date(), addDays(checkin, -2));
  };

  const getStatusBadge = (status: string, isCancelled: boolean) => {
    if (isCancelled) {
      return <Badge variant="destructive">{isHebrew ? "בוטל" : "Cancelled"}</Badge>;
    }
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; labelHe: string }> = {
      pending: { variant: "outline", label: "Pending", labelHe: "ממתין" },
      confirmed: { variant: "default", label: "Confirmed", labelHe: "מאושר" },
      cancelled: { variant: "destructive", label: "Cancelled", labelHe: "בוטל" },
      pendingreview: { variant: "secondary", label: "Under Review", labelHe: "בבדיקה" },
    };
    const config = statusConfig[status?.toLowerCase()] || { variant: "outline" as const, label: status, labelHe: status };
    return <Badge variant={config.variant}>{isHebrew ? config.labelHe : config.label}</Badge>;
  };

  const getTimeBadge = (checkinDate: string) => {
    const checkin = parseISO(checkinDate);
    const today = new Date();

    if (isPast(checkin)) {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          {isHebrew ? "הסתיים" : "Completed"}
        </Badge>
      );
    }

    const daysUntil = differenceInDays(checkin, today);

    if (daysUntil === 0) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <Plane className="h-3 w-3 mr-1" />
          {isHebrew ? "היום!" : "Today!"}
        </Badge>
      );
    }

    if (daysUntil <= 7) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          {isHebrew ? `בעוד ${daysUntil} ימים` : `In ${daysUntil} day${daysUntil > 1 ? "s" : ""}`}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        {isHebrew ? `בעוד ${daysUntil} ימים` : `In ${daysUntil} days`}
      </Badge>
    );
  };

  const isLoading = loadingHg || loadingV1;

  // Merge both V1 and V2 bookings into a unified list
  const allBookings = [
    ...(bookingsHg || []).map((b: any) => ({
      id: b.id,
      type: "v2" as const,
      title: isHebrew ? b.experiences2?.title_he || b.experiences2?.title : b.experiences2?.title || "Experience",
      hotelName: isHebrew ? b.hotels2?.name_he || b.hotels2?.name : b.hotels2?.name || "",
      hotelCity: isHebrew ? b.hotels2?.city_he || b.hotels2?.city : b.hotels2?.city || "",
      checkin: b.checkin,
      checkout: b.checkout,
      nights: b.nights,
      partySize: b.party_size,
      totalPrice: b.sell_price,
      currency: b.currency,
      status: b.status,
      isCancelled: b.is_cancelled,
      roomName: b.room_name,
      hgBookingId: b.hg_booking_id,
      slug: b.experiences2?.slug,
      heroImage: b.experiences2?.thumbnail_image || b.experiences2?.hero_image,
      raw: b,
    })),
    ...(bookingsV1 || []).map((b: any) => ({
      id: b.id,
      type: "v1" as const,
      title: b.experiences?.title || "Experience",
      hotelName: b.hotels?.name || "",
      hotelCity: b.hotels?.city || "",
      checkin: b.checkin,
      checkout: b.checkout,
      nights: differenceInDays(parseISO(b.checkout), parseISO(b.checkin)),
      partySize: b.party_size,
      totalPrice: b.total_price,
      currency: b.currency || "USD",
      status: b.status || "pending",
      isCancelled: b.status === "cancelled",
      roomName: b.selected_room_name,
      hgBookingId: null,
      slug: b.experiences?.slug,
      heroImage: null,
      raw: b,
    })),
  ].sort((a, b) => new Date(a.checkin).getTime() - new Date(b.checkin).getTime());

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">{isHebrew ? "תקופה" : "Time Period"}</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isHebrew ? "כל ההזמנות" : "All Bookings"}</SelectItem>
                  <SelectItem value="upcoming">{isHebrew ? "עתידיות" : "Upcoming"}</SelectItem>
                  <SelectItem value="past">{isHebrew ? "עברו" : "Past"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {allBookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">{isHebrew ? "אין הזמנות" : "No bookings found"}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {isHebrew
                    ? "גלו את החוויות המיוחדות שלנו והזמינו את ההרפתקה הבאה שלכם!"
                    : "Start exploring our curated experiences and book your next adventure!"}
                </p>
              </div>
              <Button onClick={() => navigate("/")} variant="cta">
                {isHebrew ? "גלו חוויות" : "Explore Experiences"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {allBookings.map((booking) => {
            const _isUpcoming = !isPast(parseISO(booking.checkin));
            const showCancel = booking.type === "v2" && canCancel(booking.raw);

            return (
              <Card key={booking.id} className={`hover:shadow-lg transition-shadow overflow-hidden ${booking.isCancelled ? "opacity-60" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{booking.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {booking.hotelName}{booking.hotelCity ? ` · ${booking.hotelCity}` : ""}
                        </span>
                      </div>
                      {booking.roomName && (
                        <p className="text-xs text-muted-foreground">{booking.roomName}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                      {!booking.isCancelled && getTimeBadge(booking.checkin)}
                      {getStatusBadge(booking.status, booking.isCancelled)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-muted-foreground text-xs">{isHebrew ? "צ'ק-אין" : "Check-in"}</p>
                        <p className="font-medium truncate">{format(parseISO(booking.checkin), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-muted-foreground text-xs">{isHebrew ? "צ'ק-אאוט" : "Check-out"}</p>
                        <p className="font-medium truncate">{format(parseISO(booking.checkout), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">{isHebrew ? "אורחים" : "Guests"}</p>
                        <p className="font-medium">{booking.partySize}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">{isHebrew ? "סה\"כ" : "Total"}</p>
                      <p className="text-xl font-bold">
                        {booking.currency === "ILS" ? "₪" : booking.currency === "EUR" ? "€" : "$"}
                        {Number(booking.totalPrice).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {showCancel && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => setCancellingBookingId(booking.id)}
                          disabled={cancelMutation.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          {isHebrew ? "ביטול" : "Cancel"}
                        </Button>
                      )}
                      {booking.slug && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(booking.type === "v2" ? `/experience2/${booking.slug}` : `/experience/${booking.slug}`)}
                        >
                          {isHebrew ? "צפה" : "View"}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {booking.hgBookingId && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {isHebrew ? "מספר הזמנה:" : "Ref:"} {booking.hgBookingId}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancellingBookingId} onOpenChange={(open) => !open && setCancellingBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {isHebrew ? "ביטול הזמנה" : "Cancel Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isHebrew
                ? "האם אתה בטוח שברצונך לבטל הזמנה זו? פעולה זו אינה ניתנת לביטול. יתכן שתחולנה עמלות ביטול בהתאם למדיניות המלון."
                : "Are you sure you want to cancel this booking? This action cannot be undone. Cancellation fees may apply depending on the hotel's policy."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              {isHebrew ? "חזור" : "Go Back"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelMutation.isPending}
              onClick={() => {
                if (cancellingBookingId) {
                  cancelMutation.mutate(cancellingBookingId);
                }
              }}
            >
              {cancelMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isHebrew ? "כן, בטל הזמנה" : "Yes, Cancel Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
