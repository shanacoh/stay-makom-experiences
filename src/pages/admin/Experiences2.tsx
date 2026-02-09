import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Star } from "lucide-react";
import { UnifiedExperience2Form } from "@/components/forms/UnifiedExperience2Form";

export default function AdminExperiences2() {
  const { experienceId } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(!!experienceId);

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["admin-experiences2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences2")
        .select("*, hotels2(name, star_rating, property_type), categories(name)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !showForm,
  });

  if (showForm || experienceId) {
    return (
      <UnifiedExperience2Form
        experienceId={experienceId}
        onClose={() => {
          setShowForm(false);
          navigate("/admin/experiences2");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Experiences V2</h1>
        <Button onClick={() => navigate("/admin/experiences2/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Experience
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : !experiences?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No V2 experiences yet. Click "New Experience" to create one.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {experiences.map((exp) => {
            const hotel = exp.hotels2 as any;
            const category = exp.categories as any;
            return (
              <Card
                key={exp.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/admin/experiences2/edit/${exp.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{exp.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={exp.status === "published" ? "default" : "secondary"}>
                        {exp.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {hotel?.name && <span>🏨 {hotel.name}</span>}
                    {hotel?.star_rating && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {hotel.star_rating}
                      </span>
                    )}
                    {hotel?.property_type && <span>{hotel.property_type}</span>}
                    {category?.name && <Badge variant="outline">{category.name}</Badge>}
                    {exp.base_price > 0 && <span>₪{exp.base_price}</span>}
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
