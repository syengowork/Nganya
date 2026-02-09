'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleCard } from '@/components/dashboard/user/VehicleCard';
import { CarFront, X, ArrowRight, Users, Gauge, Zap } from 'lucide-react';
import { ExploreFilters } from '@/components/dashboard/user/ExploreFilters';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- 1. STRICT TYPE DEFINITION ---
export interface Vehicle {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  rate_per_hour: number;
  description: string;
  features: string[];
  image_url: string; // FIXED: Made required to match VehicleCard props
  cover_photo_url?: string;
  sacco_id: string;
  is_available: boolean;
}

interface ExploreClientProps {
  vehicles: Vehicle[]; 
  searchQuery: string;
}

export function ExploreClient({ vehicles, searchQuery }: ExploreClientProps) {
  const router = useRouter();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const handleBookNow = (id: string) => {
    router.push(`/dashboard/user/book/${id}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ExploreFilters />

      {vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => setSelectedVehicle(vehicle)}
            >
              {/* FIX: Explicitly ensure image_url is a string to satisfy strict TS checks */}
              <VehicleCard vehicle={{ ...vehicle, image_url: vehicle.image_url || '' }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border/50 rounded-3xl bg-muted/5">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                <CarFront className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No vehicles found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2 text-balance">
                We couldn&apos;t find any vehicles matching &quot;{searchQuery}&quot;. Try adjusting your filters.
            </p>
        </div>
      )}

      {/* --- QUICK VIEW MODAL --- */}
      <Dialog open={!!selectedVehicle} onOpenChange={(open) => !open && setSelectedVehicle(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl gap-0">
          
          {selectedVehicle && (
            <div className="flex flex-col md:flex-row h-full max-h-[80vh] md:max-h-[600px]">
              
              {/* Left: Image Side */}
              <div className="relative w-full md:w-2/5 h-64 md:h-auto bg-black">
                <Image 
                  src={selectedVehicle.image_url || selectedVehicle.cover_photo_url || '/placeholder-vehicle.jpg'} 
                  alt={selectedVehicle.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-black font-street tracking-wide">{selectedVehicle.name}</h3>
                  <p className="text-xs font-mono opacity-80">{selectedVehicle.plate_number}</p>
                </div>
                <DialogClose className="absolute top-4 right-4 md:hidden bg-black/50 p-2 rounded-full text-white">
                  <X className="w-4 h-4" />
                </DialogClose>
              </div>

              {/* Right: Details Side */}
              <div className="flex-1 flex flex-col p-6">
                 <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold">Vehicle Details</h4>
                      <p className="text-sm text-muted-foreground">Premium Nganya Experience</p>
                    </div>
                    <Badge variant={selectedVehicle.is_available ? "default" : "destructive"}>
                      {selectedVehicle.is_available ? "Available" : "Booked"}
                    </Badge>
                 </div>

                 <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedVehicle.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center gap-3">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                               <p className="text-xs text-muted-foreground font-bold uppercase">Capacity</p>
                               <p className="font-bold">{selectedVehicle.capacity} Seats</p>
                            </div>
                         </div>
                         <div className="p-3 rounded-xl bg-muted/20 border border-border flex items-center gap-3">
                            <Gauge className="w-5 h-5 text-primary" />
                            <div>
                               <p className="text-xs text-muted-foreground font-bold uppercase">Rate</p>
                               <p className="font-bold">KES {selectedVehicle.rate_per_hour}/hr</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-3">
                         <h5 className="text-sm font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" /> Onboard Features
                         </h5>
                         <div className="flex flex-wrap gap-2">
                            {selectedVehicle.features.map((feat) => (
                               <Badge key={feat} variant="secondary" className="px-3 py-1 bg-muted text-muted-foreground">
                                  {feat}
                               </Badge>
                            ))}
                         </div>
                      </div>
                    </div>
                 </ScrollArea>

                 <div className="mt-6 pt-4 border-t flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setSelectedVehicle(null)}>
                      Close
                    </Button>
                    <Button 
                      className="rounded-full font-bold px-6" 
                      onClick={() => handleBookNow(selectedVehicle.id)}
                      disabled={!selectedVehicle.is_available}
                    >
                      Book Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}