
'use client';
import { useMemo, useRef } from 'react';
import Image from 'next/image';
import { ItemList } from '@/components/ItemList';
import { FilterControls } from '@/components/FilterControls';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2, FilePenLine, MessageSquare, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function Home() {
  const firestore = useFirestore();
  const howItWorksRef = useRef<HTMLDivElement>(null);

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'items'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: items, isLoading, error } = useCollection<Item>(itemsQuery);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-campus')!;
  const reportImage = PlaceHolderImages.find(p => p.id === 'how-it-works-report')!;
  const connectImage = PlaceHolderImages.find(p => p.id === 'how-it-works-connect')!;
  const reuniteImage = PlaceHolderImages.find(p => p.id === 'how-it-works-reunite')!;

  const handleLearnMoreClick = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

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
            University Lost & Found Portal
          </h1>
          <p className="mt-4 text-lg md:text-xl drop-shadow">
            Helping students reconnect with their lost belongings with ease
          </p>
          <Button size="lg" className="mt-8" onClick={handleLearnMoreClick}>
            Learn More
          </Button>
        </div>
      </section>

      <section ref={howItWorksRef} className="py-16 md:py-24 bg-background">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Three simple steps to reconnect with your lost items.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
                <div className="flex flex-col items-center">
                    <Image src={reportImage.imageUrl} alt={reportImage.description} data-ai-hint={reportImage.imageHint} width={128} height={128} className="w-32 h-32 object-cover rounded-full mb-6 border-4 border-background shadow-lg"/>
                    <h3 className="font-headline text-xl font-bold mb-2">Report an Item</h3>
                    <p className="text-muted-foreground">
                        Lost or found something? Fill out a simple form to upload details of the item.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <Image src={connectImage.imageUrl} alt={connectImage.description} data-ai-hint={connectImage.imageHint} width={128} height={128} className="w-32 h-32 object-cover rounded-full mb-6 border-4 border-background shadow-lg"/>
                    <h3 className="font-headline text-xl font-bold mb-2">Connect Securely</h3>
                    <p className="text-muted-foreground">
                        Filter through items and use our secure messaging to connect with the owner or finder.
                    </p>
                </div>
                <div className="flex flex-col items-center">
                    <Image src={reuniteImage.imageUrl} alt={reuniteImage.description} data-ai-hint={reuniteImage.imageHint} width={128} height={128} className="w-32 h-32 object-cover rounded-full mb-6 border-4 border-background shadow-lg"/>
                     <h3 className="font-headline text-xl font-bold mb-2">Reclaim Your Item</h3>
                    <p className="text-muted-foreground">
                        Arrange a safe handover on campus. Once returned, mark the item as resolved.
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
