import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Users, Loader2, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
      <div className="mb-8">
        <h1 className="font-sans text-4xl font-bold">Extras & Add-ons</h1>
        <p className="text-muted-foreground mt-2">
          Overview of all extras available for your experiences
        </p>
      </div>

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Extras content and pricing are managed by STAYMAKOM Admin. 
          To activate or deactivate extras, go to the Experiences page.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !extras || extras.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <p className="text-muted-foreground text-center">
              No extras available yet. Contact STAYMAKOM Admin to add extras to your experiences.
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
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Max Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expExtras.map((extra: any) => (
                      <TableRow key={extra.id}>
                        <TableCell className="font-medium">{extra.name}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {extra.description || "—"}
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
                              <><Users className="h-3 w-3 mr-1" /> Per person</>
                            ) : extra.pricing_type === "per_night" ? (
                              <><Package className="h-3 w-3 mr-1" /> Per night</>
                            ) : (
                              <><Package className="h-3 w-3 mr-1" /> Per booking</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>{extra.max_qty}</TableCell>
                        <TableCell>
                          <Badge variant={extra.is_available ? "default" : "secondary"}>
                            {extra.is_available ? "Active" : "Inactive"}
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
