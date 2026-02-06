'use server';

import { createClient } from '@/utils/supabase/server'; 
import { scanImageForSafety } from '@/lib/safety';
import { revalidatePath } from 'next/cache';

// Shared Type Definition
export type ActionState = {
  status: 'success' | 'error';
  message: string;
} | null;

// --- 1. CREATE VEHICLE ---
export async function createVehicleAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { status: 'error', message: 'Unauthorized. Please log in.' };

  const name = formData.get('name') as string;
  const plate_number = formData.get('plate_number') as string;
  const capacity = Number(formData.get('capacity'));
  const rate_per_hour = Number(formData.get('rate_per_hour'));
  const description = formData.get('description') as string;
  
  let features: string[] = [];
  try {
    features = JSON.parse(formData.get('features') as string || '[]');
  } catch (e) { features = []; }
  
  const coverFile = formData.get('cover_photo') as File;
  const extFiles = formData.getAll('exterior_photos') as File[];
  const intFiles = formData.getAll('interior_photos') as File[];
  
  // AI Safety Check
  try {
    const allFiles = [coverFile, ...extFiles, ...intFiles].filter(f => f && f.size > 0);
    if (allFiles.length > 0) {
      const safetyResults = await Promise.all(allFiles.map(file => scanImageForSafety(file)));
      if (safetyResults.some(isSafe => !isSafe)) {
        return { status: 'error', message: 'Creation Rejected: One or more images contain explicit content.' };
      }
    }
  } catch (e) { console.warn("Safety check skipped", e); }

  try {
    const coverUrl = await uploadFile(supabase, user.id, coverFile, 'covers');
    const extUrls = await uploadMultipleFiles(supabase, user.id, extFiles, 'exterior');
    const intUrls = await uploadMultipleFiles(supabase, user.id, intFiles, 'interior');

    const saccoId = await getSaccoId(supabase, user.id);
    if (!saccoId) return { status: 'error', message: 'Sacco account not found.' };

    const { error: dbError } = await supabase.from('vehicles').insert({
      sacco_id: saccoId,
      name,
      plate_number,
      capacity,
      rate_per_hour,
      description,
      features,
      image_url: coverUrl || '', // Maps to the correct DB column
      exterior_photos: extUrls,
      interior_photos: intUrls,
      is_available: true
    });

    if (dbError) {
      if (dbError.code === '23505') return { status: 'error', message: 'Plate Number already exists.' };
      throw dbError;
    }

  } catch (error: any) {
    console.error("Creation Error:", error);
    return { status: 'error', message: error.message || 'Failed to create vehicle' };
  }

  revalidatePath('/dashboard/sacco/fleet');
  return { status: 'success', message: 'Vehicle created successfully!' };
}

// --- 2. UPDATE VEHICLE ---
export async function updateVehicleAction(vehicleId: string, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Unauthorized' };

  const name = formData.get('name') as string;
  const plate_number = formData.get('plate_number') as string;
  const capacity = Number(formData.get('capacity'));
  const rate_per_hour = Number(formData.get('rate_per_hour'));
  const description = formData.get('description') as string;
  const features = JSON.parse(formData.get('features') as string || '[]');
  
  const keptExterior = JSON.parse(formData.get('kept_exterior_photos') as string || '[]');
  const keptInterior = JSON.parse(formData.get('kept_interior_photos') as string || '[]');
  
  const coverFile = formData.get('cover_photo') as File;
  const extFiles = formData.getAll('new_exterior_photos') as File[];
  const intFiles = formData.getAll('new_interior_photos') as File[];

  try {
    let coverUrl = undefined;
    if (coverFile && coverFile.size > 0) {
      coverUrl = await uploadFile(supabase, user.id, coverFile, 'covers');
    }

    const newExtUrls = await uploadMultipleFiles(supabase, user.id, extFiles, 'exterior');
    const newIntUrls = await uploadMultipleFiles(supabase, user.id, intFiles, 'interior');

    const finalExterior = [...keptExterior, ...newExtUrls];
    const finalInterior = [...keptInterior, ...newIntUrls];

    const updatePayload: any = {
      name,
      plate_number,
      capacity,
      rate_per_hour,
      description,
      features,
      exterior_photos: finalExterior,
      interior_photos: finalInterior,
    };

    if (coverUrl) updatePayload.image_url = coverUrl;

    const saccoId = await getSaccoId(supabase, user.id);
    const { error } = await supabase
      .from('vehicles')
      .update(updatePayload)
      .eq('id', vehicleId)
      .eq('sacco_id', saccoId);

    if (error) throw error;

  } catch (error: any) {
    console.error("Update Error:", error);
    return { status: 'error', message: error.message || 'Update failed' };
  }

  revalidatePath('/dashboard/sacco/fleet');
  return { status: 'success', message: 'Vehicle updated successfully!' };
}

// --- 3. DELETE VEHICLE ---
export async function deleteVehicleAction(vehicleId: string): Promise<ActionState> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { status: 'error', message: 'Unauthorized' };

  const saccoId = await getSaccoId(supabase, user.id);
  
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)
    .eq('sacco_id', saccoId);

  if (error) return { status: 'error', message: 'Failed to delete vehicle' };

  revalidatePath('/dashboard/sacco/fleet');
  return { status: 'success', message: 'Vehicle removed' };
}

// --- 4. HELPERS (Defined Once) ---

async function getSaccoId(supabase: any, userId: string) {
  const { data } = await supabase.from('saccos').select('id').eq('admin_id', userId).single();
  return data?.id;
}

async function uploadFile(supabase: any, userId: string, file: File, folder: string) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split('.').pop();
  const filename = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage.from('vehicle-images').upload(filename, file);
  if (error) throw error;
  const { data } = supabase.storage.from('vehicle-images').getPublicUrl(filename);
  return data.publicUrl;
}

async function uploadMultipleFiles(supabase: any, userId: string, files: File[], folder: string) {
  const results = await Promise.all(files.map(f => uploadFile(supabase, userId, f, folder)));
  return results.filter(Boolean) as string[];
}