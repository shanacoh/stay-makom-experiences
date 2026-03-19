import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json();
    const { action } = body;

    if (action === 'export-auth-users') {
      const allUsers: any[] = [];
      let page = 1;

      while (true) {
        const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw new Error('Failed to list users: ' + error.message);
        if (!users || users.length === 0) break;

        allUsers.push(...users.map(u => ({
          id: u.id,
          email: u.email,
          encrypted_password: (u as any).encrypted_password,
          email_confirmed_at: u.email_confirmed_at,
          raw_user_meta_data: u.user_metadata,
          raw_app_meta_data: u.app_metadata,
          created_at: u.created_at,
          updated_at: u.updated_at,
          phone: u.phone,
          confirmed_at: (u as any).confirmed_at,
          last_sign_in_at: u.last_sign_in_at,
        })));

        if (users.length < 1000) break;
        page++;
      }

      return new Response(JSON.stringify({
        success: true,
        action: 'export-auth-users',
        timestamp: new Date().toISOString(),
        count: allUsers.length,
        users: allUsers,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
