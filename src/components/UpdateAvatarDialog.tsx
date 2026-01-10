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
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, setDoc } from 'firebase/firestore';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function UpdateAvatarDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageToSave, setImageToSave] = useState<string | null>(null);
  
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user && open) {
      const currentAvatar = user.photoURL || `https://picsum.photos/seed/${user.uid}/128/128`;
      setImagePreview(currentAvatar);
      setImageToSave(null);
    }
  }, [user, open]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: `Please select an image smaller than ${MAX_FILE_SIZE / 1024 / 1024}MB.`
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setImagePreview(dataUri);
      setImageToSave(dataUri);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSave = async () => {
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to do this.' });
      return;
    }
    
    if (!imageToSave) {
        toast({
            title: 'No Changes',
            description: 'No new avatar was selected to save.',
        });
        setOpen(false);
        return;
    }

    setIsLoading(true);
    try {
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, { avatarDataUrl: imageToSave }, { merge: true });

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
  
  const handleTakePhoto = () => {
    const seed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://picsum.photos/seed/${seed}/256/256`;
    setImagePreview(newAvatarUrl);
    setImageToSave(newAvatarUrl);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setImagePreview(null);
      setImageToSave(null);
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
            Upload a file or generate a new avatar. The new image will be shown below.
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
          
          <Input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTakePhoto}
                disabled={isLoading}
              >
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
              </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!imageToSave || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
