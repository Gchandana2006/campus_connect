
// src/app/about/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">About Campus Connect</CardTitle>
          <CardDescription>
            Connecting your campus, one found item at a time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Campus Connect is a platform designed to help students and faculty find lost items and report items they've found. Our goal is to make reuniting people with their belongings as easy as possible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
