import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

const downloadJson = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const fetchAll = async (table: string) => {
  const all: any[] = [];
  let from = 0;
  const step = 1000;
  while (true) {
    const { data, error } = await (supabase.from(table as any) as any).select("*").range(from, from + step - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < step) break;
    from += step;
  }
  return all;
};

export default function DataExport() {
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loadingExp, setLoadingExp] = useState(false);

  const exportHotels = async () => {
    setLoadingHotels(true);
    try {
      const [hotels, hotels2, extras, packages, experience_extras, hotel_admins, highlight_tags, experience_highlight_tags] = await Promise.all([
        fetchAll("hotels"),
        fetchAll("hotels2"),
        fetchAll("extras"),
        fetchAll("packages"),
        fetchAll("experience_extras"),
        fetchAll("hotel_admins"),
        fetchAll("highlight_tags"),
        fetchAll("experience_highlight_tags"),
      ]);
      downloadJson({
        exported_at: new Date().toISOString(),
        hotels,
        hotels2,
        extras,
        packages,
        experience_extras,
        hotel_admins,
        highlight_tags,
        experience_highlight_tags,
      }, `hotels-export-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success(`Exporté : ${hotels.length} hotels V1 + ${hotels2.length} hotels V2`);
    } catch (e: any) {
      toast.error("Erreur export hôtels: " + e.message);
    } finally {
      setLoadingHotels(false);
    }
  };

  const exportExperiences = async () => {
    setLoadingExp(true);
    try {
      const [
        experiences, experiences2, categories,
        experience_includes, experience_reviews,
        experience2_includes, experience2_reviews,
        experience2_hotels, experience2_addons,
        experience2_date_options, experience2_extras,
        experience2_highlight_tags, experience2_practical_info,
        hotel2_extras,
      ] = await Promise.all([
        fetchAll("experiences"),
        fetchAll("experiences2"),
        fetchAll("categories"),
        fetchAll("experience_includes"),
        fetchAll("experience_reviews"),
        fetchAll("experience2_includes"),
        fetchAll("experience2_reviews"),
        fetchAll("experience2_hotels"),
        fetchAll("experience2_addons"),
        fetchAll("experience2_date_options"),
        fetchAll("experience2_extras"),
        fetchAll("experience2_highlight_tags"),
        fetchAll("experience2_practical_info"),
        fetchAll("hotel2_extras"),
      ]);
      downloadJson({
        exported_at: new Date().toISOString(),
        experiences,
        experiences2,
        categories,
        experience_includes,
        experience_reviews,
        experience2_includes,
        experience2_reviews,
        experience2_hotels,
        experience2_addons,
        experience2_date_options,
        experience2_extras,
        experience2_highlight_tags,
        experience2_practical_info,
        hotel2_extras,
      }, `experiences-export-${new Date().toISOString().slice(0, 10)}.json`);
      toast.success(`Exporté : ${experiences.length} exp V1 + ${experiences2.length} exp V2`);
    } catch (e: any) {
      toast.error("Erreur export expériences: " + e.message);
    } finally {
      setLoadingExp(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" /> Export des données
        </h1>
        <p className="text-muted-foreground mt-1">
          Exporte les tables publiques en JSON (données accessibles via RLS).
          Pour les tables protégées (users, roles…), utilise la edge function export-data.
        </p>
      </div>

      <div className="grid gap-4">
        <Button
          size="lg"
          className="justify-start gap-3 h-16 text-base"
          onClick={exportHotels}
          disabled={loadingHotels}
        >
          {loadingHotels ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Exporter Hôtels (V1 + V2 + extras + packages + tags)
        </Button>

        <Button
          size="lg"
          className="justify-start gap-3 h-16 text-base"
          onClick={exportExperiences}
          disabled={loadingExp}
        >
          {loadingExp ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Exporter Expériences (V1 + V2 + catégories + includes + reviews + addons)
        </Button>
      </div>
    </div>
  );
}
