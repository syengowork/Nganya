'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function reviewSaccoApplication(saccoId: string, decision: 'approve' | 'reject', reason?: string) {
  const supabase = await createClient();

  // 1. Verify Super Admin Access (Security Check)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (adminProfile?.role !== 'super_admin') {
    return { error: 'Insufficient permissions' };
  }

  // 2. Fetch Sacco Details to get the Admin User ID
  const { data: sacco } = await supabase
    .from('saccos')
    .select('admin_id')
    .eq('id', saccoId)
    .single();

  if (!sacco) return { error: 'Sacco not found' };

  if (decision === 'approve') {
    // TRANSACTION: Approve Sacco AND Upgrade User Role
    const { error: saccoUpdateError } = await supabase
      .from('saccos')
      .update({ status: 'approved', rejection_reason: null })
      .eq('id', saccoId);

    if (saccoUpdateError) return { error: 'Failed to update Sacco status' };

    // Upgrade the user to 'sacco_admin'
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'sacco_admin' })
      .eq('id', sacco.admin_id);

    if (profileError) return { error: 'Failed to upgrade user role' };

  } else {
    // REJECT: Update Status & Reason
    const { error } = await supabase
      .from('saccos')
      .update({ status: 'rejected', rejection_reason: reason })
      .eq('id', saccoId);
      
    if (error) return { error: 'Failed to reject application' };
  }

  revalidatePath('/dashboard/admin/applications');
  return { success: true };
}