import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Transcript } from "assemblyai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeFirstLetter(inputString: string) {
  const lowercaseString = inputString.toLowerCase();

  const capitalizedString =
    lowercaseString.charAt(0).toUpperCase() + lowercaseString.slice(1);

  return capitalizedString;
}

export const remapTranscript = (transcript: Transcript) => {
  return {
    audioUrl: transcript.audio_url,
    words: transcript.words?.map((w) => ({
      start: w.start,
      end: w.end,
      text: w.text,
    })),
    duration: transcript.audio_duration,
  };
};
