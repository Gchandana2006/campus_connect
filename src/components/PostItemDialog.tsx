// src/components/PostItemDialog.tsx
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PostItemForm } from './PostItemForm';

export function PostItemDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Post a Lost or Found Item</DialogTitle>
          <DialogDescription>
            Fill in the details below. Uploading a clear image helps our AI to automatically suggest a description and category for you.
          </DialogDescription>
        </DialogHeader>
        <PostItemForm onFormSubmit={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
