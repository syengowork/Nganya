'use server';

import { createClient } from '@/utils/supabase/server'; 
import { scanImageForSafety } from '@/lib/safety';
import { revalidatePath } from 'next/cache';

// Define the state return type
interface ActionState {
  status: 'success' | 'error';
  message: string;
}

export async function createVehicleAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  const supabase =await createClient();

  // 1. AUTH CHECK
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: 'error', message: 'Unauthorized. Please log in.' };
  }

  // 2. DATA EXTRACTION
  const name = formData.get('name') as string;
  const plate_number = formData.get('plate_number') as string;
  const capacity = Number(formData.get('capacity'));
  const rate_per_hour = Number(formData.get('rate_per_hour'));
  const description = formData.get('description') as string;
  const features = JSON.parse(formData.get('features') as string || '[]');
  
  // Extract Files
  const coverFile = formData.get('cover_photo') as File;
  const extFiles = formData.getAll('exterior_photos') as File[];
  const intFiles = formData.getAll('interior_photos') as File[];
  const allFiles = [coverFile, ...extFiles, ...intFiles].filter(f => f && f.size > 0);

  // 3. AI SCREENING
  try {
    const safetyResults = await Promise.all(allFiles.map(file => scanImageForSafety(file)));
    if (safetyResults.some(isSafe => !isSafe)) {
      return { status: 'error', message: 'Creation Rejected: One or more images contain explicit content.' };
    }
  } catch (_e) {
    return { status: 'error', message: 'Safety check service is unavailable.' };
  }

  // 4. IMAGE UPLOAD
  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop();
    const filename = `${user.id}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    const { error } = await supabase.storage
      .from('vehicle-images')
      .upload(filename, file);

    if (error) throw new Error('Image upload failed');
    
    const { data: { publicUrl } } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filename);
      
    return publicUrl;
  };

  let coverUrl = '';
  let extUrls: string[] = [];
  let intUrls: string[] = [];

  try {
    coverUrl = await uploadFile(coverFile, 'covers');
    extUrls = await Promise.all(extFiles.map(f => uploadFile(f, 'exterior')));
    intUrls = await Promise.all(intFiles.map(f => uploadFile(f, 'interior')));
  } catch (_error) {
    return { status: 'error', message: 'Failed to upload images to cloud storage.' };
  }

  // 5. DATABASE INSERT
  const { data: saccoData, error: saccoError } = await supabase
    .from('saccos')
    .select('id')
    .eq('admin_id', user.id)
    .single();

  if (saccoError || !saccoData) {
    return { status: 'error', message: 'You do not have a registered Sacco account.' };
  }

  const { error: dbError } = await supabase.from('vehicles').insert({
    sacco_id: saccoData.id,
    name,
    plate_number,
    capacity,
    rate_per_hour,
    description,
    features,
    cover_photo: coverUrl,
    exterior_photos: extUrls,
    interior_photos: intUrls,
    is_available: true
  });

  if (dbError) {
    console.error(dbError);
    return { status: 'error', message: 'Database error. Plate number might be duplicate.' };
  }

  // 6. SUCCESS
  revalidatePath('/dashboard/sacco/fleet');
  return { status: 'success', message: 'Vehicle created successfully!' };
}