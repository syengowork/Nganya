'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Share2, Heart, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleHeroProps {
  vehicle: any;
  onViewGallery: () => void;
}

export function VehicleHero({ vehicle, onViewGallery }: VehicleHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slideshow source
  const slides = vehicle.exterior_photos?.length > 0 
    ? vehicle.exterior_photos 
    : [vehicle.image_url];

  // Auto-rotate cover slideshow
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="group relative mb-8">
      
      {/* --- 1. CLEAN HERO SLIDESHOW (Visuals Only) --- */}
      <div className="relative h-[30vh] md:h-[400px] w-full overflow-hidden rounded-b-3xl md:rounded-3xl bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <Image 
              src={slides[currentSlide]} 
              alt="Vehicle Cover" 
              fill 
              className="object-cover"
              priority
            />
            {/* Subtle Gradient for depth at bottom only */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Action: View Photos */}
        <div className="absolute bottom-4 right-4 z-20">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onViewGallery}
            className="backdrop-blur-md bg-white/20 text-white hover:bg-white/30 border border-white/20 shadow-sm"
          >
            <Camera className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">View Photos</span>
            <span className="sm:hidden">Photos</span>
          </Button>
        </div>
      </div>

      {/* --- 2. PROFILE DATA SECTION (Below Banner) --- */}
      <div className="px-4 md:px-10">
        <div className="relative -mt-12 md:-mt-16 flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          
          {/* A. The Avatar (Overlaps Banner) */}
          <div className="relative shrink-0 self-start">
            <div 
              className="h-24 w-24 md:h-40 md:w-40 rounded-full border-[4px] md:border-[6px] border-background bg-muted shadow-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform"
              onClick={onViewGallery}
            >
               <Image 
                 src={vehicle.image_url} 
                 alt="Profile" 
                 fill 
                 className="object-cover" 
               />
            </div>
            
            {/* Status Indicator */}
            <div className={cn(
              "absolute bottom-1 right-1 md:bottom-3 md:right-3 w-5 h-5 md:w-7 md:h-7 border-[3px] border-background rounded-full",
              vehicle.is_available ? "bg-green-500" : "bg-orange-500"
            )} title={vehicle.is_available ? "Online" : "Offline"} />
          </div>

          {/* B. The Info (Cleanly separated on background) */}
          <div className="flex-1 pt-1 md:pb-2">
             <div className="flex flex-col md:flex-row md:justify-between gap-4">
                
                {/* Identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                      {vehicle.name}
                    </h1>
                    {vehicle.features?.includes('VIP') && (
                      <Badge className="bg-amber-400 hover:bg-amber-500 text-black border-none font-bold">VIP</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm md:text-base font-medium">
                    <span className="font-mono bg-muted/50 px-2 py-0.5 rounded text-foreground border">
                       {vehicle.plate_number}
                    </span>
                    <span className="hidden md:inline text-border">•</span>
                    <span>{vehicle.capacity} Seats</span>
                    <span className="hidden md:inline text-border">•</span>
                    <div className="flex items-center gap-1 text-foreground">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> 
                      <span className="font-bold">5.0</span>
                      <span className="text-muted-foreground font-normal ml-1 underline decoration-dotted cursor-pointer">24 Reviews</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                   <Button variant="outline" size="sm" className="gap-2 rounded-full h-10 px-4">
                     <Share2 className="w-4 h-4" /> 
                     <span className="hidden lg:inline">Share</span>
                   </Button>
                   <Button variant="outline" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors">
                     <Heart className="w-5 h-5" />
                   </Button>
                </div>

             </div>
          </div>

        </div>
      </div>
    </div>
  );
}