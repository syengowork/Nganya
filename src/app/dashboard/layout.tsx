import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; 
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. SECURITY: Strict Auth Check
  // We use getUser() to validate the auth token directly with the Supabase Auth server.
  // This prevents access using stale or revoked cookies.
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    // Redirect unauthenticated users to login immediately
    redirect('/login');
  }

  // 2. AUTHORIZATION: Resolve User Role
  // We fetch the profile to determine if they are a 'sacco' admin or regular 'user'.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Fail-Safe: Default to 'user' (least privilege) if profile is missing
  const userRole = profile?.role === 'sacco_admin' ? 'sacco' : 'user';

  // 3. UX: Read Persistent UI State
  // Check cookies on the server to render the sidebar correctly on first load.
  // This prevents the "layout shift" or "flicker" effect.
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get('sidebar:state')?.value === 'true';

  return (
    <DashboardLayout userRole={userRole} defaultCollapsed={defaultCollapsed}>
      {children}
    </DashboardLayout>
  );
}