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

const AdminBookings = () => {
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
          packages:package_id(name)
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      hold: "bg-orange-100 text-orange-800",
      accepted: "bg-blue-100 text-blue-800",
      paid: "bg-green-100 text-green-800",
      confirmed: "bg-emerald-100 text-emerald-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
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
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {format(new Date(booking.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(status) =>
                        updateStatusMutation.mutate({ id: booking.id, status })
                      }
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="hold">Hold</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
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
