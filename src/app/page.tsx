
'use client';
import { useMemo } from 'react';
import Image from 'next/image';
import { ItemList } from '@/components/ItemList';
import { FilterControls } from '@/components/FilterControls';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2, FilePenLine, MessageSquare, CheckCircle } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { PostItemDialog } from '@/components/PostItemDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


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
      <section className="relative h-[50vh] w-full mt-8">
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

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">How It Works</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Finding or reporting an item is just a few clicks away.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                       <Image src={reportImage.imageUrl} alt={reportImage.description} data-ai-hint={reportImage.imageHint} width={600} height={400} className="w-full h-48 object-cover"/>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <FilePenLine className="h-6 w-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">1. Report an Item</CardTitle>
                        </div>
                        <p className="text-muted-foreground">
                            Lost something? Found something? Post an item in seconds. Upload a photo and our AI will help you write a description.
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                        <Image src={connectImage.imageUrl} alt={connectImage.description} data-ai-hint={connectImage.imageHint} width={600} height={400} className="w-full h-48 object-cover"/>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">2. Connect Securely</CardTitle>
                        </div>
                        <p className="text-muted-foreground">
                            Use our secure messaging system to communicate with the owner or finder without sharing personal contact information.
                        </p>
                    </CardContent>
                </Card>
                <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                        <Image src={reuniteImage.imageUrl} alt={reuniteImage.description} data-ai-hint={reuniteImage.imageHint} width={600} height={400} className="w-full h-48 object-cover"/>
                    </CardHeader>
                    <CardContent className="p-6">
                         <div className="flex items-center gap-4 mb-4">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <CardTitle className="font-headline text-xl">3. Reunite & Resolve</CardTitle>
                        </div>
                        <p className="text-muted-foreground">
                            Arrange a safe meetup on campus. Once the item is returned, mark it as resolved to update the community.
                        </p>
                    </CardContent>
                </Card>
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
