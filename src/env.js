import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        (str) => !str.includes('YOUR_MYSQL_URL_HERE'),
        'You forgot to change the default URL',
      ),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    OPENAI_API_KEY: z.string(),
    OPENROUTER_API_KEY: z.string(),
    ASSEMBLY_AI_API_KEY: z.string(),
    UNSPLASH_ACCESS_KEY: z.string(),
    UNSPLASH_SECRET_KEY: z.string(),
    UNSPLASH_REDIRECT_URI: z.string(),
    LEMONFOX_API_KEY: z.string(),
    REMOTION_AWS_REGION: z.string(),
    REMOTION_AWS_ACCESS_KEY_ID: z.string(),
    REMOTION_AWS_SECRET_ACCESS_KEY: z.string(),
    LEIA_ID: z.string(),
    LEIA_SECRET: z.string(),
    ORIGINAL_IMAGE_URL: z.string(),
    ORIGINAL_DISPARITY_URL: z.string(),
    S3_BUCKET_REGION: z.string(),
    S3_BUCKET_NAME: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    SUPABASE_URL: z.string(),
    SUPABASE_ANON_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    ASSEMBLY_AI_API_KEY: process.env.ASSEMBLY_AI_API_KEY,
    UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
    UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY,
    UNSPLASH_REDIRECT_URI: process.env.UNSPLASH_REDIRECT_URI,
    LEMONFOX_API_KEY: process.env.LEMONFOX_API_KEY,
    REMOTION_AWS_REGION: process.env.REMOTION_AWS_REGION,
    REMOTION_AWS_ACCESS_KEY_ID: process.env.REMOTION_AWS_ACCESS_KEY_ID,
    REMOTION_AWS_SECRET_ACCESS_KEY: process.env.REMOTION_AWS_SECRET_ACCESS_KEY,
    LEIA_ID: process.env.LEIA_ID,
    LEIA_SECRET: process.env.LEIA_SECRET,
    ORIGINAL_IMAGE_URL: process.env.ORIGINAL_IMAGE_URL,
    ORIGINAL_DISPARITY_URL: process.env.ORIGINAL_DISPARITY_URL,
    S3_BUCKET_REGION: process.env.S3_BUCKET_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NOVITA_API_KEY: process.env.NOVITA_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
