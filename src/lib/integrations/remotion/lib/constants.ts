import { VERSION } from "remotion";

export const COMPOSITION_FPS = 30;
export const COMPOSITION_DURATION_IN_FRAMES = 7 * COMPOSITION_FPS;
export const COMPOSITION_WIDTH = 1080;
export const COMPOSITION_HEIGHT = 1920;
export const COMPOSITION_ID = "Tubesleuth";
export const RAM = 2048;
export const DISK = 2048;
export const TIMEOUT = 240;
export const SITE_NAME = "bravura-" + VERSION;

export type LogoAnimationProps = {
	personalizedName: string;
};
