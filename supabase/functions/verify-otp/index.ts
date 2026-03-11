import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SignJWT } from 'https://esm.sh/jose@5.9.6';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

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
    const { email, otp } = (await req.json()) as { email?: string; otp?: string };
    const normalizedEmail = normalizeEmail(email ?? '');
    const submittedOtp = (otp ?? '').trim();

    if (!normalizedEmail || !submittedOtp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id,name,email,role,otp_hash,otp_expires_at,otp_retry_count,deleted_at')
      .eq('email', normalizedEmail)
      .is('deleted_at', null)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not authorized' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (typeof user.otp_retry_count === 'number' && user.otp_retry_count >= MAX_OTP_ATTEMPTS) {
      return new Response(JSON.stringify({ error: 'Retry limit exceeded. Generate a new OTP.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const expiresAt = user.otp_expires_at ? new Date(user.otp_expires_at) : null;
    const hasExpired = !expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now();

    if (!user.otp_hash || hasExpired) {
      return new Response(JSON.stringify({ error: 'OTP expired. Generate a new OTP.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pepper = Deno.env.get('OTP_PEPPER') ?? 'default-pepper';
    const expectedHash = await sha256(`${normalizedEmail}:${submittedOtp}:${pepper}`);

    if (expectedHash !== user.otp_hash) {
      const { error: retryError } = await supabase
        .from('users')
        .update({ otp_retry_count: (user.otp_retry_count ?? 0) + 1 })
        .eq('id', user.id);

      if (retryError) {
        throw retryError;
      }

      return new Response(JSON.stringify({ error: 'Invalid OTP' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: clearOtpError } = await supabase
      .from('users')
      .update({ otp_hash: null, otp_expires_at: null, otp_retry_count: 0 })
      .eq('id', user.id);

    if (clearOtpError) {
      throw clearOtpError;
    }

    const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET') ?? '';
    const token = await new SignJWT({
      email: normalizedEmail,
      role: user.role,
      aud: 'authenticated',
    })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuer('ecms-native-app')
      .setSubject(user.id)
      .setIssuedAt()
      .setExpirationTime('8h')
      .sign(new TextEncoder().encode(jwtSecret));

    return new Response(
      JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: normalizedEmail,
          role: user.role,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify OTP';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
