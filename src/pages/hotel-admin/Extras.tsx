import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function HotelExtras() {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);

  const { data: experiences } = useQuery({
    queryKey: ["hotel-experiences"],
    queryFn: async () => {
      const { data: hotelAdmin } = await supabase
        .from("hotel_admins")
        .select("hotel_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!hotelAdmin) return [];

      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("hotel_id", hotelAdmin.hotel_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: extras } = useQuery({
    queryKey: ["extras", selectedExperience],
    queryFn: async () => {
      if (!selectedExperience) return [];

      const { data, error } = await supabase
        .from("extras")
        .select("*")
        .eq("experience_id", selectedExperience)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedExperience,
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-4xl font-bold">Extras & Add-ons</h1>
          <p className="text-muted-foreground mt-2">
            Manage optional extras customers can add to their booking
          </p>
        </div>
        <Button disabled={!selectedExperience}>
          <Plus className="mr-2 h-4 w-4" />
          Add Extra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {experiences?.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setSelectedExperience(exp.id)}
                className={`p-4 text-left border rounded-lg transition-colors ${
                  selectedExperience === exp.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {exp.category_id || "No category"}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedExperience && (
        <Card>
          <CardHeader>
            <CardTitle>Extras for Selected Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {extras && extras.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Max Qty</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extras.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="font-medium">{extra.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {extra.description || "—"}
                      </TableCell>
                      <TableCell>{extra.currency} {extra.price}</TableCell>
                      <TableCell className="capitalize">
                        {extra.pricing_type?.replace("_", " ")}
                      </TableCell>
                      <TableCell>{extra.max_qty}</TableCell>
                      <TableCell>
                        <Badge variant={extra.is_available ? "default" : "secondary"}>
                          {extra.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No extras configured for this experience yet.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
