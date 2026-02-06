import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout'; // Your existing UI component

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Check Auth (Middleware does this too, but double-check for data access)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch User Role from Database
  // We need this because Auth User object doesn't carry the 'role' we defined in schema.sql
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Default to 'user' if profile is missing (safety fallback)
  const userRole = profile?.role === 'sacco_admin' ? 'sacco' : 'user';

  // 3. Render the UI Layout with the Correct Role
  return (
    <DashboardLayout userRole={userRole}>
      {children}
    </DashboardLayout>
  );
}