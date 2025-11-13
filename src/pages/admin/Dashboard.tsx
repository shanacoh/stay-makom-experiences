import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Building2, Users } from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get bookings count and revenue from last 30 days
      const { data: bookings } = await supabase
        .from("bookings" as any)
        .select("total_price")
        .gte("created_at", thirtyDaysAgo.toISOString()) as any;

      // Get total published hotels
      const { data: hotels } = await supabase
        .from("hotels" as any)
        .select("id", { count: "exact" })
        .eq("status", "published") as any;

      // Get total customers
      const { data: customers } = await supabase
        .from("customers" as any)
        .select("user_id", { count: "exact" }) as any;

      const totalRevenue = bookings?.reduce((sum, b) => sum + parseFloat(b.total_price || "0"), 0) || 0;

      return {
        bookingsCount: bookings?.length || 0,
        totalRevenue,
        hotelsCount: hotels?.length || 0,
        customersCount: customers?.length || 0,
      };
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["recent-bookings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("bookings" as any)
        .select(`
          id,
          created_at,
          total_price,
          status,
          hotels:hotel_id (name),
          customers:customer_id (first_name, last_name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      return data as any[];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your business</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservations (30d)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.bookingsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (30d)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published Hotels</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.hotelsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customersCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reservations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">
                      {booking.customers?.first_name} {booking.customers?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {booking.hotels?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${booking.total_price}</p>
                    <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No recent bookings</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
