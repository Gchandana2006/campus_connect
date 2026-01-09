// src/components/FilterControls.tsx
"use client";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { categories, locations } from '@/lib/types';
import { Search, SlidersHorizontal, RotateCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function FilterControls() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <SlidersHorizontal className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by keyword..." className="pl-10" />
        </div>
        
        <Select>
          <SelectTrigger><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="found">Found</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger><SelectValue placeholder="Filter by category" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Categories</SelectLabel>
              {categories.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger><SelectValue placeholder="Filter by location" /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Locations</SelectLabel>
              {locations.map(l => <SelectItem key={l} value={l.toLowerCase()}>{l}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        
        <div className="flex flex-col sm:flex-row gap-2">
            <Button className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>
            <Button variant="ghost" className="w-full">
                <RotateCw className="mr-2 h-4 w-4" />
                Reset
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
