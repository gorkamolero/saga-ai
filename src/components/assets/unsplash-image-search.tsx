import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { api } from '@/trpc/react';

export const UnsplashImageSearch = ({ assetId }: { assetId: string }) => {
  const [search, setSearch] = useState('');

  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { data: images, isLoading } = api.assets.callUnsplash.useQuery(
    {
      query: debouncedSearch,
    },
    {
      enabled: !!debouncedSearch,
    },
  );

  const { mutate: saveAsset, isLoading: isLoadingAsset } =
    api.assets.update.useMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="grid gap-4 py-4">
      <Input
        placeholder="Search images..."
        type="search"
        value={search}
        onChange={handleSearch}
      />
      <div className="grid max-h-[400px] grid-cols-3 gap-4 overflow-auto">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          images?.map((image) => {
            const handleSave = () =>
              saveAsset({
                id: assetId as string,
                url: image.urls.regular,
              });
            return (
              <div key={image.id} className="group relative">
                <img
                  alt={image.alt_description || ''}
                  className="aspect-square w-full overflow-hidden rounded-lg object-cover"
                  height={200}
                  src={image.urls.regular}
                  width={200}
                />
                <div className="p-2">
                  <p className="text-sm font-semibold">{image.description}</p>
                  <div>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={isLoadingAsset}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
