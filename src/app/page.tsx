'use client';
import { useMemo } from 'react';
import { ItemList } from '@/components/ItemList';
import { FilterControls } from '@/components/FilterControls';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const firestore = useFirestore();

  const itemsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'items'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: items, isLoading, error } = useCollection<Item>(itemsQuery);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Lost & Found</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto md:mx-0">
          Browse items that have been reported lost or found across campus.
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
  );
}
