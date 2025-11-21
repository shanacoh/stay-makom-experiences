import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "hotel_admin" | "customer">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers", searchTerm, roleFilter, countryFilter],
    queryFn: async () => {
      // Fetch all customers
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        );
      }

      if (countryFilter !== "all") {
        query = query.eq("address_country", countryFilter);
      }

      const { data: customersData, error } = await query;
      if (error) throw error;
      if (!customersData) return [];

      const userIds = customersData.map((c) => c.user_id);

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("*")
        .in("user_id", userIds);

      // Fetch user roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .in("user_id", userIds);

      // Apply role filter
      let filteredCustomers = customersData;
      if (roleFilter !== "all") {
        const filteredUserIds = roles?.filter(r => r.role === roleFilter).map(r => r.user_id) || [];
        filteredCustomers = customersData.filter(c => filteredUserIds.includes(c.user_id));
      }

      // Fetch booking stats
      const customerIds = filteredCustomers.map((c) => c.id);
      const { data: bookingStats } = await supabase
        .from("bookings")
        .select("customer_id, total_price")
        .in("customer_id", customerIds);

      // Aggregate booking data
      const statsMap = (bookingStats || []).reduce((acc, booking) => {
        if (!acc[booking.customer_id!]) {
          acc[booking.customer_id!] = { count: 0, total: 0 };
        }
        acc[booking.customer_id!].count += 1;
        acc[booking.customer_id!].total += Number(booking.total_price || 0);
        return acc;
      }, {} as Record<string, { count: number; total: number }>);

      // Map profiles and roles to customers
      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>);

      const rolesMap = (roles || []).reduce((acc, r) => {
        acc[r.user_id] = r;
        return acc;
      }, {} as Record<string, any>);

      return filteredCustomers.map((customer) => ({
        ...customer,
        user_profiles: profilesMap[customer.user_id] || null,
        user_roles: rolesMap[customer.user_id] || null,
        bookingsCount: statsMap[customer.id]?.count || 0,
        totalSpent: statsMap[customer.id]?.total || 0,
      }));
    },
  });

  const { data: customerDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ["admin-customer-detail", selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;

      const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      if (error) throw error;

      // Fetch user profile
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      // Fetch user role
      const { data: role } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", selectedCustomerId)
        .single();

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*, hotels(name), experiences(title)")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false });

      return {
        ...customer,
        user_profiles: profile,
        user_roles: role,
        bookings: bookings || [],
      };
    },
    enabled: !!selectedCustomerId,
  });

  const countries = [...new Set(customers?.map((c) => c.address_country).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Customers</h2>
        <p className="text-muted-foreground">Manage all customer accounts</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={roleFilter} 
          onValueChange={(value) => setRoleFilter(value as "all" | "admin" | "hotel_admin" | "customer")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="hotel_admin">Hotel Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={countryFilter} onValueChange={setCountryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : customers && customers.length > 0 ? (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Bookings</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.user_id}>
                  <TableCell className="font-medium">
                    {customer.first_name} {customer.last_name}
                    {customer.user_profiles?.display_name && (
                      <div className="text-xs text-muted-foreground">
                        {customer.user_profiles.display_name}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{customer.user_profiles?.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={customer.user_roles?.role === "admin" ? "default" : "secondary"}>
                      {customer.user_roles?.role || "customer"}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.address_country || "-"}</TableCell>
                  <TableCell className="text-right">{customer.bookingsCount}</TableCell>
                  <TableCell className="text-right">
                    ${customer.totalSpent.toFixed(2)}
                  </TableCell>
                  <TableCell>{format(new Date(customer.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomerId(customer.user_id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-white">
          <p className="text-muted-foreground">
            {searchTerm || roleFilter !== "all" || countryFilter !== "all"
              ? "No customers found"
              : "No customers yet"}
          </p>
        </div>
      )}

      <Sheet open={!!selectedCustomerId} onOpenChange={() => setSelectedCustomerId(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Customer Details</SheetTitle>
          </SheetHeader>
          {isLoadingDetail ? (
            <div className="py-8 text-center">Loading...</div>
          ) : customerDetail ? (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">First Name:</span>
                    <p className="font-medium">{customerDetail.first_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Name:</span>
                    <p className="font-medium">{customerDetail.last_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Display Name:</span>
                    <p className="font-medium">{customerDetail.user_profiles?.display_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <p className="font-medium">{customerDetail.user_profiles?.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country:</span>
                    <p className="font-medium">{customerDetail.address_country || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Party Size:</span>
                    <p className="font-medium">{customerDetail.default_party_size}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Locale:</span>
                    <p className="font-medium">{customerDetail.user_profiles?.locale || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Role:</span>
                    <Badge>{customerDetail.user_roles?.role || "customer"}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Marketing Opt-in:</span>
                    <p className="font-medium">
                      {customerDetail.user_profiles?.marketing_opt_in ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
                {customerDetail.notes && (
                  <div>
                    <span className="text-muted-foreground text-sm">Notes:</span>
                    <p className="text-sm mt-1">{customerDetail.notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Booking History</h3>
                {customerDetail.bookings && customerDetail.bookings.length > 0 ? (
                  <div className="space-y-3">
                    {customerDetail.bookings.map((booking: any) => (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.hotels?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.experiences?.title}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Check-in:</span>
                            <p>{format(new Date(booking.checkin), "MMM d, yyyy")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Check-out:</span>
                            <p>{format(new Date(booking.checkout), "MMM d, yyyy")}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total:</span>
                            <p className="font-medium">${Number(booking.total_price).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Party:</span>
                            <p>{booking.party_size} guests</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminCustomers;
