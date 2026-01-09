// src/components/PostItemForm.tsx
"use client";

import { useState, useRef, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { categories, locations } from '@/lib/types';
import { analyzeImageAction, postItemAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { ScrollArea } from './ui/scroll-area';
import { useUser } from '@/firebase';

const itemSchema = z.object({
  name: z.string().min(3, "Item name must be at least 3 characters."),
  status: z.enum(['Lost', 'Found'], { required_error: "Please select a status."}),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description is too long."),
  location: z.string().min(1, "Please select a location."),
  date: z.string().min(1, "Please enter a date."),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function PostItemForm({ onFormSubmit }: { onFormSubmit: () => void }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedCategories, setSuggestedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      date: '',
    },
  });

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit for GenAI
      toast({
        variant: 'destructive',
        title: 'Image too large',
        description: 'Please upload an image smaller than 4MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setImagePreview(dataUri);
      setIsAnalyzing(true);
      toast({
        title: 'AI Analysis in Progress',
        description: 'Our AI is analyzing your image...',
      });

      const result = await analyzeImageAction({ photoDataUri: dataUri });
      setIsAnalyzing(false);

      if (result.success && result.data) {
        toast({
          title: 'AI Analysis Complete!',
          description: 'We\'ve filled in the description and suggested categories for you.',
        });
        form.setValue('description', result.data.description, { shouldValidate: true });
        if (result.data.suggestedCategories.length > 0) {
            setSuggestedCategories(result.data.suggestedCategories);
            // Auto-select the first suggested category if it exists in our list
            const matchedCategory = categories.find(c => result.data.suggestedCategories.includes(c));
            if (matchedCategory) {
                form.setValue('category', matchedCategory, { shouldValidate: true });
            }
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'AI Analysis Failed',
          description: result.error,
        });
      }
    };
  };
  
  const allCategories = [...new Set([...suggestedCategories, ...categories])];

  const onSubmit = async (data: ItemFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to post an item.' });
        return;
    }
    if (!imagePreview) {
        toast({ variant: 'destructive', title: 'Image required', description: 'Please upload an image of the item.' });
        return;
    }

    setIsSubmitting(true);
    const result = await postItemAction({ ...data, userId: user.uid, imageUri: imagePreview });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Item Posted!',
        description: 'Your item has been successfully listed.',
      });
      onFormSubmit();
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: result.error,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ScrollArea className="h-[60vh] pr-6">
          <div className="space-y-4">
            <div 
              className="col-span-1 md:col-span-2 aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed cursor-pointer relative"
              onClick={() => fileInputRef.current?.click()}
            >
              {(isAnalyzing || isSubmitting) && (
                <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">{isSubmitting ? 'Posting item...' : 'Analyzing image...'}</p>
                </div>
              )}
              {imagePreview ? (
                <Image src={imagePreview} alt="Item preview" layout="fill" objectFit="contain" className="rounded-lg p-1" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-12 w-12" />
                  <p className="mt-2 text-sm">Click to upload an image</p>
                  <p className="text-xs">AI analysis will start automatically</p>
                </div>
              )}
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/png, image/jpeg"
                disabled={isAnalyzing || isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Black Leather Wallet" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Lost">Lost</SelectItem>
                        <SelectItem value="Found">Found</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel className="flex items-center gap-2">Description <Sparkles className="h-4 w-4 text-primary" /></FormLabel>
                    <FormControl><Textarea placeholder="Describe the item, including any identifying features." className="min-h-[100px]" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">Category <Sparkles className="h-4 w-4 text-primary" /></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {allCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Last Known Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Date when the item was Lost or Found</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., July 25, 2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </ScrollArea>
        <Button type="submit" className="w-full" disabled={isAnalyzing || isSubmitting}>
            {(isAnalyzing || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Item
        </Button>
      </form>
    </Form>
  );
}
