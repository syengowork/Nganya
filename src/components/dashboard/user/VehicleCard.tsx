'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // IMPORT LINK
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Music, Tv, Wind, ShieldCheck, Heart, Star, Share2 } from 'lucide-react'; // ADD SHARE ICON
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // Assuming you have sonner or use alert

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

// REMOVED onClick prop - we use Link now
export function VehicleCard({ vehicle }: { vehicle: VehicleProps }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const gallery = [vehicle.image_url, ...(vehicle.exterior_photos || [])].filter(Boolean);

  // Prevent Navigation when clicking arrows
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
  };
  
  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Add Server Action for Wishlist
    toast.success("Added to Wishlist");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/dashboard/user/book/${vehicle.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <Link href={`/dashboard/user/book/${vehicle.id}`} className="block group relative space-y-3 select-none">
      
      {/* --- IMMERSIVE IMAGE CONTAINER --- */}
      <div 
        className="relative aspect-[20/19] md:aspect-square overflow-hidden rounded-xl bg-muted/20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
      >
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
        
        {/* Badges */}
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

        {/* Action Buttons (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleLike}
              className="p-2 rounded-full bg-black/20 hover:bg-white text-white hover:text-red-500 backdrop-blur-md transition-all shadow-sm"
            >
                <Heart className="w-5 h-5" />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full bg-black/20 hover:bg-white text-white hover:text-black backdrop-blur-md transition-all shadow-sm"
            >
                <Share2 className="w-5 h-5" />
            </button>
        </div>

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

      {/* --- MINIMALIST DETAILS --- */}
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-base leading-tight truncate group-hover:text-primary transition-colors">{vehicle.name}</h3>
            <div className="flex items-center gap-1 shrink-0">
                <Star className="w-3.5 h-3.5 fill-black text-black" />
                <span className="text-sm font-light">5.0</span>
            </div>
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-1">
            {vehicle.capacity} Seats • <span className="uppercase">{vehicle.plate_number}</span>
        </p>

        <div className="flex items-baseline gap-1 mt-1 pt-1">
            <span className="font-bold text-base">KES {vehicle.rate_per_hour.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground font-light">hour</span>
        </div>
      </div>
    </Link>
  );
}