'use client';
import React, { useContext } from 'react';
import { VisualAssetType } from '@/server/api/routers/assets';
import { cn, formatTime } from '@/lib/utils';
import { AssetSelectDialog } from './asset-select';
import { Button } from './ui/button';
import { TranscriptContext } from './player/transcript-context';
import { Edit, Image, Save, Video, Wand } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { api } from '@/trpc/react';
import { LoadingSpinner } from './ui/spinner';
import { Textarea } from './ui/textarea';

export const AssetCard = ({
  asset,
}: {
  asset: VisualAssetType;
  onSave: (asset: VisualAssetType) => Promise<any>;
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const { selectedAsset, setSelectedAsset } = useContext(TranscriptContext);
  const isSelected = selectedAsset?.id === asset.id;

  const { mutate: generate, isLoading: isLoadingGenerate } =
    api.assets.generateImage.useMutation();
  const handleGenerate = async (e: React.MouseEvent) => {
    if (!asset || !asset.id || !asset.description) return;
    await generate({ id: asset.id, description: asset.description });
  };

  const { mutate: animate, isLoading: isLoadingAnimate } =
    api.assets.animate.useMutation();
  const handleAnimate = async (e: React.MouseEvent) => {
    if (!asset || !asset.id) return;
    await animate({ id: asset.id });
  };

  const { mutate: save, isLoading: isLoadingSave } =
    api.assets.update.useMutation();
  const handleSave = async () => {
    if (!asset || !asset.id) return;
    await save({ ...asset, id: asset.id });
    setIsEditing(false);
  };

  const [description, setDescription] = React.useState(asset.description || '');

  if (!asset || !asset.id || !setSelectedAsset) {
    return null;
  }

  return (
    <div className="h-full w-full">
      <Card
        className={`text-sm group h-full rounded-lg border border-gray-200 p-4 text-left text-gray-500 shadow-sm ${isSelected ? 'shadow-lg' : ''}`}
      >
        <CardContent className="flex h-full flex-col gap-2">
          {asset.animation ? (
            <video
              src={asset.animation as string}
              className="h-full w-full rounded-lg object-cover"
              controls
            />
          ) : asset.url ? (
            <img
              src={asset.url}
              alt={asset.description || 'Visual asset'}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <div className="h-full w-full flex-grow items-center justify-center bg-gray-50">
              {' '}
            </div>
          )}
          {isEditing ? (
            <Textarea
              value={description || ''}
              onChange={(e) => {
                setSelectedAsset(asset as VisualAssetType);
                setDescription(e.target.value);
              }}
              autoResize
              className="text-sm mt-4"
            />
          ) : (
            <p className="text-sm mt-4" onClick={() => setIsEditing(true)}>
              {asset.description}
            </p>
          )}
          <div className="text-xs mt-auto flex w-full items-center justify-between text-left text-gray-500">
            {asset?.start && <span>Start: {asset.start}</span>}
            {asset?.end && <span>End: {asset.end}</span>}
          </div>

          <div
            className={cn(
              'flex justify-end gap-2 opacity-0 transition-opacity duration-200',
              `group-hover:opacity-100`,
            )}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              className="hover:scale-110 hover:bg-blue-100"
            >
              <span className="sr-only">Edit</span>
              <span className="icon">
                {isEditing ? (
                  <Save className="h-6 w-6 text-gray-500" />
                ) : (
                  <Edit className="h-6 w-6 text-gray-500" />
                )}
              </span>
            </Button>

            {!asset?.generated || description !== asset.description ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleGenerate}
                disabled={isLoadingGenerate}
                className="hover:scale-110 hover:bg-blue-100"
              >
                <span className="sr-only">Generate</span>
                <span className="icon">
                  {isLoadingGenerate ? (
                    <LoadingSpinner />
                  ) : (
                    <Wand className="h-6 w-6 text-gray-500" />
                  )}
                </span>
              </Button>
            ) : null}

            {asset?.url && !asset?.animation ? (
              <Button
                variant="outline"
                size="icon"
                onClick={handleAnimate}
                disabled={isLoadingAnimate}
                className="hover:scale-110 hover:bg-blue-100"
              >
                <span className="sr-only">Animate</span>
                <span className="icon">
                  {isLoadingAnimate ? (
                    <LoadingSpinner />
                  ) : (
                    <Video className="h-6 w-6 text-gray-500" />
                  )}
                </span>
              </Button>
            ) : null}

            <AssetSelectDialog
              trigger={
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {}}
                  className="hover:scale-110 hover:bg-blue-100"
                >
                  <span className="sr-only">Find images</span>
                  <Image className="h-6 w-6 text-gray-500" />
                </Button>
              }
              assetId={asset.id}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
