'use client';

import { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { Bus, Clock, Users, ShieldCheck, Activity, ChevronDown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LandingIntro() {
  const [greeting, setGreeting] = useState<string>('Welcome');
  const [time, setTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  // 1. INTELLIGENT GREETING & CLOCK ENGINE
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 2. PHYSICS ENGINE (Framer Motion)
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 } 
    },
  };

  const iconVariants: Variants = {
    rest: { rotate: 0, scale: 1 },
    hover: { 
      rotate: [0, -10, 10, 0], // Industrial "Shake"
      scale: 1.1,
      color: "var(--primary)",
      transition: { duration: 0.4 } 
    },
  };

  const stats = [
    { label: "Active Fleet", value: "500+", icon: Bus, color: "text-blue-500", desc: "Live tracked" },
    { label: "Daily Riders", value: "50k+", icon: Users, color: "text-accent", desc: "Across Nairobi" },
    { label: "Uptime", value: "99.9%", icon: Clock, color: "text-green-500", desc: time || "Monitoring..." },
    { label: "Safety Score", value: "100%", icon: ShieldCheck, color: "text-primary", desc: "Verified" },
  ];

  if (!mounted) return null;

  return (
    // FIX: Changed 'py-24' to 'pt-0 pb-24' to eliminate the white gap
    <section className="relative z-10 bg-background pt-0 pb-24 md:pb-32 overflow-hidden">
      
      {/* --- INDUSTRIAL GRID BACKGROUND --- */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #808080 1px, transparent 1px), linear-gradient(to bottom, #808080 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* --- NOISE TEXTURE --- */}
      <div className="absolute inset-0 z-0 opacity-[0.02] bg-[url('/patterns/noise.svg')] pointer-events-none" />

      {/* ================= 1. THE SYSTEM BRIDGE (Zero Gap) ================= */}
      {/* This sits immediately below the hero, bridging the gap visually */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center py-12 md:py-16">
         {/* The Gradient Beam */}
         <div className="relative w-full h-[1px] bg-border/50 max-w-6xl mx-auto overflow-hidden">
            <motion.div 
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-primary/80 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
            />
         </div>
         
         {/* The Status Dock (Floating on the line) */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="border border-border/60 px-5 py-1.5 rounded-full shadow-sm flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest backdrop-blur-md"
            >
               <Activity className="w-3 h-3 text-green-500 animate-pulse" />
               <span className="text-[10px]">System Operational</span>
            </motion.div>
         </div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* ================= 2. LEFT COLUMN: TEXT ENGINE ================= */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
               {/* Decorative Label */}
               <div className="flex items-center gap-2 text-primary/80 font-mono text-xs uppercase tracking-widest">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Nganya Intelligence v1.0</span>
               </div>

               <h2 className="text-4xl md:text-6xl font-black tracking-tighter font-street text-foreground">
                  {greeting}, <br />
                  <span className="text-muted-foreground/80">NAIROBI.</span>
               </h2>
               <Separator className="w-24 h-1.5 bg-accent/80 rounded-full" />
            </div>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg text-balance font-medium">
              Welcome to the digital heartbeat of the city. <span className="text-foreground font-bold">NganyaOps</span> bridges the chaos of the streets with the precision of code. We track, manage, and optimize the matatu ecosystem in real-time.
            </p>

            <div className="flex items-center gap-6 text-sm font-medium pt-4">
               <div className="flex -space-x-3">
                  {[1,2,3].map((i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -5, zIndex: 10 }}
                      className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground shadow-sm cursor-pointer hover:border-primary transition-colors"
                    >
                       U{i}
                    </motion.div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-black shadow-sm z-10">
                    +2k
                  </div>
               </div>
               <div className="flex flex-col">
                 <span className="font-bold text-foreground">New Operators</span>
                 <span className="text-xs text-muted-foreground">Joined this week</span>
               </div>
            </div>
          </motion.div>

          {/* ================= 3. RIGHT COLUMN: INDUSTRIAL GRID ================= */}
          <motion.div 
            className="grid grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                initial="rest"
                whileHover="hover"
                className="group relative p-6 rounded-xl bg-card border border-border/60 shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-2.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 group-hover:border-primary/20 transition-colors", stat.color)}>
                         <motion.div variants={iconVariants}>
                            <stat.icon className="w-5 h-5" />
                         </motion.div>
                      </div>
                      {stat.icon === Clock && (
                         <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-3xl md:text-4xl font-black font-street tracking-tight text-foreground">
                        {stat.value}
                      </h3>
                      <div className="flex flex-col">
                        <p className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                          {stat.label}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                          {stat.desc}
                        </p>
                      </div>
                    </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* ================= 4. FOOTER CUE ================= */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.3 }}
          transition={{ delay: 0.8 }}
          className="mt-20 flex justify-center"
        >
           <ChevronDown className="w-6 h-6 animate-bounce text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
}