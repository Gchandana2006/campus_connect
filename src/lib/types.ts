// src/lib/types.ts
import type { Timestamp } from 'firebase/firestore';

export type Item = {
    id: string;
    name: string;
    status: 'Lost' | 'Found' | 'Resolved';
    category: string;
    description: string;
    date: string; // ISO 8601 format
    location: string;
    imageUrl: string;
    imageHint: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    userId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
  };
  
  export type Message = {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl: string;
    content: string;
    createdAt: Timestamp;
  };

  export type Conversation = {
    item: Item;
    lastMessage: Message | null;
  }
  
  export const categories = [
    'Electronics',
    'Books',
    'ID Cards',
    'Accessories',
    'Clothing',
    'Bags',
    'Other',
  ];
  
  export const locations = [
    'Hostel',
    'Library',
    'Classroom',
    'Cafeteria',
    'Sports Complex',
    'Admin Building',
    'Other',
  ];
  
