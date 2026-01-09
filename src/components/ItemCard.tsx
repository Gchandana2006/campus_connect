// src/components/ItemCard.tsx
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { MessagingSheet } from './MessagingSheet';
import Link from 'next/link';

interface ItemCardProps {
  item: Item;
}

export function ItemCard({ item }: ItemCardProps) {
  const statusVariant = {
    Lost: 'destructive',
    Found: 'default',
    Resolved: 'secondary',
  }[item.status] as "destructive" | "default" | "secondary";

  const date = item.createdAt?.toDate() || new Date();
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });

  return (
    <Link href={`/item/${item.id}`} className="block h-full">
        <Card className="flex flex-col overflow-hidden h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
        <CardHeader className="p-0 relative">
            <Image
            src={item.imageUrl}
            alt={item.name}
            width={600}
            height={400}
            className="aspect-[3/2] w-full object-cover"
            data-ai-hint={item.imageHint}
            />
            <Badge variant={statusVariant} className="absolute top-2 right-2 text-white">
            {item.status}
            </Badge>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg font-headline mb-2">{item.name}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{timeAgo}</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            <MessagingSheet item={item} />
        </CardFooter>
        </Card>
    </Link>
  );
}
