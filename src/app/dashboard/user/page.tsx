import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { 
  CalendarClock, 
  MapPin, 
  CreditCard, 
  Star, 
  ChevronRight, 
  CarFront, 
  History,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// --- HELPER: Time-based Greeting ---
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export default async function UserDashboard() {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch User Profile & Stats in Parallel
  const [profileReq, bookingsReq] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('bookings')
      .select('*, vehicles(name, plate_number, image_url)')
      .eq('user_id', user.id)
      .order('start_time', { ascending: false }) // Newest first
      .limit(5)
  ]);

  const profile = profileReq.data;
  const bookings = bookingsReq.data || [];

  // 3. Derived State
  const activeBooking = bookings.find(b => ['pending', 'approved'].includes(b.status));
  const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-screen">
      
      {/* --- HERO SECTION (Glass Effect) --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-background to-background border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-primary/20 text-primary mb-2">
              User Dashboard
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
              {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{profile?.full_name?.split(' ')[0] || 'Traveler'}</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-md">
              Ready for your next journey? Your fleet awaits.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-background/30 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">KES {totalSpent.toLocaleString()}</p>
            </div>
            <div className="h-10 w-px bg-border hidden sm:block" />
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Trips</p>
              <p className="text-2xl font-bold">{bookings.length}</p>
            </div>
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT COLUMN (Main Activity) --- */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Booking Card (Intelligent: Only shows if exists) */}
          {activeBooking ? (
            <div className="group relative overflow-hidden rounded-2xl border bg-card/50 backdrop-blur-sm p-6 transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-50" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Upcoming Trip
                  </h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {format(new Date(activeBooking.start_time), 'EEEE, MMMM do • h:mm a')}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 border-none">
                  {activeBooking.status}
                </Badge>
              </div>

              <div className="mt-6 flex items-center gap-4 bg-background/50 p-4 rounded-xl border border-border/50">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <CarFront className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <p className="font-bold">{(activeBooking.vehicles as any)?.name || 'Unknown Vehicle'}</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {(activeBooking.vehicles as any)?.plate_number || '---'}
                  </p>
                </div>
                <div className="ml-auto">
                  <Button size="sm" variant="outline">View Ticket</Button>
                </div>
              </div>
            </div>
          ) : (
            // Empty State / CTA
            <div className="rounded-2xl border border-dashed p-8 text-center bg-card/30 hover:bg-card/50 transition-colors">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">No active trips</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                You have no upcoming bookings. Explore our premium fleet and book your next ride today.
              </p>
              <Button size="lg" className="shadow-lg shadow-primary/20" asChild>
                <Link href="/dashboard/user/explore">Book a Ride <ChevronRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
          )}

          {/* Recent History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" /> Recent History
              </h3>
              <Link href="/dashboard/user/trips" className="text-xs text-primary hover:underline">View all</Link>
            </div>
            
            {pastBookings.length > 0 ? (
              <div className="grid gap-3">
                {pastBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 rounded-xl bg-card/30 border hover:bg-card/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <CalendarClock className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{(booking.vehicles as any)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(booking.start_time), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm">KES {booking.total_price}</p>
                      <span className={`text-[10px] uppercase font-bold ${
                        booking.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No past trips yet.</p>
            )}
          </div>

        </div>

        {/* --- RIGHT COLUMN (Stats & Quick Actions) --- */}
        <div className="space-y-6">
          
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href="/dashboard/user/explore" className="group p-4 rounded-2xl bg-gradient-to-br from-primary/80 to-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]">
              <CarFront className="w-6 h-6 mb-3 group-hover:rotate-12 transition-transform" />
              <p className="font-bold text-sm">Book New Ride</p>
              <p className="text-[10px] opacity-80">Explore fleet</p>
            </Link>

            <Link href="/dashboard/user/profile" className="p-4 rounded-2xl bg-card border hover:bg-accent/50 transition-colors">
              <CreditCard className="w-6 h-6 mb-3 text-muted-foreground" />
              <p className="font-bold text-sm">Payments</p>
              <p className="text-[10px] text-muted-foreground">Manage cards</p>
            </Link>
          </div>

          {/* Verification Status */}
          <div className="p-6 rounded-2xl bg-card/40 border backdrop-blur-sm space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-sm">Account Status</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-mono text-green-500">100%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-full rounded-full" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your account is fully verified. You have access to all premium booking features.
            </p>
          </div>

          {/* Mini Ad / Promo */}
          <div className="relative overflow-hidden rounded-2xl p-6 bg-black text-white">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            {/* You can replace this with a real image */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80')] bg-cover bg-center opacity-50" />
            
            <div className="relative z-20">
              <Star className="w-6 h-6 text-yellow-400 mb-2 fill-yellow-400" />
              <h3 className="font-bold text-lg leading-tight mb-1">Join Nganya Gold</h3>
              <p className="text-xs text-gray-300 mb-4">Get 5% off every ride and priority support.</p>
              <Button size="sm" variant="secondary" className="w-full text-xs h-8">View Plans</Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}