Deno.serve(() =>
  new Response(JSON.stringify({ error: 'Deprecated. Use Supabase Auth verifyOtp from client.' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' },
  }),
);
