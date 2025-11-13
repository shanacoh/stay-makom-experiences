import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Copy, Calendar, Users, DollarSign, TrendingUp, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExperienceForm } from "@/components/hotel-admin/ExperienceForm";
import { toast } from "sonner";

export default function HotelExperiences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

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

  const { data: hotel, isLoading: isLoadingHotel } = useQuery({
    queryKey: ["hotel", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hotels")
        .select("name")
        .eq("id", hotelAdmin?.hotel_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  const { data: experiences, isLoading } = useQuery({
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

  const handleDuplicate = async (experienceId: string) => {
    setDuplicatingId(experienceId);
    try {
      const { data: original, error: fetchError } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", experienceId)
        .single();

      if (fetchError) throw fetchError;

      const { id, created_at, updated_at, slug, ...experienceData } = original;
      
      const { error: insertError } = await supabase
        .from("experiences")
        .insert({
          ...experienceData,
          title: `Copy of ${original.title}`,
          slug: `${original.slug}-copy-${Date.now()}`,
          status: "draft",
        });

      if (insertError) throw insertError;

      toast.success("Experience duplicated successfully");
      queryClient.invalidateQueries({ queryKey: ["hotel-experiences", hotelAdmin?.hotel_id] });
    } catch (error) {
      console.error("Error duplicating experience:", error);
      toast.error("Failed to duplicate experience");
    } finally {
      setDuplicatingId(null);
    }
  };

  if (showForm) {
    if (isLoadingHotel || !hotelAdmin?.hotel_id) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <ExperienceForm
        hotelId={hotelAdmin.hotel_id}
        hotelName={hotel?.name || ""}
        experienceId={editingExperienceId || undefined}
        onClose={() => {
          setShowForm(false);
          setEditingExperienceId(null);
        }}
      />
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-sans text-4xl font-bold">Experiences</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Experience
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !experiences || experiences.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <p className="text-muted-foreground text-center">
              No experiences yet. Create your first one!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => {
            const stats = bookingStats?.[exp.id] || {
              totalBookings: 0,
              confirmedBookings: 0,
              totalRevenue: 0,
              recentBookings: 0,
            };

            return (
              <Card key={exp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <CardTitle className="text-xl line-clamp-2">{exp.title}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">{exp.category}</p>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Réservations</span>
                      </div>
                      <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      {stats.recentBookings > 0 && (
                        <p className="text-xs text-muted-foreground">
                          +{stats.recentBookings} ce mois
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Revenu</span>
                      </div>
                      <p className="text-2xl font-bold">
                        ${Math.round(stats.totalRevenue)}
                      </p>
                      <p className="text-xs text-muted-foreground">{exp.currency}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Confirmées</span>
                      </div>
                      <p className="text-lg font-semibold">{stats.confirmedBookings}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Prix de base</span>
                      </div>
                      <p className="text-lg font-semibold">
                        ${exp.base_price}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingExperienceId(exp.id);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDuplicate(exp.id)}
                      disabled={duplicatingId === exp.id}
                    >
                      {duplicatingId === exp.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
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
