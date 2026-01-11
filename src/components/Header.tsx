// src/components/Header.tsx
'use client';

import Link from 'next/link';
import {
  LogOut,
  User,
  LogIn,
  Home,
  FilePenLine,
  MessageSquare,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PostItemDialog } from './PostItemDialog';
import { Logo } from './icons/Logo';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

type UserProfile = {
  avatarDataUrl?: string;
};

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/messages', label: 'My Messages', icon: MessageSquare },
  { href: '/about', label: 'About', icon: Info },
];


export default function Header() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  const handleLogout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;
  const avatarUrl = userProfile?.avatarDataUrl || user?.photoURL || (user ? `https://picsum.photos/seed/${user.uid}/100/100` : '');


  return (
    <header className="z-50 w-full bg-primary text-primary-foreground mb-8">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold font-headline">CampusConnect</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2 transition-colors hover:text-primary-foreground/80',
                pathname === link.href ? 'text-primary-foreground' : 'text-primary-foreground/60'
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <PostItemDialog>
            <button
              className={cn(
                'flex items-center gap-2 transition-colors hover:text-primary-foreground/80 text-primary-foreground/60'
              )}
            >
              <FilePenLine className="h-4 w-4" />
              Report an item
            </button>
          </PostItemDialog>
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-primary/20" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-primary-foreground/50">
                    <AvatarImage
                      src={avatarUrl}
                      alt={user.displayName || 'User'}
                    />
                    <AvatarFallback>{user.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName || 'Campus User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="secondary">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
