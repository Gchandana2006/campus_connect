// src/components/MessagingSheet.tsx
'use client';

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
import { Send, MessageSquare } from 'lucide-react';
import type { Item } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';

interface MessagingSheetProps {
  item: Item;
}

const mockMessages = [
  { id: 1, sender: 'other', text: 'Hey, I think I found your notebook!', time: '10:30 AM' },
  { id: 2, sender: 'me', text: 'Oh, really? That\'s great! Where did you find it?', time: '10:31 AM' },
  { id: 3, sender: 'other', text: 'It was in the main library, on the second floor near the study desks.', time: '10:32 AM' },
  { id: 4, sender: 'me', text: 'Perfect, that sounds like where I left it. Can we meet somewhere so I can pick it up?', time: '10:33 AM' },
  { id: 5, sender: 'other', text: 'Sure, how about in front of the library entrance in 15 minutes?', time: '10:34 AM' },
  { id: 6, sender: 'me', text: 'Sounds good! I\'ll be there. Thank you so much!', time: '10:34 AM' },
];

export function MessagingSheet({ item }: MessagingSheetProps) {
  const buttonText = item.status === 'Lost' ? 'Contact Finder' : 'Contact Owner';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full">
          <MessageSquare className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Chat about "{item.name}"</SheetTitle>
          <SheetDescription>
            You are chatting with {item.user.name}. Keep conversations respectful and arrange pickups in safe, public locations.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow my-4 pr-4 -mr-6">
          <div className="space-y-4">
            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'me' ? 'justify-end' : ''
                }`}
              >
                {msg.sender === 'other' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={item.user.avatarUrl} />
                    <AvatarFallback>{item.user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-xs rounded-lg p-3 ${
                    msg.sender === 'me'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>
          <div className="flex w-full items-center space-x-2">
            <Input id="message" placeholder="Type your message..." className="flex-1" autoComplete="off" />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
