
// src/components/MessagingSheet.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare, Loader2 } from 'lucide-react';
import type { Item, Message } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp, query, orderBy, runTransaction, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';


interface MessagingSheetProps {
  item: Item;
}

export function MessagingSheet({ item }: MessagingSheetProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const isOwner = user?.uid === item.userId;
  const isParticipant = item.participants?.includes(user?.uid || '');

  const messagesQuery = useMemoFirebase(() => {
    // Only fetch messages if the user is logged in AND they are a participant (or owner)
    if (!firestore || !item?.id || !user || (!isOwner && !isParticipant)) {
        return null;
    }
    
    return query(collection(firestore, `items/${item.id}/messages`), orderBy('createdAt', 'asc'));
  }, [firestore, item.id, item.participants, user, isOwner, isParticipant]);

  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollableNode = scrollAreaRef.current.children[1] as HTMLDivElement;
        if(scrollableNode) {
            scrollableNode.scrollTop = scrollableNode.scrollHeight;
        }
    }
  }, [messages]);

  const posterName = item?.user?.name || 'the poster';

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !firestore) return;
    setIsSending(true);

    try {
        const itemRef = doc(firestore, 'items', item.id);
        const messagesColRef = collection(itemRef, 'messages');

        await runTransaction(firestore, async (transaction) => {
            const itemDoc = await transaction.get(itemRef);
            if (!itemDoc.exists()) {
                throw "Item does not exist!";
            }

            const currentItemData = itemDoc.data() as Item;

            // Create the message payload
            const newMessage = {
                senderId: user.uid,
                senderName: user.displayName || 'Campus User',
                senderAvatarUrl: user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`,
                content: message,
                createdAt: serverTimestamp(),
                isFirstMessage: false
            };

            // If this is the first message from a non-owner, set participants
            if ((!currentItemData.participants || currentItemData.participants.length === 0) && user.uid !== item.userId) {
                const participants = [item.userId, user.uid];
                transaction.update(itemRef, { participants });
                newMessage.isFirstMessage = true;
            }

            // Add the new message
            transaction.set(doc(messagesColRef), newMessage);
        });

        setMessage('');
    } catch (error: any) {
        console.error('Error sending message:', error);
        toast({
            variant: 'destructive',
            title: 'Error Sending Message',
            description: error.message || 'Could not send your message. You may not have permission.',
        });
    } finally {
        setIsSending(false);
    }
  };

  // Determine button text when user is logged out
  const getLoggedOutButtonText = () => {
    if (item.status === 'Lost') return 'Contact Owner'; // Someone lost an item, contact them
    if (item.status === 'Found') return 'Contact Finder'; // Someone found an item, contact them
    return 'View Details'; // Fallback for resolved or other statuses
  };


  // Render a login button if user is not logged in
  if (!user) {
    return (
      <Button asChild className="w-full">
          <Link href="/login">
            <MessageSquare className="mr-2 h-4 w-4" />
            Log in to {getLoggedOutButtonText()}
          </Link>
      </Button>
    );
  }
  
  // Logic for button text and state when user is logged in
  let buttonText: string = 'Contact';
  let buttonDisabled = false;

  if (item.status === 'Resolved') {
      buttonText = 'Item Resolved';
      buttonDisabled = true;
  } else if (isOwner) {
      buttonText = 'View Messages';
  } else {
      if (item.status === 'Lost') buttonText = 'Contact Owner';
      if (item.status === 'Found') buttonText = 'Contact Finder';
  }
  
  // A third person cannot join an existing conversation
  if (item.participants && item.participants.length > 0 && !isParticipant) {
      buttonText = 'Conversation in Progress';
      buttonDisabled = true;
  }


  // Render the messaging sheet for the user
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full" disabled={buttonDisabled}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {buttonText}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
          <SheetHeader>
          <SheetTitle>Chat about "{item.name}"</SheetTitle>
          <SheetDescription>
              {isOwner ? "You are viewing messages for your item." : `You are chatting with ${posterName}. Keep conversations respectful and arrange pickups in safe, public locations.`}
          </SheetDescription>
          </SheetHeader>
          <ScrollArea ref={scrollAreaRef} className="flex-grow my-4 pr-4 -mr-6">
          <div className="space-y-4">
              {isLoadingMessages && <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
              {messages?.map((msg) => (
              <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                  msg.senderId === user.uid ? 'justify-end' : 'justify-start'
                  }`}
              >
                  {msg.senderId !== user.uid && (
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderAvatarUrl} alt={msg.senderName} />
                      <AvatarFallback>{msg.senderName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  )}
                  <div
                  className={`max-w-xs rounded-lg p-3 ${
                      msg.senderId === user.uid
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                  >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 text-right ${msg.senderId === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), 'p') : 'sending...'}
                  </p>
                  </div>
                  {msg.senderId === user.uid && (
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderAvatarUrl} alt={msg.senderName}/>
                      <AvatarFallback>{msg.senderName.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  )}
              </div>
              ))}
              {!isLoadingMessages && messages?.length === 0 && (
                  <div className="text-center text-muted-foreground p-8">
                      No messages yet. {isOwner ? 'Wait for someone to contact you.' : 'Start the conversation!'}
                  </div>
              )}
          </div>
          </ScrollArea>
          <SheetFooter>
          <form
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          >
              <Input 
              id="message" 
              placeholder="Type your message..." 
              className="flex-1" 
              autoComplete="off" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending || !message.trim()}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send</span>
              </Button>
          </form>
          </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
