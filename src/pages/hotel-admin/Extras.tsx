import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Package, Users, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HotelExtras() {
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

  const { data: extras, isLoading } = useQuery({
    queryKey: ["hotel-extras", hotelAdmin?.hotel_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("extras")
        .select(`
          *,
          experiences!inner(
            id,
            title,
            hotel_id
          )
        `)
        .eq("experiences.hotel_id", hotelAdmin?.hotel_id)
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!hotelAdmin?.hotel_id,
  });

  // Group extras by experience
  const extrasByExperience = extras?.reduce((acc: any, extra) => {
    const expTitle = extra.experiences?.title || "Unknown";
    if (!acc[expTitle]) {
      acc[expTitle] = [];
    }
    acc[expTitle].push(extra);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-sans text-4xl font-bold">Extras & Add-ons</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les options supplémentaires pour vos expériences
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Extra
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !extras || extras.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <p className="text-muted-foreground text-center">
              Aucun extra créé pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(extrasByExperience || {}).map(([expTitle, expExtras]: [string, any]) => (
            <Card key={expTitle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {expTitle}
                  <Badge variant="secondary" className="ml-auto">
                    {expExtras.length} extras
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Prix</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Stock Max</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expExtras.map((extra: any) => (
                      <TableRow key={extra.id}>
                        <TableCell className="font-medium">{extra.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {extra.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {extra.price} {extra.currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {extra.pricing_type === "per_person" ? (
                              <><Users className="h-3 w-3 mr-1" /> Par personne</>
                            ) : (
                              <><Package className="h-3 w-3 mr-1" /> Par réservation</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{extra.max_qty}</TableCell>
                        <TableCell>
                          <Badge variant={extra.is_available ? "default" : "secondary"}>
                            {extra.is_available ? "Disponible" : "Indisponible"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}