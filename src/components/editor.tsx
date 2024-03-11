'use client';

import React, { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Plus, PlusCircle, PlayCircle, Wand } from 'lucide-react';
import { FullVideoType } from '@/app/(main)/videos/[id]/page';
import { Player } from './player';
import {
  TranscriptContext,
  TranscriptProvider,
} from './player/transcript-context';
import { TranscriptDisplay } from './transcript-display';
import { VisualAssetType } from '@/server/api/routers/assets';
import { api } from '@/trpc/react';
import { LoadingSpinner } from './ui/spinner';
import { AssetCard } from './asset-card';
import { RemotionPlayer } from './remotion-player';

const PANEL_DEFAULT_SIZES = {
  transcript: 40,
  assets: 60,
  footerHeight: '6rem',
};

export const Editor = ({ video }: { video: FullVideoType }) => {
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const hasAssets = video?.visualAssets.length > 0;

  const { mutate: generateAssets, isLoading } =
    api.assets.generateAssets.useMutation();

  const handleGenerateAssets = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!video || !video.id) throw new Error('No video id provided');

    await generateAssets({ id: video.id });
  };

  const addAsset = () => {
    // Logic to add an asset
  };

  return (
    <TranscriptProvider src={(video?.voiceover?.url as string) || ''}>
      <div className="flex h-full flex-grow flex-col border-t">
        <div
          className={`flex-grow flex-col pb-[${PANEL_DEFAULT_SIZES.footerHeight}]`}
          style={{
            height: `calc(100% - ${PANEL_DEFAULT_SIZES.footerHeight})`,
            paddingBottom: PANEL_DEFAULT_SIZES.footerHeight,
          }}
        >
          <PanelGroup direction="horizontal" autoSaveId="asset-interface">
            <Panel defaultSize={PANEL_DEFAULT_SIZES.transcript}>
              {video?.voiceover?.transcript && (
                <div className="p-8">
                  {typeof video.voiceover.transcript === 'object' &&
                    'words' in video.voiceover.transcript && (
                      <TranscriptDisplay
                        transcript={
                          video.voiceover.transcript as {
                            words: {
                              text: string;
                              start: number;
                              end: number;
                            }[];
                          }
                        }
                      />
                    )}
                </div>
              )}
            </Panel>
            <PanelResizeHandle />
            <Panel defaultSize={PANEL_DEFAULT_SIZES.assets} className="h-full">
              <div className="relative h-full border-l">
                <div className="flex h-full flex-col gap-2">
                  <div className="absolute right-0 top-0 p-4">
                    <Button
                      size="icon"
                      onClick={() => setIsVideoVisible(!isVideoVisible)}
                      variant="outline"
                    >
                      {isVideoVisible ? <PlusCircle /> : <PlayCircle />}
                    </Button>
                  </div>
                  {isVideoVisible ? (
                    <div className="flex h-full w-full items-center justify-center p-8">
                      <RemotionPlayer video={video} />
                    </div>
                  ) : (
                    <div className="grid h-full flex-grow grid-cols-3 items-stretch gap-10 gap-y-4 overflow-y-auto p-8">
                      <button
                        onClick={addAsset}
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
                        style={{ aspectRatio: 'square' }}
                        disabled={isLoading}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                          <Plus className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                        </div>
                        <span>Add Asset</span>
                      </button>

                      {hasAssets ? (
                        <AssetSelector
                          assets={video?.visualAssets}
                          selectedAssetId={video?.visualAssets[0].id as string}
                          onAssetSelect={(assetId) => {
                            // Logic to select an asset
                          }}
                        />
                      ) : (
                        <button
                          onClick={handleGenerateAssets}
                          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
                          style={{ aspectRatio: 'square' }}
                          disabled={isLoading}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-gray-200 dark:bg-gray-700">
                            {isLoading ? (
                              <LoadingSpinner />
                            ) : (
                              <Wand className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                            )}
                          </div>
                          <span>Generate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* {isVideoVisible && (
            <div className="absolute bottom-4 left-4 right-4">
              <Video src={`/api/videos/${video.id}`} />
            </div>
          )} */}
            </Panel>
          </PanelGroup>
        </div>
        <div
          className={`fixed bottom-0 left-0 right-0 flex items-center justify-center border-t`}
          style={{ height: PANEL_DEFAULT_SIZES.footerHeight }}
        >
          <Player video={video} />
          {/* Render the audio/video player */}
        </div>
      </div>
    </TranscriptProvider>
  );
};

interface AssetSelectorProps {
  assets: VisualAssetType[];
  selectedAssetId: string;
  onAssetSelect: (assetId: string) => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  selectedAssetId,
  onAssetSelect,
}) => {
  const [selectedId, setSelectedId] = useState(selectedAssetId);
  const { setIsSelectingAsset, saveAsset, setSelectedAsset } =
    useContext(TranscriptContext);

  const handleSelect = (assetId: string) => {
    setSelectedId(assetId);
    onAssetSelect(assetId);
    setIsSelectingAsset(false);
    const asset = assets.find((a) => a.id === assetId);
    if (setSelectedAsset) setSelectedAsset(asset as VisualAssetType);
  };

  if (!assets) return null;
  assets.sort((a, b) => {
    if (!a.start !== undefined || !b.start) return 0;
    return (a.start || 0) > b.start ? 1 : -1;
  });

  console.log('assets', assets);

  return (
    <>
      {assets.map((asset, i) => (
        <>
          <input
            type="radio"
            id={`asset-${asset.id}`}
            name="asset"
            value={asset.id}
            checked={selectedId === asset.id}
            onChange={() => handleSelect(asset.id as string)}
            className="absolute opacity-0"
          />
          <label
            htmlFor={`asset-${asset.id}`}
            className="flex cursor-pointer flex-col"
          >
            <AssetCard asset={asset} onSave={saveAsset} />
          </label>
        </>
      ))}
    </>
  );
};
