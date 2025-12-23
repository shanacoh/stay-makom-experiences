import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Search, Globe, TrendingUp, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { toast } from "sonner";

interface AIQuery {
  id: string;
  query: string;
  lang: string | null;
  recommendation_count: number | null;
  created_at: string | null;
  user_agent: string | null;
}

const AIInsights = () => {
  const { data: queries, isLoading, refetch } = useQuery({
    queryKey: ["ai-search-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_search_queries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as AIQuery[];
    },
  });

  const handleClearOldQueries = async () => {
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
    const { error } = await supabase
      .from("ai_search_queries")
      .delete()
      .lt("created_at", thirtyDaysAgo);

    if (error) {
      toast.error("Failed to delete old queries");
    } else {
      toast.success("Old queries deleted");
      refetch();
    }
  };

  const isMobile = (userAgent: string | null) => {
    if (!userAgent) return false;
    return /Mobile|Android|iPhone|iPad/i.test(userAgent);
  };

  // Calculate stats
  const totalQueries = queries?.length || 0;
  const todayQueries = queries?.filter((q) => {
    if (!q.created_at) return false;
    return isAfter(new Date(q.created_at), startOfDay(new Date()));
  }).length || 0;
  
  const avgRecommendations = queries?.length
    ? (queries.reduce((sum, q) => sum + (q.recommendation_count || 0), 0) / queries.length).toFixed(1)
    : "0";

  // Language distribution
  const langCounts = queries?.reduce((acc, q) => {
    const lang = q.lang || "unknown";
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-sm text-muted-foreground">
              Analyse des recherches utilisateurs
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearOldQueries}>
          <Trash2 className="h-4 w-4 mr-2" />
          Nettoyer +30j
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Total Recherches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQueries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayQueries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Moy. Résultats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRecommendations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(langCounts).map(([lang, count]) => (
                <Badge key={lang} variant="secondary">
                  {lang.toUpperCase()}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Queries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recherches Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Chargement...</p>
          ) : !queries?.length ? (
            <p className="text-muted-foreground">Aucune recherche enregistrée</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Requête</TableHead>
                  <TableHead>Langue</TableHead>
                  <TableHead>Résultats</TableHead>
                  <TableHead>Appareil</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.slice(0, 50).map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium max-w-xs truncate">
                      {q.query}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {q.lang?.toUpperCase() || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{q.recommendation_count ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={isMobile(q.user_agent) ? "default" : "secondary"}>
                        {isMobile(q.user_agent) ? "Mobile" : "Desktop"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {q.created_at
                        ? format(new Date(q.created_at), "dd/MM/yy HH:mm")
                        : "—"}
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
};

export default AIInsights;
