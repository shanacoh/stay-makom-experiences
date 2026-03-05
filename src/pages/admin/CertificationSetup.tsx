import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, ExternalLink, Loader2, ShieldCheck } from "lucide-react";

export default function CertificationSetup() {
  const [propertyId, setPropertyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ hotelId: string; experienceId: string } | null>(null);

  const handleSetup = async () => {
    const pid = propertyId.trim();
    if (!pid) {
      toast.error("Please enter a HyperGuest Property ID");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Find or create hotel
      let hotelId: string;

      const { data: existingHotel } = await supabase
        .from("hotels2")
        .select("id, name")
        .eq("hyperguest_property_id", pid)
        .maybeSingle();

      if (existingHotel) {
        hotelId = existingHotel.id;
        toast.info(`Reusing existing hotel: ${existingHotel.name}`);
      } else {
        const slug = `hg-cert-${pid}`;
        const { data: newHotel, error: hotelErr } = await supabase
          .from("hotels2")
          .insert({
            name: "HyperGuest Certification Hotel",
            name_he: "מלון אישור HyperGuest",
            slug,
            region: "Israel",
            status: "published" as const,
            hyperguest_property_id: pid,
            hero_image: "/placeholder.svg",
          })
          .select("id")
          .single();

        if (hotelErr) throw hotelErr;
        hotelId = newHotel.id;
        toast.success("Hotel created");
      }

      // Step 2: Find or create experience
      let experienceId: string;
      const expSlug = "certification-test-live";

      const { data: existingExp } = await supabase
        .from("experiences2")
        .select("id")
        .eq("slug", expSlug)
        .maybeSingle();

      if (existingExp) {
        experienceId = existingExp.id;
        // Update hotel_id to point to current hotel
        const { error: updateErr } = await supabase
          .from("experiences2")
          .update({ hotel_id: hotelId, status: "published" as const })
          .eq("id", experienceId);
        if (updateErr) throw updateErr;
        toast.info("Experience updated to point to hotel");
      } else {
        const { data: newExp, error: expErr } = await supabase
          .from("experiences2")
          .insert({
            title: "Certification Test Experience",
            title_he: "חוויית בדיקת אישור",
            slug: expSlug,
            hotel_id: hotelId,
            base_price: 100,
            currency: "USD",
            min_nights: 1,
            max_nights: 7,
            min_party: 1,
            max_party: 4,
            status: "published" as const,
            long_copy: "Test experience for HyperGuest live certification. ⚠️ CERTIFICATION CONSTRAINTS: Guest name 'Test Test', fully refundable only, check-in Sept 2026+, max $500 USD, cancel within 7 days.",
          })
          .select("id")
          .single();

        if (expErr) throw expErr;
        experienceId = newExp.id;
        toast.success("Experience created");
      }

      // Step 3: Ensure junction record
      const { data: existingJunction } = await supabase
        .from("experience2_hotels")
        .select("id")
        .eq("experience_id", experienceId)
        .eq("hotel_id", hotelId)
        .maybeSingle();

      if (!existingJunction) {
        // Remove old junctions for this experience
        await supabase
          .from("experience2_hotels")
          .delete()
          .eq("experience_id", experienceId);

        const { error: junctionErr } = await supabase
          .from("experience2_hotels")
          .insert({
            experience_id: experienceId,
            hotel_id: hotelId,
            position: 1,
            notes: "Certification test hotel – see constraints in admin",
          });
        if (junctionErr) throw junctionErr;
      }

      setResult({ hotelId, experienceId });
      toast.success("Certification setup complete!");
    } catch (err: any) {
      console.error(err);
      toast.error(`Setup failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Live Certification Setup</h1>
        <p className="text-muted-foreground">Create or update the test hotel + experience for HyperGuest live certification</p>
      </div>

      {/* Certification constraints reminder */}
      <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-base">
            <AlertTriangle className="h-5 w-5" />
            Certification Constraints (from Reshma)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5 text-sm">
            <li className="flex items-center gap-2"><Badge variant="outline" className="font-mono">Guest</Badge> First: "Test", Last: "Test"</li>
            <li className="flex items-center gap-2"><Badge variant="outline" className="font-mono">Rate</Badge> Fully refundable only</li>
            <li className="flex items-center gap-2"><Badge variant="outline" className="font-mono">Check-in</Badge> September 2026+ (6+ months in future)</li>
            <li className="flex items-center gap-2"><Badge variant="outline" className="font-mono">Amount</Badge> Max $500 USD</li>
            <li className="flex items-center gap-2"><Badge variant="outline" className="font-mono">Cancel</Badge> Within 7 days after booking</li>
          </ul>
        </CardContent>
      </Card>

      {/* Setup form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5" />
            Property Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">HyperGuest Property ID</label>
              <Input
                placeholder="e.g. 53633"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
              />
            </div>
            <Button onClick={handleSetup} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create / Update
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            If a hotel with this property ID already exists, it will be reused. The experience slug will always be <code className="bg-muted px-1 rounded">certification-test-live</code>.
          </p>
        </CardContent>
      </Card>

      {/* Result / quick links */}
      {result && (
        <Card className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base">
              <CheckCircle className="h-5 w-5" />
              Setup Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/experience2/certification-test-live" target="_blank">
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  View Experience Page
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/hotels2/edit/${result.hotelId}`}>
                  Edit Hotel
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/experiences2/edit/${result.experienceId}`}>
                  Edit Experience
                </Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Hotel ID: <code className="bg-muted px-1 rounded">{result.hotelId}</code> · Experience ID: <code className="bg-muted px-1 rounded">{result.experienceId}</code>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
