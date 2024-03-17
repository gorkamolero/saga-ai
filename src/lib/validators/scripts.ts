import { scripts } from '@/server/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { type z } from 'zod';

export const scriptSchema = createInsertSchema(scripts).partial();

export type Script = z.infer<typeof scriptSchema>;
