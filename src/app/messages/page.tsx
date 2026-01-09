// src/app/messages/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">My Messages</CardTitle>
          <CardDescription>
            This is where conversations about your lost and found items will appear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            When you contact someone about an item, or someone contacts you, the chat will be accessible here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
