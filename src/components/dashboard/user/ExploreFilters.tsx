'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ExploreFilters() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  // Smart Debounce: Only searches after user stops typing for 300ms
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`?${params.toString()}`);
  }, 200);

  const handleSort = (val: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', val);
    replace(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-0 z-30 bg-background/80 backdrop-blur-xl p-4 rounded-2xl border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name, plate, or features..." 
          className="pl-10 h-10 bg-background border-border/50"
          onChange={(e) => handleSearch(e.target.value)}
          defaultValue={searchParams.get('query')?.toString()}
        />
      </div>
      
      <div className="flex gap-2 w-full md:w-auto">
        <Select onValueChange={handleSort} defaultValue={searchParams.get('sort') || 'newest'}>
            <SelectTrigger className="w-[180px] h-10 bg-background border-border/50">
                <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest Added</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="capacity_desc">Capacity: High to Low</SelectItem>
            </SelectContent>
        </Select>
        
        {/* Placeholder for Advanced Filters Modal */}
        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
             <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}