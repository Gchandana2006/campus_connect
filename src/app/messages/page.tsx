
// src/app/messages/page.tsx
'use client';

import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, collectionGroup } from 'firebase/firestore';
import type { Item, Conversation, Message } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function MessagesPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchConversations = async () => {
      if (!firestore || !user) return;
      setIsLoading(true);

      // 1. Get all items owned by the user
      const ownedItemsQuery = query(collection(firestore, 'items'), where('userId', '==', user.uid));
      const ownedItemsSnap = await getDocs(ownedItemsQuery);
      const itemIds = new Set(ownedItemsSnap.docs.map(doc => doc.id));

      // 2. Get all message threads the user has participated in
      const messagesGroupQuery = query(collectionGroup(firestore, 'messages'), where('senderId', '==', user.uid));
      const userMessagesSnap = await getDocs(messagesGroupQuery);
      userMessagesSnap.forEach(msgDoc => {
        // The item ID is the parent document's ID
        const itemId = msgDoc.ref.parent.parent?.id;
        if (itemId) {
          itemIds.add(itemId);
        }
      });
      
      const uniqueItemIds = Array.from(itemIds);
      if (uniqueItemIds.length === 0) {
        setIsLoading(false);
        return;
      }
      
      // 3. For each unique item ID, fetch item data and last message
      const unsubscribes = uniqueItemIds.map(itemId => {
        const itemQuery = query(collection(firestore, 'items'), where('__name__', '==', itemId));

        return onSnapshot(itemQuery, async (itemSnapshot) => {
          if (itemSnapshot.empty) return;
          const itemDoc = itemSnapshot.docs[0];
          const itemData = { id: itemDoc.id, ...itemDoc.data() } as Item;

          const messagesQuery = query(collection(firestore, `items/${itemId}/messages`), orderBy('createdAt', 'desc'), limit(1));
          
          return onSnapshot(messagesQuery, (messageSnapshot) => {
             const lastMessage = messageSnapshot.empty ? null : { id: messageSnapshot.docs[0].id, ...messageSnapshot.docs[0].data() } as Message;

             setConversations(prev => {
                const existingIndex = prev.findIndex(c => c.item.id === itemId);
                const newConversation = { item: itemData, lastMessage };

                let newConversations;
                if (existingIndex > -1) {
                    newConversations = [...prev];
                    newConversations[existingIndex] = newConversation;
                } else {
                    newConversations = [...prev, newConversation];
                }
                // Sort by last message date
                return newConversations.sort((a, b) => 
                    (b.lastMessage?.createdAt?.toDate()?.getTime() || 0) - (a.lastMessage?.createdAt?.toDate()?.getTime() || 0)
                );
             });
             setIsLoading(false);
          });
        });
      });

      return () => unsubscribes.forEach(unsub => unsub());
    };

    const unsubscribePromise = fetchConversations();

    return () => {
      unsubscribePromise.then(unsub => {
        if (unsub) unsub();
      });
    };
  }, [user, isUserLoading, firestore, router]);


  if (isLoading || isUserLoading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (conversations.length === 0) {
      return (
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
            <Card className="w-full max-w-2xl text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="mt-4 text-2xl font-headline">No Messages Yet</CardTitle>
                <CardDescription>
                When you start a conversation about an item, it will appear here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Find an item on the homepage to start a chat with the owner or finder.
                </p>
            </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
        <h1 className="text-3xl font-bold font-headline mb-6">My Messages</h1>
        <Card>
            <CardContent className="p-0">
                <ul className="divide-y">
                    {conversations.map(({item, lastMessage}) => (
                        <li key={item.id}>
                            <Link href={`/item/${item.id}`} className="block hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4 p-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={item.imageUrl} alt={item.name} />
                                        <AvatarFallback>
                                            {item.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold">{item.name}</p>
                                            {lastMessage?.createdAt && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(lastMessage.createdAt.toDate(), {addSuffix: true})}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                            {lastMessage ? `${lastMessage.senderId === user?.uid ? 'You: ' : ''}${lastMessage.content}` : 'No messages yet.'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    </div>
  );
}
