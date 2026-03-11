import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_OTP_ATTEMPTS = 5;
const OTP_TTL_MINUTES = 5;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const generateOtp = (): string => Math.floor(100000 + Math.random() * 900000).toString();

const sha256 = async (value: string): Promise<string> => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = (await req.json()) as { email?: string };
    const normalizedEmail = normalizeEmail(email ?? '');

    if (!normalizedEmail) {
      return new Response(JSON.stringify({ error: 'Email is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id,email,deleted_at')
      .eq('email', normalizedEmail)
      .is('deleted_at', null)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const otp = generateOtp();
    const pepper = Deno.env.get('OTP_PEPPER') ?? 'default-pepper';
    const otpHash = await sha256(`${normalizedEmail}:${otp}:${pepper}`);
    const otpExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({ otp_hash: otpHash, otp_expires_at: otpExpiresAt, otp_retry_count: 0 })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return new Response(JSON.stringify({ otp, expiresAt: otpExpiresAt, maxAttempts: MAX_OTP_ATTEMPTS }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate OTP';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
