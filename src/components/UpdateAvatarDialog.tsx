// src/components/UpdateAvatarDialog.tsx
'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { useUser } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for initial upload

export function UpdateAvatarDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newAvatarSeed, setNewAvatarSeed] = useState('');
  
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // When the dialog opens, generate a new random seed for the placeholder.
    // This gives the user a new, predictable avatar to choose.
    if (open) {
      const seed = Math.random().toString(36).substring(7);
      setNewAvatarSeed(seed);
      // Set the preview to the image that will be used if they save.
      setImagePreview(`https://picsum.photos/seed/${seed}/128/128`);
    }
  }, [open]);


  const handleSave = async () => {
    if (!user || !imagePreview) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No new image has been selected.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use the valid picsum.photos URL for the profile update. This URL is a
      // public HTTPS URL, which is what updateProfile expects.
      await updateProfile(user, { photoURL: imagePreview });

      toast({
        title: 'Profile Picture Updated!',
        description: 'Your new avatar has been saved.',
      });
      router.refresh();
      setOpen(false);
    } catch (error: any) {
      console.error('Avatar update error:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile picture.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    // Reset state when dialog is closed
    if (!isOpen) {
      setImagePreview(null);
      setNewAvatarSeed('');
    }
    setOpen(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogDescription>
            Generate a new random avatar for your profile.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div 
              className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed relative"
            >
              {isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
              )}
              {!isLoading && (imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Avatar preview" 
                  width={128} 
                  height={128} 
                  className="rounded-full aspect-square object-cover" 
                />
              ) : (
                <Camera className="h-10 w-10 text-muted-foreground" />
              ))}
            </div>
          </div>

          <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => {
                  const seed = Math.random().toString(36).substring(7);
                  setNewAvatarSeed(seed);
                  setImagePreview(`https://picsum.photos/seed/${seed}/128/128`);
                }} 
                disabled={isLoading}
              >
                  Generate New Avatar
              </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!imagePreview || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
