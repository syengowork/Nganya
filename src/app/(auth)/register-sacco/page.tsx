import { SaccoRegisterForm } from '@/components/auth/SaccoRegisterForm';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

// Force dynamic rendering so we always get the latest status
export const dynamic = 'force-dynamic';

export default async function SaccoRegisterPage() {
  const supabase = await createClient();

  // 1. Get Current Session
  const { data: { user } } = await supabase.auth.getUser();

  let existingApplication = null;

  if (user) {
    // 2. If logged in, check for existing Sacco Application
    const { data: sacco } = await supabase
      .from('saccos')
      .select('status, rejection_reason, name')
      .eq('admin_id', user.id)
      .single();

    if (sacco) {
      existingApplication = sacco;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter mb-2">
          PARTNER WITH <span className="text-primary">NGANYAOPS</span>
        </h1>
        <p className="text-muted-foreground">
          Digitize your fleet. Manage bookings. Grow your revenue.
        </p>
      </div>
      
      {/* 3. Pass Server Data to Client Component */}
      <SaccoRegisterForm existingApplication={existingApplication} />
      
      {!existingApplication && (
        <p className="mt-8 text-sm text-muted-foreground">
          Looking for a passenger account?{' '}
          <Link href="/register" className="underline hover:text-primary">
            Sign up here
          </Link>
        </p>
      )}
    </div>
  );
}