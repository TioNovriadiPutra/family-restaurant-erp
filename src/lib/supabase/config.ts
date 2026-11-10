export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabaseConfig() {
  // Use literal accesses so Next.js can inline these public values for browsers.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY di .env.local, lalu restart Next.js.",
    );
  }

  return { url, publishableKey };
}
