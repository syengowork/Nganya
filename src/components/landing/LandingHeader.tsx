'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, LayoutDashboard, User as UserIcon } from 'lucide-react'; // Fixed: Renamed Icon
import { cn } from '@/lib/utils';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { User } from '@supabase/supabase-js'; // Fixed: Type is now unique

interface LandingHeaderProps {
  user: User | null;
}

export function LandingHeader({ user }: LandingHeaderProps) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  // 1. SCROLL INTELLIGENCE
  useMotionValueEvent(scrollY, "change", (latest) => {
    const isNowScrolled = latest > 50;
    if (isNowScrolled !== isScrolled) setIsScrolled(isNowScrolled);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }} // Fixed: Removed unused isHidden logic
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        // Z-50 ensures it sits ABOVE the hero content
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out border-b",
        isScrolled 
          ? "h-16 bg-background/80 backdrop-blur-xl border-border/40 shadow-sm supports-[backdrop-filter]:bg-background/60" 
          : "h-20 bg-transparent border-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        
        {/* --- LEFT: THEME & BRAND --- */}
        <div className="flex-1 flex justify-start items-center gap-4">
           {/* Theme Toggle (White on Hero, Color on Scroll) */}
           <ThemeToggle forceWhite={!isScrolled} />
        </div>

        {/* --- CENTER: LOGO --- */}
        <div className="flex-1 flex justify-center">
           <Link href="/" className="flex items-center gap-2 group">
              {/*<div className={cn(
                "p-1.5 rounded-lg transition-colors group-hover:scale-110 duration-300",
                isScrolled ? "bg-primary/10 text-primary" : "bg-white/10 text-white"
              )}>
                 <Zap className="w-5 h-5 fill-current" />
              </div>*/}
              <span className={cn(
                "text-xl font-black tracking-tighter font-street transition-colors",
                isScrolled ? "text-foreground" : "text-white"
              )}>
                NganyaOps
              </span>
           </Link>
        </div>

        {/* --- RIGHT: INTELLIGENT ACTIONS --- */}
        <div className="flex-1 flex justify-end items-center gap-2 md:gap-4">
           {user ? (
             // === STATE A: LOGGED IN USER ===
             <>
                {/* 1. Dashboard Shortcut */}
                <Button 
                  asChild
                  className={cn(
                    "font-bold rounded-full transition-all shadow-lg hover:scale-105 active:scale-95 gap-2",
                    !isScrolled 
                      ? "bg-white text-black hover:bg-white/90 border-none" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                  )}
                >
                  <Link href="/dashboard/user/explore">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                </Button>
                
                {/* Optional: User Icon Link if needed */}
                 <Button variant="ghost" size="icon" asChild className={!isScrolled ? "text-white hover:bg-white/10" : ""}>
                    <Link href="/dashboard/user/profile">
                        <UserIcon className="w-5 h-5" />
                    </Link>
                 </Button>
             </>
           ) : (
             // === STATE B: GUEST ===
             <>
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

               <Button 
                 asChild
                 className={cn(
                   "font-bold rounded-full transition-all shadow-lg hover:scale-105 active:scale-95",
                   !isScrolled 
                     ? "bg-white text-black hover:bg-white/90 border-none" 
                     : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
                 )}
               >
                 <Link href="/register">
                   <span className="hidden sm:inline">Get Started</span>
                   <span className="sm:hidden">Start</span>
                   <ArrowRight className="w-4 h-4 ml-2" />
                 </Link>
               </Button>
             </>
           )}
        </div>

      </div>
    </motion.header>
  );
}