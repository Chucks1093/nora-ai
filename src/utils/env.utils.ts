import { z } from "zod";

export const envSchema = z.object({
	VITE_SUPABASE_URL: z.string(),
	VITE_SUPABASE_ANON_KEY: z.string(),
});

export const env = envSchema.parse({
	VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
	VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
