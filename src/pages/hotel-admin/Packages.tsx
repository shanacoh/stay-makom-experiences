import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Percent, Calendar, Loader2, Gift } from "lucide-react";

export default function HotelPackages() {
  const { user } = useAuth();

  const { data: hotelAdmin, isLoading } = useQuery({
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

  // Mock packages for demo
  const packages = [
    {
      id: 1,
      name: "Romantic Getaway",
      description: "2 nights + champagne + spa for couples",
      discount: 15,
      validUntil: "2025-12-31",
      status: "active",
      minNights: 2,
      includes: ["Welcome champagne", "2 spa massages", "Breakfast included", "Room upgrade"],
    },
    {
      id: 2,
      name: "Premium Family",
      description: "Family stay with activities",
      discount: 20,
      validUntil: "2025-08-31",
      status: "active",
      minNights: 3,
      includes: ["Kids activities", "Family meals", "Family suite", "Local guide"],
    },
    {
      id: 3,
      name: "Discovery Weekend",
      description: "Short stay with local experiences",
      discount: 10,
      validUntil: "2025-11-30",
      status: "active",
      minNights: 2,
      includes: ["Guided tour", "Local tasting", "Transport included"],
    },
    {
      id: 4,
      name: "Wellness Week",
      description: "Week-long wellness retreat",
      discount: 25,
      validUntil: "2025-06-30",
      status: "inactive",
      minNights: 7,
      includes: ["Daily yoga", "Spa treatments", "Nutrition coaching", "Guided meditation"],
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-sans text-4xl font-bold">Packages & Offres Spéciales</h1>
          <p className="text-muted-foreground mt-2">
            Créez des offres groupées attractives pour vos clients
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Package
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="h-6 w-6 text-primary" />
                    <h3 className="font-bold text-xl">{pkg.name}</h3>
                  </div>
                  <Badge variant={pkg.status === "active" ? "default" : "secondary"}>
                    {pkg.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{pkg.description}</p>
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-green-600" />
                      <span className="font-semibold">Réduction</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      -{pkg.discount}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>Valide jusqu'au</span>
                      </div>
                      <p className="font-semibold">
                        {new Date(pkg.validUntil).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Package className="h-4 w-4" />
                        <span>Minimum</span>
                      </div>
                      <p className="font-semibold">{pkg.minNights} nights</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="font-semibold mb-3 text-sm text-muted-foreground">
                      Included in package:
                    </p>
                    <ul className="space-y-2">
                      {pkg.includes.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Statistics
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
