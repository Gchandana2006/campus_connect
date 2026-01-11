
// src/app/messages/page.tsx
'use client';

import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
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

  // This query is now secure. It only fetches items where the current user's
  // UID is in the `participants` array, which is controlled by security rules.
  const involvedItemsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'items'), where('participants', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  useEffect(() => {
    if (isUserLoading) {
        setIsLoading(true);
        return;
    };
    if (!user) {
      router.push('/login');
      return;
    }
    if (!involvedItemsQuery) {
        setIsLoading(false);
        setConversations([]);
        return;
    }

    setIsLoading(true);
    // Main listener for all items the user is a participant in.
    const unsubscribeItems = onSnapshot(involvedItemsQuery, (itemSnapshot) => {
        if (itemSnapshot.empty) {
            setConversations([]);
            setIsLoading(false);
            return;
        }

        const items = itemSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item));
        const newConversations: { [key: string]: Conversation } = {};
        
        // This array will hold all the unsubscribe functions for the message listeners
        const messageUnsubscribes: (() => void)[] = [];
        
        if (items.length === 0) {
            setConversations([]);
            setIsLoading(false);
            return;
        }

        let processedItems = 0;

        items.forEach((item) => {
            const messagesQuery = query(
                collection(firestore, `items/${item.id}/messages`),
                orderBy('createdAt', 'desc'),
                limit(1)
            );

            const unsubscribeMsg = onSnapshot(messagesQuery, (messageSnapshot) => {
                const lastMessage = messageSnapshot.empty ? null : { id: messageSnapshot.docs[0].id, ...messageSnapshot.docs[0].data() } as Message;
                
                newConversations[item.id] = { item, lastMessage };

                // Only update the state once all items have been processed at least once
                // or if it's an update to an existing conversation
                if (Object.keys(newConversations).length === items.length) {
                     const sortedConvs = Object.values(newConversations).sort((a, b) => {
                        const timeA = a.lastMessage?.createdAt?.toDate()?.getTime() || a.item.createdAt?.toDate()?.getTime() || 0;
                        const timeB = b.lastMessage?.createdAt?.toDate()?.getTime() || b.item.createdAt?.toDate()?.getTime() || 0;
                        return timeB - timeA;
                    });
                    setConversations(sortedConvs);
                }
            }, (error) => {
                console.error(`Error fetching last message for item ${item.id}:`, error);
                // Handle individual message fetch errors if necessary
            });

            messageUnsubscribes.push(unsubscribeMsg);
        });

        // This is a one-time operation after setting up listeners
        if (items.length > 0) {
           setIsLoading(false);
        }
        
        // Return a cleanup function that unsubscribes from all listeners
        return () => {
            messageUnsubscribes.forEach(unsub => unsub());
        };

    }, (error) => {
        console.error("Error fetching conversations: ", error);
        setIsLoading(false);
    });

    return () => {
        if (unsubscribeItems) unsubscribeItems();
    };

  }, [user, isUserLoading, firestore, router, involvedItemsQuery]);


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
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold truncate">{item.name}</p>
                                            {lastMessage?.createdAt?.toDate() ? (
                                                <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(lastMessage.createdAt.toDate(), {addSuffix: true})}
                                                </p>
                                            ) : (
                                              item.createdAt?.toDate() && (
                                                <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(item.createdAt.toDate(), {addSuffix: true})}
                                                </p>
                                              )
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
