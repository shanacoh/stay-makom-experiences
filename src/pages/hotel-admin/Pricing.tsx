import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Percent, Calendar, Loader2 } from "lucide-react";

export default function HotelPricing() {
  const { user } = useAuth();

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
    queryKey: ["pricing-experiences", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*, categories(name)")
        .eq("hotel_id", hotelAdmin?.hotel_id)
        .order("title", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  // Mock pricing rules for demo
  const pricingRules = [
    {
      id: 1,
      name: "Week-end Premium",
      type: "Majoration",
      value: "+15%",
      period: "Vendredi - Dimanche",
      status: "active",
    },
    {
      id: 2,
      name: "Haute Saison",
      type: "Majoration",
      value: "+25%",
      period: "Juillet - Août",
      status: "active",
    },
      {
      id: 3,
      name: "Early Booking",
      type: "Discount",
      value: "-10%",
      period: "30+ days in advance",
      status: "active",
    },
    {
      id: 4,
      name: "Low Season",
      type: "Discount",
      value: "-20%",
      period: "January - March",
      status: "inactive",
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-sans text-4xl font-bold">Règles de Tarification</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les majorations et réductions saisonnières
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Règles Actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pricingRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{rule.name}</p>
                        <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                          {rule.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {rule.period}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={
                          rule.type === "Majoration"
                            ? "border-red-500 text-red-600"
                            : "border-green-500 text-green-600"
                        }
                      >
                        {rule.type}
                      </Badge>
                      <p className="text-2xl font-bold">
                        {rule.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Experience Base Prices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiences?.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{exp.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {exp.categories?.name || 'Sans catégorie'}
                        </p>
                      </div>
                      <Badge variant={exp.status === "published" ? "default" : "secondary"}>
                        {exp.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Base price</p>
                        <p className="text-2xl font-bold">
                          ${exp.base_price}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {exp.base_price_type === "per_person"
                          ? "Par personne"
                          : exp.base_price_type === "per_booking"
                          ? "Par réservation"
                          : "Fixe"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
