import { createClient } from '@/utils/supabase/server';
import FleetClient from '@/components/dashboard/sacco/FleetClient';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, AlertTriangle, ShieldAlert } from 'lucide-react';

// Force dynamic to ensure we always fetch the latest fleet status
export const dynamic = 'force-dynamic';

export default async function FleetPage() {
  const supabase = await createClient();

  // 1. AUTH & PERMISSIONS CHECK
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. RESOLVE SACCO IDENTITY
  // We identify the Sacco owned by this admin
  const { data: sacco, error: saccoError } = await supabase
    .from('saccos')
    .select('id, name')
    .eq('admin_id', user.id)
    .single();

  // --- CASE A: NO SACCO ACCOUNT (Onboarding Needed) ---
  if (saccoError || !sacco) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
          <Building2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-black tracking-tight font-street">Sacco Profile Missing</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are registered as an admin, but we couldn't find a Sacco linked to your account. 
            Please complete your registration to start managing a fleet.
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
             <Link href="/dashboard/support">Contact Support</Link>
          </Button>
          <Button asChild className="font-bold shadow-lg shadow-primary/20">
             <Link href="/dashboard/sacco/onboarding">Register Sacco</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 3. FETCH FLEET DATA
  const { data: vehicles, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('sacco_id', sacco.id)
    .order('created_at', { ascending: false });

  // --- CASE B: DATABASE ERROR ---
  if (vehicleError) {
    console.error("Critical Fleet Fetch Error:", vehicleError);
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center border-2 border-destructive/20 bg-destructive/5 rounded-3xl p-12">
        <div className="p-3 bg-destructive/10 rounded-full text-destructive">
           <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-destructive">System Error</h3>
        <p className="text-muted-foreground max-w-sm">
          We encountered an issue loading your fleet data. Our engineers have been notified.
        </p>
        <Button variant="outline" onClick={async () => { 'use server'; redirect('/dashboard/sacco/fleet'); }}>
           Retry Connection
        </Button>
      </div>
    );
  }

  // --- CASE C: SUCCESS (Render Client) ---
  // We use a wider container (max-w-7xl) for better fleet management visibility
  return (
    <div className="max-w-7xl mx-auto py-8 md:py-10 px-4 md:px-8 space-y-8">
       {/* We pass the initial data to the Client Component.
          The Client Component handles all interactivity (Search, Filter, Modals).
       */}
       <FleetClient initialVehicles={vehicles || []} userId={user.id} />
    </div>
  );
}