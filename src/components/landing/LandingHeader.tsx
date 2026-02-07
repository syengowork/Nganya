'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle'; // Import the new Toggle

export function LandingHeader() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false); 

  // 1. Detect Scroll Position for Style Change
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isNowScrolled = latest > 50;
    if (isNowScrolled !== isScrolled) setIsScrolled(isNowScrolled);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        isScrolled 
          ? "h-16 bg-background/80 backdrop-blur-xl border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60" // Scrolled State
          : "h-20 bg-transparent border-transparent" // Hero State
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* --- LEFT: VIBE SWITCH (Theme) --- */}
        <div className="flex-1 flex justify-start">
           {/* forceWhite ensures icon is visible on Hero image when not scrolled */}
           <ThemeToggle forceWhite={!isScrolled} />
        </div>

        {/* --- CENTER: BRAND --- */}
        <div className="flex-1 flex justify-center">
           <Link href="/" className="flex items-center gap-2 group">
              <div className={cn(
                "p-1.5 rounded-lg transition-colors group-hover:scale-110 duration-300",
                isScrolled ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
              )}>
                 <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className={cn(
                "text-xl font-black tracking-tighter font-street transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}>
                NganyaOps
              </span>
           </Link>
        </div>

        {/* --- RIGHT: ACTIONS --- */}
        <div className="flex-1 flex justify-end items-center gap-2 md:gap-4">
           {/* Login (Ghost on Hero) */}
           <Button 
             variant="ghost" 
             asChild
             className={cn(
               "font-bold transition-colors hidden sm:flex",
               !isScrolled 
                 ? "text-white hover:text-white hover:bg-white/10" 
                 : "text-muted-foreground hover:text-foreground"
             )}
           >
             <Link href="/login">Login</Link>
           </Button>

           {/* Get Started (Always visible, style changes) */}
           <Button 
             asChild
             className={cn(
               "font-bold rounded-full transition-all shadow-lg hover:scale-105 active:scale-95",
               !isScrolled 
                 ? "bg-white text-black hover:bg-white/90 border-none" 
                 : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
             )}
           >
             <Link href="/dashboard/user/explore">
               <span className="hidden sm:inline">Get Started</span>
               <span className="sm:hidden">Start</span>
               <ArrowRight className="w-4 h-4 ml-2" />
             </Link>
           </Button>
        </div>

      </div>
    </motion.header>
  );
}