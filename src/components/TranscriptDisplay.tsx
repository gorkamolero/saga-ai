import { useEffect, useRef, useState } from "react";

interface Props {
  transcript: {
    words: {
      text: string;
      start: number;
      end: number;
    }[];
  };
  src: string;
}

const adjustment = 0.1;

export const TranscriptDisplay: React.FC<Props> = ({ transcript, src }) => {
  const playerRef = useRef<HTMLAudioElement>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);

  useEffect(() => {
    const onTimeUpdate = () => {
      const currentTime = playerRef.current?.currentTime;
      if (!currentTime) return;

      const newActiveWordIndex = transcript.words.findIndex((word) => {
        // Convert start and end times to seconds before comparison
        const startInSeconds = word.start / 1000 - adjustment;
        const endInSeconds = word.end / 1000;
        return currentTime >= startInSeconds && currentTime < endInSeconds;
      });

      setActiveWordIndex(newActiveWordIndex);
    };

    const player = playerRef.current;
    player?.addEventListener("timeupdate", onTimeUpdate);

    // Return a cleanup function that checks if player is not null
    return () => {
      if (player) {
        player.removeEventListener("timeupdate", onTimeUpdate);
      }
    };
  }, [transcript.words]);

  useEffect(() => {
    console.log("activeWordIndex", activeWordIndex);
  }, [activeWordIndex]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap">
        {transcript.words.map((word, i) => (
          <span
            key={i}
            className={`word mx-1 ${
              activeWordIndex === i ? "bg-yellow-200" : ""
            }`}
          >
            {word.text}
          </span>
        ))}
      </div>
      <div>
        <audio controls src={src} ref={playerRef} className="w-full" />
      </div>
    </div>
  );
};
