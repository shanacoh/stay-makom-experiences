import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Users, MapPin, ChevronRight, Clock, Plane } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { differenceInDays, format, parseISO, isPast } from "date-fns";
import { useNavigate } from "react-router-dom";

interface MyStaymakomSectionProps {
  userId?: string;
}

export default function MyStaymakomSection({ userId }: MyStaymakomSectionProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<string>("all");

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

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", customer?.id, statusFilter, timeFilter],
    queryFn: async () => {
      if (!customer?.id) return [];
      
      let query = supabase
        .from("bookings")
        .select(`
          *,
          hotels (name, city, contact_email),
          experiences (title, slug),
          booking_extras (
            id,
            extra_name,
            quantity,
            price,
            status
          )
        `)
        .eq("customer_id", customer.id);

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as any);
      }

      // Apply time filter
      const today = new Date().toISOString().split('T')[0];
      if (timeFilter === "upcoming") {
        query = query.gte("checkin", today);
      } else if (timeFilter === "past") {
        query = query.lt("checkin", today);
      }

      query = query.order("checkin", { ascending: true });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!customer?.id,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending Review" },
      confirmed: { variant: "default", label: "Confirmed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      paid: { variant: "default", label: "Paid" },
      hold: { variant: "secondary", label: "On Hold" },
      accepted: { variant: "default", label: "Accepted" },
      failed: { variant: "destructive", label: "Failed" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTimeBadge = (checkinDate: string) => {
    const checkin = parseISO(checkinDate);
    const today = new Date();
    
    if (isPast(checkin)) {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Completed
        </Badge>
      );
    }

    const daysUntil = differenceInDays(checkin, today);
    
    if (daysUntil === 0) {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <Plane className="h-3 w-3 mr-1" />
          Today!
        </Badge>
      );
    }
    
    if (daysUntil <= 7) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3 w-3 mr-1" />
          In {daysUntil} day{daysUntil > 1 ? "s" : ""}
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        In {daysUntil} days
      </Badge>
    );
  };

  const getExtrasProgress = (extras: any[]) => {
    if (!extras || extras.length === 0) return null;
    
    const completed = extras.filter(e => e.status === "done").length;
    const total = extras.length;
    
    return (
      <Badge variant={completed === total ? "default" : "secondary"}>
        Extras: {completed}/{total}
      </Badge>
    );
  };

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
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {!bookings || bookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-2">
                <Calendar className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="font-serif text-xl mb-2">No bookings found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {statusFilter !== "all" || timeFilter !== "all"
                    ? "Try adjusting your filters to see more bookings"
                    : "Start exploring our curated experiences and book your next adventure!"}
                </p>
              </div>
              <Button onClick={() => navigate("/")} variant="cta">
                Explore Experiences
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const isUpcoming = !isPast(parseISO(booking.checkin));
            
            return (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-1">{booking.experiences?.title}</CardTitle>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-sm truncate">
                          {booking.hotels?.name} • {booking.hotels?.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
                      {getTimeBadge(booking.checkin)}
                      {getStatusBadge(booking.status || "pending")}
                      {getExtrasProgress(booking.booking_extras)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-muted-foreground text-xs">Check-in</p>
                        <p className="font-medium truncate">
                          {format(parseISO(booking.checkin), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm min-w-0">
                        <p className="text-muted-foreground text-xs">Check-out</p>
                        <p className="font-medium truncate">
                          {format(parseISO(booking.checkout), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="text-sm">
                        <p className="text-muted-foreground text-xs">Guests</p>
                        <p className="font-medium">{booking.party_size}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        {booking.currency === "ILS" ? "₪" : "$"}{booking.total_price}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isUpcoming && booking.hotels?.contact_email && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `mailto:${booking.hotels?.contact_email}?subject=Question about my booking`}
                        >
                          Contact Hotel
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
