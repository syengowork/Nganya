'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Added DialogTitle
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ImageLightbox({ images, isOpen, onClose, initialIndex = 0 }: any) {
  const [index, setIndex] = useState(initialIndex);

  const next = () => setIndex((i: number) => (i + 1) % images.length);
  const prev = () => setIndex((i: number) => (i - 1 + images.length) % images.length);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-screen h-screen p-0 bg-black/95 border-none z-[100] flex items-center justify-center">
         
         {/* ACCESSIBILITY FIX: Hidden Title for Screen Readers */}
         <DialogTitle className="sr-only">Vehicle Image Gallery</DialogTitle>

         <div className="absolute top-4 right-4 z-50">
            <Button onClick={onClose} size="icon" variant="ghost" className="text-white hover:bg-white/20 rounded-full h-12 w-12"><X className="w-8 h-8" /></Button>
         </div>

         {/* Image Stage */}
         <div className="relative w-full h-full max-w-[95vw] max-h-[90vh]">
            <AnimatePresence mode="wait">
               <motion.div 
                 key={index}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0 }}
                 className="w-full h-full relative"
               >
                 <Image src={images[index]} alt="Fullscreen" fill className="object-contain" priority />
               </motion.div>
            </AnimatePresence>
         </div>

         {/* Controls */}
         {images.length > 1 && (
           <>
             <Button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full h-16 w-16 bg-black/50 text-white hover:bg-white/20 border-2 border-white/10"><ChevronLeft className="w-8 h-8" /></Button>
             <Button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full h-16 w-16 bg-black/50 text-white hover:bg-white/20 border-2 border-white/10"><ChevronRight className="w-8 h-8" /></Button>
             
             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white font-mono bg-black/50 px-4 py-1 rounded-full border border-white/20">
                {index + 1} / {images.length}
             </div>
           </>
         )}
      </DialogContent>
    </Dialog>
  );
}