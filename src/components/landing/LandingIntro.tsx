'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

export function LandingIntro() {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <section className="relative py-24 bg-background overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left: The Greeting */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
               <div className="h-px w-12 bg-primary" />
               <span className="text-primary font-mono text-sm uppercase tracking-widest">The Nganya Experience</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {greeting}, <br />
              <span className="text-muted-foreground">Ready to Move?</span>
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-md">
              We don't just move people; we move the culture. Nganya Booking is the first premium platform connecting you to Nairobi's legendary Matatu art scene.
            </p>
          </motion.div>

          {/* Right: The Stats / Intro Grid */}
          <motion.div 
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="grid grid-cols-2 gap-8"
          >
             <div className="space-y-2">
                <h3 className="text-5xl font-black text-foreground">500+</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Active Vehicles</p>
                <Separator className="w-12 bg-primary/50" />
             </div>
             <div className="space-y-2">
                <h3 className="text-5xl font-black text-foreground">24/7</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Support</p>
                <Separator className="w-12 bg-primary/50" />
             </div>
             <div className="space-y-2">
                <h3 className="text-5xl font-black text-foreground">50k+</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Daily Riders</p>
                <Separator className="w-12 bg-primary/50" />
             </div>
             <div className="space-y-2">
                <h3 className="text-5xl font-black text-foreground">100%</h3>
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-bold">Safety Verified</p>
                <Separator className="w-12 bg-primary/50" />
             </div>
          </motion.div>

        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
    </section>
  );
}