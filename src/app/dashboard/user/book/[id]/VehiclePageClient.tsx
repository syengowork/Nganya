'use client';

import { useState } from 'react';
import { VehicleHero } from '@/components/dashboard/user/vehicle/VehicleHero';
import { BookingWidget } from '@/components/dashboard/user/vehicle/BookingWidget';
import { ImageLightbox } from '@/components/dashboard/user/vehicle/ImageLightbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { CheckCircle2, Wifi, Music, Tv, Wind, ShieldCheck, Star } from 'lucide-react';

const featureIcons: Record<string, any> = {
  'WiFi': Wifi, 'Sound System': Music, 'TV Screens': Tv, 'AC': Wind, 'CCTV': ShieldCheck, 'VIP': Star,
};

export function VehiclePageClient({ vehicle }: { vehicle: any }) {
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  const galleryImages = [
    vehicle.image_url,
    ...(vehicle.exterior_photos || []),
    ...(vehicle.interior_photos || [])
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* 1. HERO SECTION */}
      <VehicleHero vehicle={vehicle} onViewGallery={() => setLightboxOpen(true)} />

      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 2. LEFT CONTENT (Tabs & Details) */}
          <div className="lg:col-span-2 space-y-8">
            
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-transparent p-0 border-b w-full justify-start rounded-none h-12 gap-8">
                <TabsTrigger value="about" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-base">About</TabsTrigger>
                <TabsTrigger value="amenities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-base">Amenities</TabsTrigger>
                <TabsTrigger value="gallery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 py-2 text-base">Photos</TabsTrigger>
              </TabsList>

              {/* ABOUT TAB */}
              <TabsContent value="about" className="py-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="prose max-w-none dark:prose-invert">
                  <h3 className="text-xl font-bold mb-2">The Experience</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {vehicle.description || "Experience the ultimate ride with premium sound, comfort seating, and verified safety. Perfect for group trips, events, and daily commute."}
                  </p>
                </div>

                <div className="bg-muted/30 p-6 rounded-2xl border flex items-center gap-4">
                   {vehicle.sacco && (
                     <>
                        <div className="h-14 w-14 rounded-full bg-white p-1 border shadow-sm shrink-0">
                           {vehicle.sacco.logo_url && <Image src={vehicle.sacco.logo_url} width={56} height={56} alt="logo" className="rounded-full object-cover w-full h-full" />}
                        </div>
                        <div>
                           <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Operated By</p>
                           <h4 className="text-xl font-bold">{vehicle.sacco.name}</h4>
                        </div>
                     </>
                   )}
                </div>
              </TabsContent>

              {/* AMENITIES TAB */}
              <TabsContent value="amenities" className="py-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {vehicle.features?.map((feat: string) => {
                       const Icon = featureIcons[feat] || CheckCircle2;
                       return (
                         <div key={feat} className="flex items-center gap-3 p-4 rounded-xl border bg-card/50 hover:border-primary/50 transition-colors">
                            <Icon className="w-5 h-5 text-primary" />
                            <span className="font-medium">{feat}</span>
                         </div>
                       )
                    })}
                 </div>
              </TabsContent>
              
              {/* GALLERY PREVIEW TAB */}
              <TabsContent value="gallery" className="py-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {galleryImages.map((src: string, i: number) => (
                       <div key={i} className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90" onClick={() => setLightboxOpen(true)}>
                          <Image src={src} alt="Gallery" fill className="object-cover" />
                       </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* 3. RIGHT SIDEBAR (Booking) */}
          <div className="hidden lg:block">
             <BookingWidget vehicle={vehicle} />
          </div>

        </div>
      </main>

      {/* LIGHTBOX */}
      <ImageLightbox 
         images={galleryImages} 
         isOpen={isLightboxOpen} 
         onClose={() => setLightboxOpen(false)} 
      />
    </div>
  );
}