import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, bucket, path } = await req.json();

    if (!imageUrl || !bucket || !path) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageUrl, bucket, path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[download-image] Downloading: ${imageUrl}`);

    // Download the image from external URL (no CORS restriction server-side)
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    console.log(`[download-image] Downloaded ${imageBlob.size} bytes, type: ${contentType}`);

    // Upload to Supabase storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, imageBlob, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`[download-image] Upload error:`, error);
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    console.log(`[download-image] Uploaded to: ${urlData.publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        publicUrl: urlData.publicUrl,
        path: data.path 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[download-image] Error:`, message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
