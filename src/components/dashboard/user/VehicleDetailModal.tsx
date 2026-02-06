'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Wifi, Music, Tv, Wind, 
  ShieldCheck, Star, CheckCircle2, Maximize2 
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const featureIcons: Record<string, any> = {
  'WiFi': Wifi, 'Sound System': Music, 'TV Screens': Tv, 'AC': Wind, 'CCTV': ShieldCheck, 'VIP': Star,
};

interface VehicleDetailProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: any;
}

export function VehicleDetailModal({ isOpen, onClose, vehicle }: VehicleDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) setCurrentImageIndex(0);
  }, [isOpen]);

  // Safe Gallery Generation
  const gallery = vehicle ? [
    { src: vehicle.image_url, label: 'Cover' },
    ...(vehicle.exterior_photos || []).map((src: string) => ({ src, label: 'Exterior' })),
    ...(vehicle.interior_photos || []).map((src: string) => ({ src, label: 'Interior' })),
  ].filter((img: any) => img.src) : [];

  // Handlers
  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length > 0) setCurrentImageIndex(prev => (prev + 1) % gallery.length);
  }, [gallery.length]);
  
  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (gallery.length > 0) setCurrentImageIndex(prev => (prev - 1 + gallery.length) % gallery.length);
  }, [gallery.length]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') {
        if (isLightboxOpen) setIsLightboxOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLightboxOpen, nextImage, prevImage, onClose]);

  if (!vehicle) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[1600px] h-[90vh] p-0 gap-0 border-none bg-black shadow-2xl rounded-xl overflow-hidden outline-none">
          
          <DialogTitle className="sr-only">{vehicle.name} Details</DialogTitle>

          {/* =========================================================
              LAYER 0: ATMOSPHERIC BACKGROUND (Blur fills gaps)
             ========================================================= */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
             {gallery[currentImageIndex]?.src && (
               <Image 
                 src={gallery[currentImageIndex].src} 
                 alt="bg-blur" 
                 fill 
                 className="object-cover blur-[100px] scale-125"
               />
             )}
             <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* =========================================================
              LAYER 1: LAYOUT GRID (The Fix for "Blocking")
              Mobile: Flex Column (Image Top, Info Bottom)
              Desktop: Flex Row (Info Left, Image Right)
             ========================================================= */}
          <div className="relative z-10 flex flex-col md:flex-row h-full w-full">

            {/* --- SECTION A: THE HUD (Info Panel) --- 
                Mobile: Order 2 (Bottom)
                Desktop: Order 1 (Left), Fixed Width 400px
            */}
            <div className="order-2 md:order-1 w-full md:w-[400px] shrink-0 flex flex-col h-[45%] md:h-full bg-black/40 backdrop-blur-xl border-t md:border-t-0 md:border-r border-white/10 transition-all">
                
                {/* Scrollable Details */}
                <ScrollArea className="flex-1 text-white">
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                          {vehicle.sacco && (
                            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 gap-2 pl-1">
                              {vehicle.sacco.logo_url && <Image src={vehicle.sacco.logo_url} width={16} height={16} alt="sacco" className="rounded-full" />}
                              {vehicle.sacco.name}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span className="font-bold">5.0</span>
                          </div>
                      </div>
                      <h2 className="text-3xl font-black tracking-tighter leading-none mb-2">{vehicle.name}</h2>
                      <div className="flex items-center gap-2 text-white/60 font-mono text-xs">
                          <span className="bg-white/10 px-2 py-0.5 rounded border border-white/5">{vehicle.plate_number}</span>
                          <span>•</span>
                          <span>{vehicle.capacity} Seats</span>
                      </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Features */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Onboard Tech</h3>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.features.map((feat: string) => {
                          const Icon = featureIcons[feat] || CheckCircle2;
                          return (
                            <div key={feat} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                                <Icon className="w-3.5 h-3.5 text-primary" />
                                <span className="text-xs text-white/90">{feat}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">About</h3>
                      <p className="text-sm leading-relaxed text-white/70">
                        {vehicle.description || "Experience the ultimate ride. Premium sound, comfort seating, and verified safety."}
                      </p>
                    </div>
                  </div>
                </ScrollArea>

                {/* Sticky Action Footer */}
                <div className="p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent border-t border-white/5 z-20">
                   <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Rate</p>
                        <span className="text-2xl font-black text-white">KES {vehicle.rate_per_hour.toLocaleString()}</span>
                        <span className="text-xs text-white/50 ml-1">/ hr</span>
                      </div>
                   </div>
                   <Button className="w-full h-12 font-bold bg-white text-black hover:bg-white/90">
                     Book Now
                   </Button>
                </div>
            </div>

            {/* --- SECTION B: THE STAGE (Image Area) --- 
                Mobile: Order 1 (Top), Flex-1
                Desktop: Order 2 (Right), Flex-1
            */}
            <div className="order-1 md:order-2 flex-1 relative flex items-center justify-center bg-transparent h-[55%] md:h-full overflow-hidden group">
                
                {/* Close Button (Desktop) */}
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <Button onClick={() => setIsLightboxOpen(true)} size="icon" variant="secondary" className="rounded-full bg-black/40 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <DialogClose className="flex items-center justify-center h-10 w-10 rounded-full bg-black/40 hover:bg-red-500 text-white border border-white/10 backdrop-blur-md transition-colors">
                      <X className="w-5 h-5" />
                    </DialogClose>
                </div>

                {/* Main Image (Contain) */}
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentImageIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full p-4 md:p-12"
                  >
                    {gallery[currentImageIndex]?.src && (
                      <Image 
                        src={gallery[currentImageIndex].src} 
                        alt="Vehicle Hero" 
                        fill 
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-40 pointer-events-none">
                   <Button onClick={prevImage} size="icon" variant="ghost" className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/20 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
                     <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                   </Button>
                   <Button onClick={nextImage} size="icon" variant="ghost" className="pointer-events-auto h-10 w-10 md:h-12 md:w-12 rounded-full bg-black/20 hover:bg-white/20 text-white backdrop-blur-md border border-white/10">
                     <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                   </Button>
                </div>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                  <Badge variant="secondary" className="bg-black/40 text-white backdrop-blur-md border-white/10 px-3 py-1">
                    {currentImageIndex + 1} / {gallery.length}
                  </Badge>
                </div>

            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* --- LIGHTBOX (Trap Fixed) --- */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)} // Click anywhere to close
          >
            {/* Close Button (High Z-Index) */}
            <div className="absolute top-6 right-6 z-[1010]">
               <Button 
                  onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }} 
                  size="icon" 
                  className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                >
                 <X className="w-6 h-6" />
               </Button>
            </div>

            {/* Navigation (Stop Propagation) */}
            <Button 
              className="absolute left-6 top-1/2 -translate-y-1/2 z-[1010] h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

             <Button 
               className="absolute right-6 top-1/2 -translate-y-1/2 z-[1010] h-14 w-14 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10" 
               size="icon" 
               onClick={(e) => { e.stopPropagation(); nextImage(); }}
              >
              <ChevronRight className="w-8 h-8" />
            </Button>

            <div className="relative w-[95vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
               {gallery[currentImageIndex]?.src && (
                  <Image src={gallery[currentImageIndex].src} alt="Full" fill className="object-contain" />
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}