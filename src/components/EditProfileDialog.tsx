// src/components/EditProfileDialog.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters.').max(50, 'Display name is too long.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfileDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  // Reset form when dialog opens or user changes
  useState(() => {
    if (user && open) {
      form.reset({
        displayName: user.displayName || '',
      });
    }
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to edit your profile.",
        });
        return;
    }

    setIsLoading(true);
    try {
        await updateProfile(user, { displayName: data.displayName });
        toast({
            title: "Profile Updated!",
            description: "Your display name has been successfully updated.",
        });
        setOpen(false); // Close dialog on success
        router.refresh(); // Refresh the page to show the updated profile
    } catch (error: any) {
        console.error("Profile update error:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                    <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
