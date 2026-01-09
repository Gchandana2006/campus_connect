import { items } from '@/lib/data';
import { ItemList } from '@/components/ItemList';
import { FilterControls } from '@/components/FilterControls';

export default function Home() {
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
          <ItemList items={items} />
        </main>
      </div>
    </div>
  );
}
