import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Search, Globe, TrendingUp, Trash2, MousePointer, ShoppingCart, ArrowRight, RotateCcw } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { toast } from "sonner";

interface AIQuery {
  id: string;
  query: string;
  lang: string | null;
  recommendation_count: number | null;
  created_at: string | null;
  user_agent: string | null;
  session_id: string | null;
  converted: boolean | null;
  conversion_experience_id: string | null;
}

interface AIEvent {
  id: string;
  search_id: string | null;
  session_id: string;
  event_type: string;
  experience_id: string | null;
  booking_id: string | null;
  position: number | null;
  created_at: string | null;
}

const AIInsights = () => {
  const { data: queries, isLoading: queriesLoading, refetch: refetchQueries } = useQuery({
    queryKey: ["ai-search-queries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_search_queries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as AIQuery[];
    },
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["ai-search-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_search_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;
      return data as AIEvent[];
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
      refetchQueries();
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

  // Event-based metrics
  const clickEvents = events?.filter(e => e.event_type === 'click') || [];
  const bookingEvents = events?.filter(e => e.event_type === 'booking') || [];
  const newSearchEvents = events?.filter(e => e.event_type === 'new_search') || [];
  const bounceEvents = events?.filter(e => e.event_type === 'bounce') || [];

  // Calculate rates
  const clickRate = totalQueries > 0 ? ((clickEvents.length / totalQueries) * 100).toFixed(1) : "0";
  const conversionRate = totalQueries > 0 ? ((bookingEvents.length / totalQueries) * 100).toFixed(1) : "0";
  const bounceRate = totalQueries > 0 ? ((bounceEvents.length / totalQueries) * 100).toFixed(1) : "0";
  const multiSearchRate = totalQueries > 0 ? ((newSearchEvents.length / totalQueries) * 100).toFixed(1) : "0";

  // Top clicked experiences
  const clicksByExperience = clickEvents.reduce((acc, e) => {
    if (e.experience_id) {
      acc[e.experience_id] = (acc[e.experience_id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topClickedExperiences = Object.entries(clicksByExperience)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Click position distribution
  const positionCounts = clickEvents.reduce((acc, e) => {
    if (e.position) {
      acc[e.position] = (acc[e.position] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  // Language distribution
  const langCounts = queries?.reduce((acc, q) => {
    const lang = q.lang || "unknown";
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const isLoading = queriesLoading || eventsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">AI Insights</h1>
            <p className="text-sm text-muted-foreground">
              Analyse complète du funnel IA
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleClearOldQueries}>
          <Trash2 className="h-4 w-4 mr-2" />
          Nettoyer +30j
        </Button>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Search className="h-4 w-4" />
              Recherches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQueries}</div>
            <p className="text-xs text-muted-foreground">{todayQueries} aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              Taux de Clic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{clickRate}%</div>
            <p className="text-xs text-muted-foreground">{clickEvents.length} clics</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">{bookingEvents.length} réservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Multi-recherches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{multiSearchRate}%</div>
            <p className="text-xs text-muted-foreground">Rebond: {bounceRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Funnel de Conversion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Recherches</span>
              <span className="font-medium">{totalQueries}</span>
            </div>
            <Progress value={100} className="h-3" />
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clics sur expériences</span>
              <span className="font-medium">{clickEvents.length} ({clickRate}%)</span>
            </div>
            <Progress value={parseFloat(clickRate)} className="h-3 bg-blue-100" />
          </div>
          
          <div className="flex justify-center">
            <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Réservations</span>
              <span className="font-medium">{bookingEvents.length} ({conversionRate}%)</span>
            </div>
            <Progress value={parseFloat(conversionRate)} className="h-3 bg-green-100" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Click Position Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Position des Clics</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(positionCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">Pas encore de données</p>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((pos) => (
                  <div key={pos} className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 justify-center">
                      #{pos}
                    </Badge>
                    <Progress 
                      value={clickEvents.length > 0 ? ((positionCounts[pos] || 0) / clickEvents.length) * 100 : 0} 
                      className="flex-1 h-2"
                    />
                    <span className="text-sm font-medium w-12 text-right">
                      {positionCounts[pos] || 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Language & Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Langues & Appareils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Par langue</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(langCounts).map(([lang, count]) => (
                    <Badge key={lang} variant="secondary">
                      {lang.toUpperCase()}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Par appareil</p>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Mobile: {queries?.filter(q => isMobile(q.user_agent)).length || 0}
                  </Badge>
                  <Badge variant="outline">
                    Desktop: {queries?.filter(q => !isMobile(q.user_agent)).length || 0}
                  </Badge>
                </div>
              </div>
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
                  <TableHead>Actions</TableHead>
                  <TableHead>Converti</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queries.slice(0, 30).map((q) => {
                  const queryEvents = events?.filter(e => e.search_id === q.id) || [];
                  const hasClick = queryEvents.some(e => e.event_type === 'click');
                  const hasBooking = queryEvents.some(e => e.event_type === 'booking');
                  const hasBounce = queryEvents.some(e => e.event_type === 'bounce');
                  
                  return (
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
                        <div className="flex gap-1">
                          {hasClick && <Badge variant="default" className="bg-blue-500">Clic</Badge>}
                          {hasBounce && <Badge variant="secondary">Rebond</Badge>}
                          {!hasClick && !hasBounce && queryEvents.length === 0 && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {hasBooking || q.converted ? (
                          <Badge variant="default" className="bg-green-500">Oui</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Non</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {q.created_at
                          ? format(new Date(q.created_at), "dd/MM HH:mm")
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
