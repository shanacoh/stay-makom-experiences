import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Account = () => {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          hotels (name, city),
          experiences (title)
        `)
        .eq("customer_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (profileLoading || customerLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container pt-24 pb-16">
        <h1 className="font-sans text-4xl font-bold mb-8">My Account</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                {profile?.display_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Display Name</p>
                    <p className="font-medium">{profile.display_name}</p>
                  </div>
                )}
                {customer && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {customer.first_name} {customer.last_name}
                      </p>
                    </div>
                    {customer.address_country && (
                      <div>
                        <p className="text-sm text-muted-foreground">Country</p>
                        <p className="font-medium">{customer.address_country}</p>
                      </div>
                    )}
                  </>
                )}
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {!bookings || bookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No bookings yet. Start exploring extraordinary stays!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{booking.experiences?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.hotels?.name} • {booking.hotels?.city}
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
                            <span className="text-muted-foreground">Check-in:</span>{" "}
                            {new Date(booking.checkin).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Check-out:</span>{" "}
                            {new Date(booking.checkout).toLocaleDateString()}
                          </p>
                          <p>
                            <span className="text-muted-foreground">Guests:</span>{" "}
                            {booking.party_size}
                          </p>
                          <p className="font-semibold mt-2">
                            Total: ${booking.total_price} {booking.currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
