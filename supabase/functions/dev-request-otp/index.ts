const JSON_HEADERS = { 'Content-Type': 'application/json' };

type OtpPayload = {
  email?: unknown;
};

const getOtpFromResponse = (payload: Record<string, unknown>): string | null => {
  const directCandidates = ['otp', 'token', 'code'];

  for (const candidate of directCandidates) {
    const value = payload[candidate];
    if (typeof value === 'string' && /^\d{6}$/.test(value.trim())) {
      return value.trim();
    }
  }

  const nested = payload.data;
  if (nested && typeof nested === 'object') {
    for (const candidate of directCandidates) {
      const value = (nested as Record<string, unknown>)[candidate];
      if (typeof value === 'string' && /^\d{6}$/.test(value.trim())) {
        return value.trim();
      }
    }
  }

  const textCandidates = ['message', 'msg', 'error_description'];
  for (const candidate of textCandidates) {
    const value = payload[candidate];
    if (typeof value === 'string') {
      const match = value.match(/\b(\d{6})\b/);
      if (match) {
        return match[1];
      }
    }
  }

  return null;
};

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed.' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  if ((Deno.env.get('NODE_ENV') ?? '').toLowerCase() === 'production') {
    return new Response(JSON.stringify({ success: false, error: 'Dev OTP endpoint is disabled in production.' }), {
      status: 403,
      headers: JSON_HEADERS,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ success: false, error: 'Server OTP configuration is missing.' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  let payload: OtpPayload;
  try {
    payload = (await request.json()) as OtpPayload;
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email) {
    return new Response(JSON.stringify({ success: false, error: 'Email is required.' }), {
      status: 400,
      headers: JSON_HEADERS,
    });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({
      email,
      create_user: true,
    }),
  });

  const responseJson = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const message =
      (typeof responseJson.msg === 'string' && responseJson.msg) ||
      (typeof responseJson.error_description === 'string' && responseJson.error_description) ||
      'Unable to request OTP.';

    return new Response(JSON.stringify({ success: false, error: message }), {
      status: response.status,
      headers: JSON_HEADERS,
    });
  }

  const otp = getOtpFromResponse(responseJson);
  if (!otp) {
    return new Response(JSON.stringify({ success: false, error: 'OTP was not returned by Supabase.' }), {
      status: 502,
      headers: JSON_HEADERS,
    });
  }

  return new Response(JSON.stringify({ success: true, otp }), {
    status: 200,
    headers: JSON_HEADERS,
  });
});
