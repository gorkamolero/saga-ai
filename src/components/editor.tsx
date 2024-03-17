'use client';

import React from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { type FullVideoType } from '@/lib/validators/videos';
import { Player } from '@/components/editor/bottom-player';
import { EditorProvider } from '@/components/editor/editor-context';
import { TranscriptDisplay } from '@/components/editor/transcript-display';
import { RemotionPlayer } from './editor/remotion-player';
import { type WordType } from '@/lib/validators/words';
import { AssetGrid } from './editor/asset-grid';

const PANEL_DEFAULT_SIZES = {
  video: 34,
  transcript: 33,
  assets: 33,
  footerHeight: '6rem',
};

export const Editor = ({ video }: { video: FullVideoType }) => {
  return (
    <EditorProvider video={video}>
      <div className="flex h-full flex-grow flex-col border-t">
        <div
          className={`flex-grow flex-col pb-[${PANEL_DEFAULT_SIZES.footerHeight}]`}
          style={{
            height: `calc(100% - ${PANEL_DEFAULT_SIZES.footerHeight})`,
            paddingBottom: PANEL_DEFAULT_SIZES.footerHeight,
          }}
        >
          <PanelGroup direction="horizontal" autoSaveId="asset-interface">
            <Panel defaultSize={PANEL_DEFAULT_SIZES.video}>
              {video && <RemotionPlayer video={video} />}
            </Panel>

            <PanelResizeHandle className="border-l" />
            <Panel
              defaultSize={PANEL_DEFAULT_SIZES.transcript}
              className="h-full"
            >
              {video?.voiceover?.transcript && (
                <TranscriptDisplay
                  words={
                    (video.voiceover.transcript as { words: WordType[] }).words
                  }
                />
              )}
            </Panel>
            <PanelResizeHandle className="border-l" />

            <Panel defaultSize={PANEL_DEFAULT_SIZES.assets} className="h-full">
              <AssetGrid assets={video?.visualAssets} />
            </Panel>
          </PanelGroup>
        </div>
        <div
          className={`fixed bottom-0 left-0 right-0 flex w-full`}
          style={{ height: PANEL_DEFAULT_SIZES.footerHeight }}
        >
          <Player />
          {/* Render the audio/video player */}
        </div>
      </div>
    </EditorProvider>
  );
};
