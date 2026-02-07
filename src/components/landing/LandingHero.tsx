'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingHero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Fallback Slides (High Quality Matatu Shots)
  const slides = [
    '/images/hero-1.jpg', // Replace with your actual paths
    '/images/hero-2.jpg',
    '/images/hero-3.jpg',
  ];

  // Auto-rotate slideshow only if video hasn't loaded
  useEffect(() => {
    if (videoLoaded) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [videoLoaded, slides.length]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      
      {/* --- LAYER 1: VISUALS --- */}
      <AnimatePresence mode="wait">
        {!videoLoaded && (
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            {/* Fallback Image */}
            <div className="relative w-full h-full">
               {/* Note: In production, use real images. Using a placeholder for now. */}
               <div className="absolute inset-0 bg-neutral-900" /> 
               {/* <Image src={slides[currentSlide]} alt="Hero" fill className="object-cover opacity-60" priority /> */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Video (Loads in background) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: videoLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className="h-full w-full object-cover opacity-60"
        >
          {/* Replace with your actual hosted video URL (e.g., from Vercel Blob or AWS S3) */}
          <source src="/videos/nganya-hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* --- LAYER 2: TEXTURE & GRADIENTS --- */}
      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
      {/* Scanlines (Retro/Industrial Feel) */}
      <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 z-10 pointer-events-none" />


      {/* --- LAYER 3: CONTENT --- */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6 max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white/80 text-xs uppercase tracking-widest mb-4">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             The Beat of Nairobi
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
            RIDE THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-primary animate-gradient">CULTURE.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Experience the loudest, fastest, and most artistic transport culture in the world. 
            Book your seat in a premium Nganya today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
             <Button size="lg" className="h-14 px-8 text-lg font-bold rounded-full bg-white text-black hover:bg-white/90 shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-transform hover:scale-105" asChild>
                <Link href="/dashboard/user/explore">
                  Start Exploring <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
             </Button>
             
             <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md">
                <Play className="mr-2 w-5 h-5 fill-white" /> Watch Film
             </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to Discover</span>
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </div>
  );
}