import { z } from "zod";

export enum PREMIUM_FX {
  horizontal = "horizontal",
  vertical = "vertical",
  circle = "circle",
  perspective = "perspective",
  zoom = "zoom",
}

export const premiumFx = z.nativeEnum(PREMIUM_FX);
