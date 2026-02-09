'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function LandingHero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    '/nganya1.jpg',
    '/nganya2.jpg', 
  ];

  useEffect(() => {
    if (!videoError) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [videoError, slides.length]);

  const handleScrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    // FIX 1: Changed 'h-screen' to 'min-h-[100dvh]' so it grows if content is tall
    // FIX 2: Added 'py-20' instead of just padding-top to keep content balanced
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      
      {/* ================= LAYER 1: MEDIA ================= */}
      <div className="absolute inset-0 z-0 select-none">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/60 to-transparent z-20 pointer-events-none" />

        <AnimatePresence mode="wait">
          {!videoError ? (
            <motion.div
              key="video-player"
              initial={{ opacity: 0 }}
              animate={{ opacity: videoLoaded ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full fixed inset-0" // Fixed to cover full screen even if section grows
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                onLoadedData={() => setVideoLoaded(true)}
                onError={() => setVideoError(true)}
                poster="/nganya1.jpg"
                className="w-full h-full object-cover scale-105"
              >
                <source src="/videos/nganya-hero.mp4" type="video/mp4" />
              </video>
            </motion.div>
          ) : (
            <motion.div
              key="slideshow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image 
                src={slides[currentSlide]}
                alt="Nganya Culture"
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ================= LAYER 2: CONTENT ================= */}
      <div className="relative z-30 container mx-auto px-4 h-full flex flex-col justify-center">
        
        {/* FIX 3: Balanced Padding (pt-32 pb-16) ensures buttons aren't pushed off screen */}
        {/* On mobile, we reduce top padding (pt-24) to save space */}
        <div className="pt-24 pb-16 md:pt-32 md:pb-12 max-w-5xl mx-auto text-center space-y-6 md:space-y-8">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/90 text-sm font-bold backdrop-blur-md mb-6 md:mb-8 shadow-2xl ring-1 ring-white/5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                </span>
                <span className="tracking-wide text-xs md:text-sm">LIVE IN NAIROBI</span>
             </div>

             <h1 className="text-4xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter font-street leading-[0.95] mb-4 md:mb-6 drop-shadow-2xl">
                THE OS FOR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-accent animate-gradient-x">
                  MATATU CULTURE
                </span>
             </h1>
             
             <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium text-balance px-4">
                Manage fleets, track revenue, and streamline bookings with the only intelligent platform built for the Chaos and the Art.
             </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 md:pt-4 pb-8" // Added pb-8 buffer
          >
            <Button 
              size="lg" 
              className="w-full sm:w-auto rounded-full font-bold h-12 md:h-14 px-8 text-base md:text-lg bg-white text-black hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              asChild
            >
              <Link href="/register">
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto rounded-full font-bold h-12 md:h-14 px-8 text-base md:text-lg border-white/20 bg-black/40 text-white hover:bg-white/10 backdrop-blur-md transition-all hover:border-white/40"
            >
              <Play className="mr-2 w-5 h-5 fill-white" /> Watch Film
            </Button>
          </motion.div>
        </div>

      </div>

      {/* ================= LAYER 3: SCROLL BUTTON ================= */}
      <motion.div 
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-white/50 cursor-pointer hover:text-white transition-colors group"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        onClick={handleScrollDown}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold group-hover:tracking-[0.3em] transition-all">Scroll</span>
        <ChevronDown className="w-5 h-5 opacity-70 group-hover:opacity-100" />
      </motion.div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('/patterns/noise.svg')]" />
    </section>
  );
}