
// src/app/item/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Item } from '@/lib/types';
import { Loader2, Calendar, MapPin, Tag, User, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessagingSheet } from '@/components/MessagingSheet';
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const itemRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'items', id);
  }, [firestore, id]);

  const { data: item, isLoading, error } = useDoc<Item>(itemRef);
  
  const handleMarkAsResolved = async () => {
    if (!itemRef) return;
    setIsUpdating(true);
    try {
      await updateDoc(itemRef, { status: 'Resolved' });
      toast({
        title: 'Item Updated!',
        description: 'The item has been marked as Resolved.',
      });
    } catch (error) {
      console.error('Error updating item status:', error);
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: itemRef.path,
          operation: 'update',
          requestResourceData: { status: 'Resolved' },
        })
      );
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'You do not have permission to perform this action or an error occurred.',
      });
    } finally {
      setIsUpdating(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline text-destructive">Error</CardTitle>
            <CardDescription>Could not load item details.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Item Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">The item you are looking for does not exist or may have been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusVariant = {
    Lost: 'destructive',
    Found: 'default',
    Resolved: 'secondary',
  }[item.status] as 'destructive' | 'default' | 'secondary';
  
  const posterName = item.user?.name || 'Campus User';
  const posterAvatarUrl = item.user?.avatarUrl || `https://picsum.photos/seed/${item.userId}/100/100`;
  const isOwner = currentUser?.uid === item.userId;


  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <div className="relative aspect-square md:aspect-auto">
            <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover rounded-lg border"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>

        <div className="flex flex-col space-y-6">
          <div>
            <Badge variant={statusVariant} className="mb-2">{item.status}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">{item.name}</h1>
            <p className="text-muted-foreground mt-4">{item.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Tag className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-semibold">{item.category}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{item.location}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-muted-foreground">Date {item.status}</p>
                    <p className="font-semibold">{item.date}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                <User className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-muted-foreground">Posted By</p>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={posterAvatarUrl} alt={posterName} />
                            <AvatarFallback>{posterName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{posterName}</p>
                    </div>
                </div>
            </div>
          </div>
          
            {isOwner && item.status !== 'Resolved' && (
            <Button onClick={handleMarkAsResolved} disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Mark as Resolved
            </Button>
          )}

          <MessagingSheet item={item} />

        </div>
      </div>
    </div>
  );
}
