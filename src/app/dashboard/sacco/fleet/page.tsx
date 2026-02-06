import { createClient } from '@/utils/supabase/server';
import FleetClient from '@/components/dashboard/sacco/FleetClient'; // Import the new component
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Ensure real-time data on every refresh

export default async function FleetPage() {
  const supabase = await createClient();

  // 1. Get Current User
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // 2. Get User's Sacco ID
  // We need to know WHICH Sacco this user manages to fetch the correct cars
  const { data: sacco, error: saccoError } = await supabase
    .from('saccos')
    .select('id')
    .eq('admin_id', user.id)
    .single();

  if (saccoError || !sacco) {
    // Edge Case: User is Sacco Admin but hasn't created a Sacco Profile yet
    // You might redirect them to a "Create Sacco" onboarding page here
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">No Sacco Account Found</h2>
        <p className="text-muted-foreground">Please complete your Sacco registration to manage a fleet.</p>
      </div>
    );
  }

  // 3. Fetch Vehicles for this Sacco
  const { data: vehicles, error: vehicleError } = await supabase
    .from('vehicles')
    .select('*')
    .eq('sacco_id', sacco.id)
    .order('created_at', { ascending: false });

  if (vehicleError) {
    console.error("Error fetching fleet:", vehicleError);
    return <div>Error loading fleet data. Please try again later.</div>;
  }

  // 4. Pass data to the Interactive Client Component
  return (
    <div className="max-w-5xl mx-auto py-6">
      <FleetClient initialVehicles={vehicles || []} />
    </div>
  );
}