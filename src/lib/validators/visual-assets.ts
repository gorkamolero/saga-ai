import { z } from "zod";

export enum VISUAL_ASSETS_TYPES {
  IMAGE = "image",
  VIDEO = "video",
}

export const visualAssetsTypes = z.nativeEnum(VISUAL_ASSETS_TYPES);
