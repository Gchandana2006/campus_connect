
// src/app/messages/page.tsx
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import type { Item, Conversation } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquare, User } from 'lucide-react';
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
      setIsLoading(true);
      if (!firestore || !user) {
        setIsLoading(false);
        return;
      };

      try {
        // Get items where the user is the owner
        const ownedItemsQuery = query(collection(firestore, 'items'), where('userId', '==', user.uid));
        const ownedItemsSnapshot = await getDocs(ownedItemsQuery);
        const ownedItemIds = ownedItemsSnapshot.docs.map(doc => doc.id);

        // Get items where the user has sent a message
        const messagesQuery = query(collection(firestore, 'items'));
        const allItemsSnapshot = await getDocs(messagesQuery);
        const messagedItemIds: string[] = [];

        for (const itemDoc of allItemsSnapshot.docs) {
            const messagesColRef = collection(firestore, `items/${itemDoc.id}/messages`);
            const userMessageQuery = query(messagesColRef, where('senderId', '==', user.uid), limit(1));
            const userMessageSnapshot = await getDocs(userMessageQuery);
            if (!userMessageSnapshot.empty) {
                messagedItemIds.push(itemDoc.id);
            }
        }
        
        const allInvolvedItemIds = [...new Set([...ownedItemIds, ...messagedItemIds])];

        const convs: Conversation[] = [];
        const unsubscribes = allInvolvedItemIds.map(itemId => {
          const itemDoc = allItemsSnapshot.docs.find(doc => doc.id === itemId);
          if (itemDoc) {
            const itemData = { ...itemDoc.data(), id: itemDoc.id } as Item;
            
            const lastMessageQuery = query(collection(firestore, `items/${itemId}/messages`), orderBy('createdAt', 'desc'), limit(1));
            
            const unsubscribe = onSnapshot(lastMessageQuery, (messageSnapshot) => {
              const lastMessage = messageSnapshot.empty ? null : { ...messageSnapshot.docs[0].data(), id: messageSnapshot.docs[0].id } as Conversation['lastMessage'];

              setConversations(prevConvs => {
                const existingConvIndex = prevConvs.findIndex(c => c.item.id === itemId);
                const newConv = { item: itemData, lastMessage };
                if (existingConvIndex > -1) {
                  const updatedConvs = [...prevConvs];
                  updatedConvs[existingConvIndex] = newConv;
                  return updatedConvs.sort((a,b) => (b.lastMessage?.createdAt?.toDate()?.getTime() || 0) - (a.lastMessage?.createdAt?.toDate()?.getTime() || 0));
                } else {
                  const updatedConvs = [...prevConvs, newConv];
                  return updatedConvs.sort((a,b) => (b.lastMessage?.createdAt?.toDate()?.getTime() || 0) - (a.lastMessage?.createdAt?.toDate()?.getTime() || 0));
                }
              });
            });
            return unsubscribe;
          }
          return () => {};
        });

        setIsLoading(false);
        
        return () => unsubscribes.forEach(unsub => unsub());

      } catch (error) {
        console.error("Error fetching conversations:", error);
        setIsLoading(false);
      }
    };

    const unsubscribe = fetchConversations();

    return () => {
        if (typeof unsubscribe === 'function') {
            unsubscribe();
        }
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
