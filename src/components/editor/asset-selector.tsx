'use client';
import React, { useContext, useState } from 'react';
import { EditorContext } from '@/components/editor/editor-context';
import { type VisualAssetType } from '@/server/api/routers/assets';
import { AssetCard } from '@/components/editor/asset-card';
import { api } from '@/trpc/react';
import { VideoType } from '@/server/api/routers/videos';
import { Plus, Wand } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/spinner';

interface AssetSelectorProps {
  assets: VisualAssetType[];
  video: VideoType;
}
export const AssetSelector: React.FC<AssetSelectorProps> = ({
  assets,
  video,
}) => {
  const { mutate: generateAssets, isLoading } =
    api.assets.generateAssets.useMutation();
  const hasAssets = assets?.length > 0;
  const handleGenerateAssets = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!video || !video.id) throw new Error('No video id provided');

    await generateAssets({ id: video.id });
  };

  const [selectedId, setSelectedId] = useState(assets ? assets[0]?.id : '');
  const { setIsSelectingAsset, saveAsset, setSelectedAsset } =
    useContext(EditorContext);

  const handleSelect = (assetId: string) => {
    setSelectedId(assetId);
    setIsSelectingAsset(false);
    const asset = assets.find((a) => a.id === assetId);
    if (setSelectedAsset) setSelectedAsset(asset!);
  };

  if (!assets) return null;
  assets.sort((a, b) => {
    if (a.start === undefined || b.start === undefined) return 0;
    return (a.start || 0) > (b.start || 0) ? 1 : -1;
  });

  return (
    <div
      className="relative grid h-full flex-grow items-stretch gap-4 gap-y-4 overflow-y-auto p-4"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
    >
      {/* <button
        // onClick={addAsset}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
        style={{ aspectRatio: '1' }}
        disabled={isLoading}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
          <Plus className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </div>
        <span>Add Asset</span>
      </button> */}

      {hasAssets ? (
        <>
          {assets.map((asset, i) => (
            <React.Fragment key={asset.id}>
              <input
                type="radio"
                id={`asset-${asset.id}`}
                name="asset"
                value={asset.id}
                checked={selectedId === asset.id}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleSelect(e.target.value);
                }}
                className="hidden opacity-0"
              />
              <label
                htmlFor={`asset-${asset.id}`}
                className="flex cursor-pointer flex-col"
              >
                <AssetCard asset={asset} onSave={saveAsset} />
              </label>
            </React.Fragment>
          ))}
        </>
      ) : (
        <button
          onClick={handleGenerateAssets}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 p-4 shadow-sm transition-colors hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800"
          style={{ aspectRatio: '1' }}
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
  );
};
