'use client';

import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { type FullVideoType } from '@/lib/validators/videos';
import { EditorProvider } from './editor/editor-context';
import { TranscriptDisplay } from './editor/transcript-display';
import { RemotionPlayer } from './editor/remotion-player';
import { type WordType } from '@/lib/validators/words';
import { AssetGrid } from './editor/asset-grid';
import { Button } from './ui/button';

export const Editor = ({ video }: { video: FullVideoType }) => {
  const [showAssets, setShowAssets] = useState(true);
  return (
    <EditorProvider video={video}>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t">
        <div className="flex min-h-0 flex-1">
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex h-11 shrink-0 items-center justify-between border-b px-5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Preview
                </span>
                <span className="text-xs text-muted-foreground">
                  9:16 · {video.duration}s
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAssets(!showAssets)}
              >
                {showAssets ? (
                  <PanelLeftClose className="mr-2 h-4 w-4" />
                ) : (
                  <PanelLeftOpen className="mr-2 h-4 w-4" />
                )}
                Assets
              </Button>
            </div>
            <div className="min-h-0 flex-1">
              <RemotionPlayer video={video} />
            </div>
          </section>
          {showAssets && (
            <aside className="flex w-[390px] shrink-0 flex-col border-l max-md:w-[280px]">
              <div className="flex h-11 shrink-0 items-center justify-between border-b px-4">
                <span className="text-xs font-semibold uppercase tracking-widest">
                  Visual assets
                </span>
                <span className="text-xs text-muted-foreground">
                  {video.visualAssets.length} clips
                </span>
              </div>
              <div className="min-h-0 flex-1">
                <AssetGrid assets={video.visualAssets} />
              </div>
            </aside>
          )}
        </div>
        <TranscriptDisplay
          words={(video.voiceover.transcript as { words: WordType[] }).words}
        />
      </div>
    </EditorProvider>
  );
};
