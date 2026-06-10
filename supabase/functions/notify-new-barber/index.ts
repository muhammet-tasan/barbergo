import { createClient } from 'npm:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type BarberRecord = {
  id?: string;
  display_name?: string | null;
  phone?: string | null;
  approval_status?: string | null;
  role?: string | null;
};

type NotifyBody = {
  record?: BarberRecord;
  barberId?: string;
  displayName?: string;
  phone?: string;
  email?: string;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Missing Supabase env' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as NotifyBody;
    const record = body.record ?? {};
    const barberId = record.id ?? body.barberId;

    if (!barberId) {
      return new Response(JSON.stringify({ error: 'barberId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, role, display_name, phone, approval_status')
      .eq('id', barberId)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (profile.role !== 'barber' || profile.approval_status !== 'pending') {
      return new Response(JSON.stringify({ skipped: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let email = body.email ?? null;
    if (!email) {
      const { data: authUser } = await admin.auth.admin.getUserById(barberId);
      email = authUser?.user?.email ?? null;
    }

    const displayName =
      profile.display_name ?? body.displayName ?? 'Neuer Barber';
    const phone = profile.phone ?? body.phone ?? null;

    const bodyParts = [displayName];
    if (phone) bodyParts.push(phone);
    if (email) bodyParts.push(email);

    const { data: tokens, error: tokenError } = await admin
      .from('admin_push_tokens')
      .select('expo_push_token');

    if (tokenError) {
      return new Response(JSON.stringify({ error: tokenError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!tokens?.length) {
      return new Response(JSON.stringify({ sent: 0, reason: 'no_admin_tokens' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pushMessages = tokens.map((row) => ({
      to: row.expo_push_token,
      title: 'Neue Barber-Registrierung',
      body: bodyParts.join(' · '),
      data: {
        path: '/admin/pending-barbers',
        barberId,
      },
      sound: 'default',
    }));

    const pushResponse = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(pushMessages),
    });

    const pushResult = await pushResponse.json();

    return new Response(
      JSON.stringify({ sent: pushMessages.length, pushResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
