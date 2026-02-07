import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers'; // Import cookies
import DashboardLayout from '@/components/layout/DashboardLayout';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch User Role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const userRole = profile?.role === 'sacco_admin' ? 'sacco' : 'user';

  // 3. READ PERSISTENT STATE (The Magic Logic)
  // We check cookies on the server so the HTML arrives correctly formed.
  // No more flickering sidebars!
  const cookieStore = await cookies();
  const defaultCollapsed = cookieStore.get('sidebar:state')?.value === 'true';

  return (
    <DashboardLayout userRole={userRole} defaultCollapsed={defaultCollapsed}>
      {children}
    </DashboardLayout>
  );
}