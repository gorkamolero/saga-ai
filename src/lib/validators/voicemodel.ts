import { z } from "zod";

export enum VOICEMODELS {
  ONYX = "onyx",
  NOVA = "nova",
  SHIMMER = "shimmer",
  ECHO = "echo",
  FABLE = "fable",
  ALLOY = "alloy",
}

export const voicemodel = z.nativeEnum(VOICEMODELS);
