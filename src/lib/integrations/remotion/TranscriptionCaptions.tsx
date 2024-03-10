import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import { captionStylesModern } from '../../captions';
import { convertMsToFrames, getFullInputProps } from '@/lib/utils/animations';

interface word {
  text: string;
  start: number;
  end: number;
}

type subtitlesType = word[];

const WordCaption = ({
  from,
  durationInFrames,
  word,
}: {
  from: number;
  durationInFrames: number;
  word: string;
}) => {
  const preMod = 0;
  const postMod = 0;

  const { fps } = useVideoConfig();

  const frame = useCurrentFrame();
  const localFrame = frame - from - preMod;

  const data = {
    frame: localFrame < durationInFrames ? localFrame : 0,
    fps,
    config: {
      damping: 200,
      stiffness: 500,
      mass: 0.25,
    },
  };

  const scale = spring(data);

  return (
    <Sequence
      from={from - preMod}
      durationInFrames={durationInFrames + postMod}
    >
      <div
        style={{
          ...(captionStylesModern as any),
          position: 'absolute',
          bottom: 50,
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: captionStylesModern.fontColor,
              transform: `scale(${scale})`,
            }}
          >
            {word}
          </div>
        </div>
      </div>
    </Sequence>
  );
};

export const TranscriptionCaptions = ({
  subtitles,
  fps,
}: {
  subtitles: subtitlesType;
  fps: number;
}) => {
  let subs;
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'production'
  ) {
    subs = subtitles;
  } else {
    subs = getFullInputProps().subtitles as subtitlesType;
  }
  return (
    <AbsoluteFill>
      {subs &&
        subs?.map((word: word, index: number) => {
          const from = convertMsToFrames(word.start, fps);
          let durationInFrames = convertMsToFrames(word.end, fps) - from;
          durationInFrames = Math.max(durationInFrames, 1); // Ensure duration is at least 1

          // remove commas and other punctuation signs
          const cleanWord = word.text.replace(
            /[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,
            '',
          );

          return (
            <WordCaption
              key={index}
              from={from}
              durationInFrames={Math.round(durationInFrames)}
              word={cleanWord}
            />
          );
        })}
    </AbsoluteFill>
  );
};
