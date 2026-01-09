// src/lib/types.ts
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
  };
  
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
  