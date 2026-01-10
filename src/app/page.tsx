
'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { ItemList } from '@/components/ItemList';
import { FilterControls } from '@/components/FilterControls';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PostItemDialog } from '@/components/PostItemDialog';
import { FilePenLine } from 'lucide-react';

export default function Home() {
  const firestore = useFirestore();

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'items'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: items, isLoading, error } = useCollection<Item>(itemsQuery);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-campus')!;

  return (
    <>
      <section className="relative h-[50vh] w-full">
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white p-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline">
            Reuniting what was lost.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-primary-foreground/90">
            Campus Connect is the easiest way to find your lost belongings and help others find theirs.
          </p>
          <PostItemDialog>
              <Button size="lg" className="mt-8">
                <FilePenLine className="mr-2" />
                Report an Item
              </Button>
          </PostItemDialog>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Latest Items</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto md:mx-0">
            Browse items that have been recently reported lost or found across campus.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <FilterControls />
          </aside>
          <main className="lg:col-span-3">
            {isLoading && (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
            )}
            {error && <p className="text-destructive">Error loading items: {error.message}</p>}
            {!isLoading && items && <ItemList items={items} />}
          </main>
        </div>
      </div>
    </>
  );
}
