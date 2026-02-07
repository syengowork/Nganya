import { LandingHeader } from '@/components/landing/LandingHeader'; // Import the new header
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingIntro } from '@/components/landing/LandingIntro';

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-primary/30">
      
      {/* 1. The Smart Header (Fixed on top) */}
      <LandingHeader />

      {/* 2. The Content */}
      <LandingHero />
      <LandingIntro />
      
    </main>
  );
}