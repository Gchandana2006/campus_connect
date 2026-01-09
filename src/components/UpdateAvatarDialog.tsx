// src/components/UpdateAvatarDialog.tsx
'use client';

import { useState, useRef, ChangeEvent } from 'react';
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

// Firebase Storage is not available in this environment.
// We will encode the image as a Base64 data URI and store it in the user's profile.
// To avoid "photoURL too long" errors, we'll resize the image client-side.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit for initial upload
const AVATAR_DIMENSION = 256; // Resize to 256x256 pixels

export function UpdateAvatarDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = AVATAR_DIMENSION;
          canvas.height = AVATAR_DIMENSION;
          
          // Draw the image scaled and centered
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx!.drawImage(img, x, y, img.width * scale, img.height * scale);

          // Get the resized image as a data URI
          resolve(canvas.toDataURL(file.type));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'Image too large',
        description: `Please select an image smaller than ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.`,
      });
      return;
    }

    try {
        const resizedDataUrl = await resizeImage(file);
        setImagePreview(resizedDataUrl);
    } catch (error) {
        console.error("Image resizing failed:", error);
        toast({
            variant: "destructive",
            title: "Error processing image",
            description: "Could not process the selected image. Please try another one.",
        });
        setImagePreview(null);
    }
  };

  const handleSave = async () => {
    if (!user || !imagePreview) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No user or image selected.',
      });
      return;
    }

    setIsLoading(true);
    try {
      // The imagePreview is the resized data URI
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
    if (!isOpen) {
      // Reset state when dialog closes
      setImagePreview(null);
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
            Upload a new image. It will be resized to {AVATAR_DIMENSION}x{AVATAR_DIMENSION} pixels.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <div 
              className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Avatar preview" 
                  width={128} 
                  height={128} 
                  className="rounded-full aspect-square object-cover" 
                />
              ) : (
                <Camera className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>


          <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
              </Button>
              <Button variant="outline" disabled>
                  <Camera className="mr-2 h-4 w-4" />
                  Take Photo
              </Button>
          </div>
          <Input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileSelect}
          />
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
