import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const AdminBookings = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [hotelFilter, setHotelFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings", statusFilter, hotelFilter],
    queryFn: async () => {
      let query = supabase
        .from("bookings" as any)
        .select(`
          *,
          hotels:hotel_id(name),
          experiences:experience_id(title),
          customers:customer_id(first_name, last_name),
          packages:package_id(name),
          booking_extras(*)
        `)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      if (hotelFilter !== "all") {
        query = query.eq("hotel_id", hotelFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: hotels } = useQuery({
    queryKey: ["hotels-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels" as any)
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { 
      id: string; 
      status: "pending" | "hold" | "accepted" | "paid" | "confirmed" | "failed" | "cancelled" 
    }) => {
      const { error } = await supabase
        .from("bookings" as any)
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking status updated");
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "outline", label: "Pending" },
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

  const getExtrasProgress = (bookingExtras: any[]) => {
    if (!bookingExtras || bookingExtras.length === 0) {
      return <Badge variant="outline" className="text-xs">No extras</Badge>;
    }
    
    const total = bookingExtras.length;
    const pending = bookingExtras.filter((e: any) => e.status === 'pending').length;
    const done = bookingExtras.filter((e: any) => e.status === 'done').length;

    // Determine color: GREEN (all done), RED (nothing handled), YELLOW (partial)
    let variant: "default" | "destructive" | "secondary" = "secondary";
    if (total > 0 && pending === 0 && done > 0) {
      variant = "default"; // GREEN - all done
    } else if (total > 0 && done === 0 && pending > 0) {
      variant = "destructive"; // RED - nothing handled
    } else if (total > 0 && done > 0 && pending > 0) {
      variant = "secondary"; // YELLOW - partially handled
    }

    return (
      <Badge variant={variant} className="text-xs">
        {done}/{total} completed
      </Badge>
    );
  };

  const getCurrencySymbol = (currency: string) => {
    return currency === "ILS" ? "₪" : "$";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Bookings</h2>
        <p className="text-muted-foreground">Manage all bookings</p>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={hotelFilter} onValueChange={setHotelFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Filter by hotel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hotels</SelectItem>
            {hotels?.map((hotel) => (
              <SelectItem key={hotel.id} value={hotel.id}>
                {hotel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : bookings && bookings.length > 0 ? (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Guests</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Extras</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs">
                    {booking.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    {booking.customers?.first_name} {booking.customers?.last_name}
                  </TableCell>
                  <TableCell>{booking.hotels?.name}</TableCell>
                  <TableCell>{booking.experiences?.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {booking.packages?.name || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(booking.checkin), "MMM d")} -{" "}
                    {format(new Date(booking.checkout), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>{booking.party_size}</TableCell>
                  <TableCell className="font-medium">
                    {getCurrencySymbol(booking.currency || "USD")}
                    {booking.total_price}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(booking.status)}
                  </TableCell>
                  <TableCell>
                    {getExtrasProgress(booking.booking_extras)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(booking.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/reservations/${booking.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-muted-foreground">No reservations found</p>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
