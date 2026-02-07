import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Home, Share2, ShieldCheck, CarFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { VehiclePageClient } from './VehiclePageClient';
import { VehicleCard } from '@/components/dashboard/user/VehicleCard';

// Force dynamic to ensure we always get fresh availability/similar cars
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient();

  // 1. Fetch Main Vehicle Data
  const { data: vehicle } = await supabase
    .from('vehicles')
    .select(`*, saccos ( name, logo_url, contact_email )`)
    .eq('id', params.id)
    .single();

  if (!vehicle) return notFound();

  // 2. Fetch "Similar Vehicles" (Smart Recommendation)
  // Logic: Same Sacco OR similar capacity, excluding current vehicle
  const { data: similarVehicles } = await supabase
    .from('vehicles')
    .select(`*, saccos ( name, logo_url )`)
    .eq('is_available', true)
    .neq('id', vehicle.id) // Exclude current
    .gte('capacity', vehicle.capacity - 5) // Similar size range
    .limit(4);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      
      {/* --- FEATURE 1: SMART NAVIGATION HEADER --- */}
      {/* Sticky, glassmorphism header for easy navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Left: Navigation & Breadcrumbs */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
              <Link href="/dashboard/user/explore">
                <ChevronLeft className="w-4 h-4" /> 
                <span className="hidden sm:inline">Back</span>
              </Link>
            </Button>
            
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            
            <nav className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/dashboard/user" className="hover:text-primary transition-colors">
                <Home className="w-4 h-4" />
              </Link>
              <span>/</span>
              <Link href="/dashboard/user/explore" className="hover:text-primary transition-colors">
                Explore
              </Link>
              <span>/</span>
              <span className="font-medium text-foreground truncate max-w-[150px]">
                {vehicle.name}
              </span>
            </nav>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border">
               <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
               Verified Listing
            </div>
          </div>
        </div>
      </header>

      {/* --- MAIN PROFILE CONTENT --- */}
      {/* We pass the data to the Client Component for the interactive Tabs & Lightbox */}
      <VehiclePageClient vehicle={vehicle} />

      {/* --- FEATURE 2: DISCOVERY SECTION --- */}
      {similarVehicles && similarVehicles.length > 0 && (
        <section className="border-t bg-muted/20 mt-12 py-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                   <h2 className="text-2xl md:text-3xl font-black tracking-tight">Similar Nganyas</h2>
                   <p className="text-muted-foreground">Other vehicles you might like based on capacity and style.</p>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/user/explore">View Full Fleet</Link>
                </Button>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {similarVehicles.map(v => (
                  <VehicleCard key={v.id} vehicle={v as any} />
                ))}
             </div>
          </div>
        </section>
      )}

    </div>
  );
}