import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    // Create a Supabase client with the Service Role Key
    // This key is available as a Deno environment variable when deployed to Supabase Edge Functions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    let result;

    switch (action) {
      case 'listUsers':
        result = await supabaseAdmin.auth.admin.listUsers(payload.options);
        break;
      case 'signUp':
        result = await supabaseAdmin.auth.signUp(payload.credentials);
        break;
      case 'updateUserById':
        result = await supabaseAdmin.auth.admin.updateUserById(payload.userId, payload.updates);
        break;
      case 'deleteUser':
        result = await supabaseAdmin.auth.admin.deleteUser(payload.userId);
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
    }

    if (result.error) {
      console.error('Edge Function Error:', result.error);
      return new Response(JSON.stringify({ error: result.error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify(result.data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Unexpected Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});