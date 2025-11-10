import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const HotelAdmin = () => {
  const { user } = useAuth();

  const { data: hotelAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["hotel-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotel_admins")
        .select(`
          *,
          hotels (*)
        `)
        .eq("user_id", user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: experiences, isLoading: expLoading } = useQuery({
    queryKey: ["hotel-experiences", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("hotel_id", hotelAdmin?.hotel_id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["hotel-bookings", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          experiences (title)
        `)
        .eq("hotel_id", hotelAdmin?.hotel_id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hotelAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No hotel assigned to this account.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-24 pb-16">
        <h1 className="font-serif text-4xl font-bold mb-2">Hotel Dashboard</h1>
        <p className="text-lg text-muted-foreground mb-8">{hotelAdmin.hotels?.name}</p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="experiences">Experiences</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="hotel">Hotel Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Experiences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{experiences?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{bookings?.length || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {bookings?.filter((b) => b.status === "confirmed").length || 0}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="experiences">
            <Card>
              <CardHeader>
                <CardTitle>My Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                {expLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !experiences || experiences.length === 0 ? (
                  <p className="text-muted-foreground">No experiences yet.</p>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp) => (
                      <div key={exp.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold">{exp.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{exp.subtitle}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm">
                          <span>
                            ${exp.base_price}{" "}
                            {exp.base_price_type === "per_person" ? "per person" : "fixed"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              exp.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {exp.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : !bookings || bookings.length === 0 ? (
                  <p className="text-muted-foreground">No bookings yet.</p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{booking.experiences?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.checkin).toLocaleDateString()} -{" "}
                              {new Date(booking.checkout).toLocaleDateString()}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === "confirmed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>
                            <span className="text-muted-foreground">Guests:</span>{" "}
                            {booking.party_size}
                          </p>
                          <p className="font-semibold">
                            Total: ${booking.total_price} {booking.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hotel">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{hotelAdmin.hotels?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {hotelAdmin.hotels?.city}, {hotelAdmin.hotels?.region}
                  </p>
                </div>
                {hotelAdmin.hotels?.contact_email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{hotelAdmin.hotels.contact_email}</p>
                  </div>
                )}
                {hotelAdmin.hotels?.contact_phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{hotelAdmin.hotels.contact_phone}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default HotelAdmin;
