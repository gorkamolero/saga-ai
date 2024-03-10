import { visualAssets } from '@/server/db/schema';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export enum VISUAL_ASSETS_TYPES {
  IMAGE = 'image',
  VIDEO = 'video',
}

export const visualAssetsTypes = z.nativeEnum(VISUAL_ASSETS_TYPES);

export const visualAssetsSchema = createInsertSchema(visualAssets).partial();
export type VisualAssetType = z.infer<typeof visualAssetsSchema>;
