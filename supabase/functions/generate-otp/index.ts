Deno.serve(() =>
  new Response(JSON.stringify({ error: 'Deprecated. Use Supabase Auth signInWithOtp from client.' }), {
    status: 410,
    headers: { 'Content-Type': 'application/json' },
  }),
);
