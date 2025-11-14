import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X, ExternalLink, Plus, Edit } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminExperiences = () => {
  const [actionId, setActionId] = useState<string | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const queryClient = useQueryClient();

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences" as any)
        .select(`
          *,
          hotels:hotel_id(name, slug),
          categories(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("experiences" as any)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-experiences"] });
      toast.success(action === "approve" ? "Experience approved and published" : "Experience rejected");
      setActionId(null);
      setAction(null);
    },
  });

  const handleApprove = (id: string) => {
    setActionId(id);
    setAction("approve");
  };

  const handleReject = (id: string) => {
    setActionId(id);
    setAction("reject");
  };

  const confirmAction = () => {
    if (actionId && action) {
      updateStatusMutation.mutate({
        id: actionId,
        status: action === "approve" ? "published" : "draft"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="default" className="bg-green-600">Live</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-600 text-white">En attente</Badge>;
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Experiences</h2>
          <p className="text-muted-foreground">Gérer toutes les expériences et valider les soumissions</p>
        </div>
        <Link to="/admin/experiences/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Créer une expérience
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : experiences && experiences.length > 0 ? (
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Hôtel</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix de base</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experiences.map((experience) => (
                <TableRow key={experience.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {experience.title}
                  </TableCell>
                  <TableCell>
                    {experience.hotels?.name || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{experience.categories?.name || 'Sans catégorie'}</Badge>
                  </TableCell>
                  <TableCell>
                    {experience.base_price} {experience.currency}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(experience.status)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/admin/experiences/edit/${experience.id}`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Modifier
                      </Button>
                    </Link>
                    <Link 
                      to={`/experience/${experience.slug}`}
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir
                      </Button>
                    </Link>
                    {experience.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(experience.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReject(experience.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {experience.status === "published" && (
                      <Link 
                        to={`/hotel-admin/experiences`}
                        target="_blank"
                      >
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Espace hôtel
                        </Button>
                      </Link>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucune expérience trouvée</p>
        </div>
      )}

      <AlertDialog open={actionId !== null} onOpenChange={() => setActionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "approve" ? "Valider cette expérience ?" : "Rejeter cette expérience ?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "approve" 
                ? "Cette expérience sera publiée et visible sur le site public."
                : "Cette expérience sera renvoyée en brouillon. L'hôtel pourra la modifier et la soumettre à nouveau."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExperiences;
