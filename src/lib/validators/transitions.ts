import { z } from "zod";

export enum TRANSITIONS {
  FADE = "fade",
  SLIDE_LEFT = "slideLeft",
  SLIDE_RIGHT = "slideRight",
  SLIDE_UP = "slideUp",
  SLIDE_DOWN = "slideDown",
}

export const transitions = z.nativeEnum(TRANSITIONS);
