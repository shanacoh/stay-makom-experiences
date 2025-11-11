import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export default function HotelAdminDashboard() {
  const { user } = useAuth();

  const { data: hotelAdmin, isLoading } = useQuery({
    queryKey: ["hotel-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_admins")
        .select("*, hotels(*)")
        .eq("user_id", user?.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["hotel-stats", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const [experiencesRes, bookingsRes] = await Promise.all([
        supabase.from("experiences").select("id", { count: "exact" }).eq("hotel_id", hotelAdmin?.hotel_id),
        supabase.from("bookings").select("*").eq("hotel_id", hotelAdmin?.hotel_id),
      ]);

      const bookings = bookingsRes.data || [];
      const pending = bookings.filter(b => b.status === "pending").length;
      const confirmed = bookings.filter(b => b.status === "confirmed").length;
      const revenue = bookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);

      return {
        experiences: experiencesRes.count || 0,
        totalBookings: bookings.length,
        pending,
        confirmed,
        revenue,
      };
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotelAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">No hotel assigned to this account.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-lg text-muted-foreground">{hotelAdmin.hotels?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.pending || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Confirmed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.confirmed || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Experiences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.experiences || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats?.revenue.toFixed(2) || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link to="/hotel-admin/experiences">
              <Plus className="mr-2 h-4 w-4" />
              Create Experience
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/hotel-admin/pricing">
              <DollarSign className="mr-2 h-4 w-4" />
              Update Prices
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/hotel-admin/bookings">
              <FileText className="mr-2 h-4 w-4" />
              View Bookings
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Notifications placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity to display.</p>
        </CardContent>
      </Card>
    </div>
  );
}
