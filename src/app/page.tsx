import { createClient } from '@/utils/supabase/server';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingIntro } from '@/components/landing/LandingIntro';

export default async function Home() {
  // 1. INTELLIGENT AUTH CHECK (Server-Side)
  // We check session here so the Header knows immediately if it should show "Dashboard" or "Login"
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/30">
      
      {/* 2. Pass the 'user' prop to the header */}
      <LandingHeader user={user} />

      <LandingHero />
      <LandingIntro />
      
    </main>
  );
}