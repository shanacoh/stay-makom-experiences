import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Copy } from "lucide-react";
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
        <h1 className="font-serif text-4xl font-bold">Experiences</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Experience
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Experiences</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !experiences || experiences.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No experiences yet. Create your first one!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {experiences.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.title}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>
                      ${exp.base_price} {exp.currency}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          exp.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(exp.updated_at!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingExperienceId(exp.id);
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
