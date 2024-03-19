import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { HeaderSkeleton } from '@/components/ui/header-skeleton';
import { api } from '@/trpc/server';
import { unstable_noStore as noStore } from 'next/cache';

async function getIdeas() {
  noStore();
  const ideas = await api.ideas.getAll.query();
  return ideas;
}

export default async function IdeasPage() {
  const ideas = await getIdeas();

  return (
    <div className="h-full overflow-auto">
      <BentoGrid className="mx-auto max-w-4xl">
        {ideas.map((idea, i) => (
          <BentoGridItem
            key={idea.id}
            title={idea.title}
            description={idea.description}
            header={<HeaderSkeleton />}
            className={i === 3 || i === 6 ? 'md:col-span-2' : ''}
          />
        ))}
      </BentoGrid>
    </div>
  );
}
