import { Button } from '@/components/ui/button';
import {
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
  Dialog,
} from '@/components/ui/dialog';
import { UnsplashImageSearch } from '../assets/unsplash-image-search';

export function AssetSelectDialog({
  trigger,
  assetId,
}: {
  trigger: React.ReactNode;
  assetId: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Search open source images</DialogTitle>
          <DialogDescription>
            Search and select an image for your project.
          </DialogDescription>
        </DialogHeader>
        <UnsplashImageSearch assetId={assetId} />
      </DialogContent>
    </Dialog>
  );
}
