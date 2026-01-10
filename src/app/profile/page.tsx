'use client';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, User as UserIcon } from 'lucide-react';
import { EditProfileDialog } from '@/components/EditProfileDialog';
import { UpdateAvatarDialog } from '@/components/UpdateAvatarDialog';
import { doc } from 'firebase/firestore';

type UserProfile = {
    avatarDataUrl?: string;
    // other fields from your user document
}

export default function ProfilePage() {
  const { user, isUserLoading, userError } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (userError) {
    return (
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-destructive">Error</CardTitle>
                    <CardDescription>Could not load user profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{userError.message}</p>
                    <Button onClick={() => router.push('/')}>Go Home</Button>
                </CardContent>
            </Card>
      </div>
    );
  }

  const avatarUrl = userProfile?.avatarDataUrl || user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
          <CardDescription>View and manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
                <UpdateAvatarDialog>
                  <div className="relative group cursor-pointer">
                    <Avatar className="h-24 w-24">
                        <AvatarImage data-ai-hint="person portrait" src={avatarUrl} alt={user.displayName || 'User'} />
                        <AvatarFallback className="text-3xl">{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">Edit</span>
                    </div>
                  </div>
                </UpdateAvatarDialog>
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">{user.displayName || 'Campus User'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
            </div>
            <div className="grid gap-4">
                <div className="flex items-center gap-4 rounded-md border p-4">
                    <UserIcon className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Display Name</p>
                        <p className="text-muted-foreground">{user.displayName || 'Not set'}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-md border p-4">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">Email Address</p>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            </div>
            <EditProfileDialog />
        </CardContent>
      </Card>
    </div>
  );
}
