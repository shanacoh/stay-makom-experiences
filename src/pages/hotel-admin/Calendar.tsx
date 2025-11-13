import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Loader2, Users } from "lucide-react";
import { useState } from "react";

export default function HotelCalendar() {
  const { user } = useAuth();
  const [selectedMonth] = useState(new Date());

  const { data: hotelAdmin } = useQuery({
    queryKey: ["hotel-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_admins")
        .select("hotel_id")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["calendar-bookings", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          experiences(title)
        `)
        .eq("hotel_id", hotelAdmin?.hotel_id)
        .order("checkin", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  // Get upcoming bookings (next 30 days)
  const today = new Date();
  const next30Days = new Date(today);
  next30Days.setDate(next30Days.getDate() + 30);

  const upcomingBookings = bookings?.filter((booking) => {
    const checkinDate = new Date(booking.checkin);
    return checkinDate >= today && checkinDate <= next30Days;
  });

  // Group by date
  const bookingsByDate = upcomingBookings?.reduce((acc: any, booking) => {
    const date = new Date(booking.checkin).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-4xl font-bold">Calendrier & Disponibilités</h1>
        <p className="text-muted-foreground mt-2">
          Vue des réservations à venir pour les 30 prochains jours
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !upcomingBookings || upcomingBookings.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <p className="text-muted-foreground text-center">
              Aucune réservation à venir dans les 30 prochains jours.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(bookingsByDate || {}).map(([date, dateBookings]: [string, any]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5" />
                  {date}
                  <Badge variant="secondary" className="ml-auto">
                    {dateBookings.length} arrivée{dateBookings.length > 1 ? "s" : ""}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dateBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold">{booking.experiences?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.selected_room_name || "Chambre non spécifiée"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Check-out: {new Date(booking.checkout).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          {booking.party_size}
                        </div>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {booking.status}
                        </Badge>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${booking.total_price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {booking.currency}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
