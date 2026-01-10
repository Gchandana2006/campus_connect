
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

export default function Home() {
  const firestore = useFirestore();

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'items'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: items, isLoading, error } = useCollection<Item>(itemsQuery);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-campus')!;
  const reportImage = PlaceHolderImages.find(p => p.id === 'how-it-works-report')!;
  const connectImage = PlaceHolderImages.find(p => p.id === 'how-it-works-connect')!;
  const reuniteImage = PlaceHolderImages.find(p => p.id === 'how-it-works-reunite')!;

  return (
    <>
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white">
        <Image
          src={heroImage.imageUrl}
          alt={heroImage.description}
          fill
          priority
          className="object-cover"
          data-ai-hint={heroImage.imageHint}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-2xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-headline drop-shadow-md">
            Lost an item? Found an item?
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow">
            We are here to help you find your lost item.
          </p>
        </div>
      </section>

      <section className="bg-background py-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold font-headline mb-2 text-primary">How It Works</h2>
          <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
            Reuniting lost items with their owners on campus is simple. Just follow these three easy steps.
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={reportImage.imageUrl}
                  alt={reportImage.description}
                  className="rounded-full object-cover border-4 border-primary/20"
                  fill
                  sizes="128px"
                  data-ai-hint={reportImage.imageHint}
                />
              </div>
              <h3 className="text-xl font-bold font-headline mb-2">1. Report an Item</h3>
              <p className="text-muted-foreground">
                Found something? Snap a photo and create a post in seconds. Our AI can even help with the description.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={connectImage.imageUrl}
                  alt={connectImage.description}
                  className="rounded-full object-cover border-4 border-primary/20"
                  fill
                  sizes="128px"
                  data-ai-hint={connectImage.imageHint}
                />
              </div>
              <h3 className="text-xl font-bold font-headline mb-2">2. Connect Securely</h3>
              <p className="text-muted-foreground">
                Use our secure, private messaging to communicate with the owner or finder to coordinate a return.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <Image
                  src={reuniteImage.imageUrl}
                  alt={reuniteImage.description}
                  className="rounded-full object-cover border-4 border-primary/20"
                  fill
                  sizes="128px"
                  data-ai-hint={reuniteImage.imageHint}
                />
              </div>
              <h3 className="text-xl font-bold font-headline mb-2">3. Reunite & Resolve</h3>
              <p className="text-muted-foreground">
                Meet up to return the item. Once the item is back with its owner, mark the post as resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
