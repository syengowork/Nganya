'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Zap, ArrowRight } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function LandingHeader() {
  const { setTheme, theme } = useTheme();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 1. Detect Scroll Position for Style Change
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isNowScrolled = latest > 50;
    if (isNowScrolled !== isScrolled) setIsScrolled(isNowScrolled);

    // Optional: Hide on scroll down, show on scroll up (Smart Hide)
    // if (latest > lastScrollY && latest > 100) setIsHidden(true);
    // else setIsHidden(false);
    
    setLastScrollY(latest);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: isHidden ? -100 : 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b border-transparent",
        isScrolled 
          ? "h-16 bg-background/80 backdrop-blur-xl border-border/40 shadow-sm" // Scrolled State
          : "h-20 bg-transparent" // Hero State
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* --- LEFT: VIBE SWITCH (Theme) --- */}
        <div className="flex-1 flex justify-start">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
             className={cn(
               "rounded-full transition-colors",
               !isScrolled && "text-white hover:bg-white/10 hover:text-white"
             )}
           >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
           </Button>
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
               "font-bold rounded-full transition-all shadow-lg",
               !isScrolled 
                 ? "bg-white text-black hover:bg-white/90 border-none" 
                 : "bg-primary text-primary-foreground hover:bg-primary/90"
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