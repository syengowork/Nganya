'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CalendarClock, CreditCard } from 'lucide-react';

export function BookingWidget({ vehicle }: { vehicle: any }) {
  return (
    <div className="sticky top-24 space-y-4">
      <Card className="p-6 border-2 shadow-xl shadow-primary/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-muted-foreground font-bold uppercase tracking-wider">Rate per hour</p>
            <div className="flex items-baseline gap-1">
               <span className="text-4xl font-black text-primary">KES {vehicle.rate_per_hour.toLocaleString()}</span>
            </div>
          </div>
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 px-3 py-1">
             Available Now
          </Badge>
        </div>

        <div className="space-y-4 p-4 bg-muted/40 rounded-xl border border-border/50">
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Base Rate (1 hr)</span>
             <span className="font-mono">KES {vehicle.rate_per_hour}</span>
           </div>
           <div className="flex justify-between text-sm">
             <span className="text-muted-foreground">Service Fee</span>
             <span className="font-mono">KES 150</span>
           </div>
           <Separator />
           <div className="flex justify-between font-bold text-lg">
             <span>Total Estimate</span>
             <span>KES {(vehicle.rate_per_hour + 150).toLocaleString()}</span>
           </div>
        </div>

        <Button size="lg" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 mt-6 transition-transform hover:scale-[1.02]">
           Reserve {vehicle.name}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
           You won't be charged until the trip starts.
        </p>
      </Card>

      <div className="bg-muted/30 p-4 rounded-xl border flex items-center gap-3 text-xs text-muted-foreground">
         <ShieldCheck className="w-8 h-8 text-green-600/80" />
         <p><strong>Verified by NganyaOps.</strong> This vehicle meets all NTSA safety and comfort standards.</p>
      </div>
    </div>
  );
}