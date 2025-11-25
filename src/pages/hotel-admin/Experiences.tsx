import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, Users, DollarSign, TrendingUp, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default function HotelExperiences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["hotel-experiences", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select(`
          *,
          categories(name)
        `)
        .eq("hotel_id", hotelAdmin?.hotel_id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  // Fetch extras through experience_extras join
  const { data: experienceExtras } = useQuery({
    queryKey: ["experience-extras-links", hotelAdmin?.hotel_id],
    queryFn: async () => {
      if (!experiences) return [];
      
      const experienceIds = experiences.map(e => e.id);
      
      const { data, error } = await supabase
        .from("experience_extras")
        .select(`
          experience_id,
          extra_id,
          extras (*)
        `)
        .in("experience_id", experienceIds);
      
      if (error) throw error;
      return data;
    },
    enabled: !!experiences && experiences.length > 0,
  });

  const { data: bookingStats } = useQuery({
    queryKey: ["experience-booking-stats", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("experience_id, total_price, status, created_at")
        .eq("hotel_id", hotelAdmin?.hotel_id);
      
      if (error) throw error;

      const stats = data.reduce((acc: Record<string, any>, booking) => {
        if (!acc[booking.experience_id]) {
          acc[booking.experience_id] = {
            totalBookings: 0,
            confirmedBookings: 0,
            totalRevenue: 0,
            recentBookings: 0,
          };
        }
        acc[booking.experience_id].totalBookings += 1;
        if (booking.status === "confirmed") {
          acc[booking.experience_id].confirmedBookings += 1;
        }
        acc[booking.experience_id].totalRevenue += Number(booking.total_price);
        
        const bookingDate = new Date(booking.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (bookingDate > thirtyDaysAgo) {
          acc[booking.experience_id].recentBookings += 1;
        }
        
        return acc;
      }, {});

      return stats;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  // Mutation to toggle extra availability
  const toggleExtraMutation = useMutation({
    mutationFn: async ({ extraId, isAvailable }: { extraId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from("extras")
        .update({ is_available: isAvailable })
        .eq("id", extraId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Extra availability updated");
      queryClient.invalidateQueries({ queryKey: ["experience-extras", hotelAdmin?.hotel_id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update extra");
    },
  });

  const handleToggleExtra = (extraId: string, currentAvailability: boolean) => {
    toggleExtraMutation.mutate({ extraId, isAvailable: !currentAvailability });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-4xl font-bold">Experiences</h1>
        <p className="text-muted-foreground mt-2">
          View your experiences and manage extras availability
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Experience content (titles, descriptions, pricing) is managed by STAYMAKOM Admin. 
          You can activate or deactivate extras for your experiences here.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !experiences || experiences.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <p className="text-muted-foreground text-center">
              No experiences available yet. Contact STAYMAKOM Admin to create experiences for your property.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {experiences.map((exp) => {
            const stats = bookingStats?.[exp.id] || {
              totalBookings: 0,
              confirmedBookings: 0,
              totalRevenue: 0,
              recentBookings: 0,
            };

            const expExtras = experienceExtras?.filter(link => link.experience_id === exp.id).map(link => link.extras) || [];

            return (
              <Card key={exp.id} className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                  {exp.hero_image ? (
                    <img
                      src={exp.hero_image}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={exp.status === "published" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {exp.status}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{exp.title}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {exp.categories?.name || 'No category'}
                    </p>
                    {exp.subtitle && (
                      <p className="text-sm text-muted-foreground">{exp.subtitle}</p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Bookings</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      {stats.recentBookings > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{stats.recentBookings} this month
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenue</span>
                      </div>
                      <p className="text-2xl font-bold">
                        ${Math.round(stats.totalRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">{exp.currency}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Confirmed</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.confirmedBookings}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Base Price</span>
                      </div>
                      <p className="text-2xl font-bold">
                        ${exp.base_price}
                      </p>
                    </div>
                  </div>

                  {/* Extras Section */}
                  {expExtras.length > 0 && (
                    <div className="border-t pt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5" />
                        <h3 className="font-semibold">Extras & Add-ons</h3>
                        <Badge variant="secondary">{expExtras.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {expExtras.map((extra) => (
                          <div
                            key={extra.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                          >
                            <div className="space-y-1 flex-1">
                              <p className="font-medium">{extra.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {extra.description}
                              </p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="font-semibold">
                                  ${extra.price} {extra.currency}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {extra.pricing_type === "per_person" ? "Per person" : 
                                   extra.pricing_type === "per_night" ? "Per night" : "Per booking"}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <Label htmlFor={`extra-${extra.id}`} className="text-sm">
                                {extra.is_available ? "Active" : "Inactive"}
                              </Label>
                              <Switch
                                id={`extra-${extra.id}`}
                                checked={extra.is_available || false}
                                onCheckedChange={() => handleToggleExtra(extra.id, extra.is_available || false)}
                                disabled={toggleExtraMutation.isPending}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
