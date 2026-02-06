'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Music, Tv, Wind, ShieldCheck, Heart, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon Map
const featureIcons: Record<string, any> = {
  'WiFi': Wifi, 'Sound System': Music, 'TV Screens': Tv, 'AC': Wind, 'CCTV': ShieldCheck, 'VIP': Star,
};

interface VehicleProps {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  rate_per_hour: number;
  image_url: string;
  exterior_photos?: string[];
  features: string[];
  is_available: boolean;
  sacco?: { name: string; logo_url: string };
}

interface VehicleCardProps {
  vehicle: VehicleProps;
  onClick?: () => void;
}

export function VehicleCard({ vehicle, onClick }: VehicleCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Gallery Logic
  const gallery = [vehicle.image_url, ...(vehicle.exterior_photos || [])].filter(Boolean);

  // Stop propagation for swiper arrows so we don't trigger the modal
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Add like logic here later
  };

  return (
    <div 
      className="group relative cursor-pointer space-y-3 select-none"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
    >
      {/* --- 1. IMMERSIVE IMAGE CONTAINER (Airbnb Style) --- */}
      <div className="relative aspect-[20/19] md:aspect-square overflow-hidden rounded-xl bg-muted/20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <Image
              src={gallery[currentImageIndex]}
              alt={vehicle.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Overlays */}
        <div className="absolute top-3 left-3 z-10 flex gap-2">
            {!vehicle.is_available && (
                <Badge variant="destructive" className="backdrop-blur-md shadow-sm">Booked</Badge>
            )}
            {vehicle.features.includes('VIP') && (
                <Badge className="bg-white/90 text-black border-none backdrop-blur-md shadow-sm flex gap-1 font-bold">
                    <Star className="w-3 h-3 fill-black" /> VIP
                </Badge>
            )}
        </div>

        <button 
          onClick={handleLike}
          className="absolute top-3 right-3 z-10 p-2 rounded-full text-white/70 hover:scale-110 hover:text-white transition-all active:scale-95"
        >
            <Heart className="w-6 h-6 fill-black/20 stroke-white drop-shadow-md" />
        </button>

        {/* Hover Navigation (Stealth Mode) */}
        {gallery.length > 1 && isHovered && (
            <>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 z-20">
                   <button onClick={prevImage} className="p-1 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-all text-black"><div className="w-4 h-4 border-l-2 border-b-2 border-black rotate-45 ml-1" /></button>
                   <button onClick={nextImage} className="p-1 rounded-full bg-white/90 shadow-sm hover:scale-110 transition-all text-black"><div className="w-4 h-4 border-r-2 border-t-2 border-black rotate-45 mr-1" /></button>
                </div>
                <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center gap-1.5">
                    {gallery.map((_, idx) => (
                        <div key={idx} className={cn("w-1.5 h-1.5 rounded-full transition-all shadow-sm", idx === currentImageIndex ? "bg-white scale-110" : "bg-white/50")} />
                    ))}
                </div>
            </>
        )}
      </div>

      {/* --- 2. MINIMALIST DETAILS (No Border) --- */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-base leading-tight truncate">{vehicle.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span className="text-sm font-light">4.9</span>
            </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-1">
            {vehicle.features.slice(0, 3).join(' • ')}
        </p>

        <p className="text-muted-foreground text-sm line-clamp-1">
            {vehicle.capacity} Seats • <span className="uppercase">{vehicle.plate_number}</span>
        </p>

        <div className="flex items-baseline gap-1 mt-1 pt-1">
            <span className="font-bold text-base">KES {vehicle.rate_per_hour.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-light">hour</span>
        </div>
      </div>
    </div>
  );
}