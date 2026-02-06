'use server';

import { createAdminClient } from '@/utils/supabase/admin'; // For Admin privileges (Sign up)
import { createClient } from '@/utils/supabase/server';     // For User session (Sign in)
import { z } from 'zod';

const saccoRegisterSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  saccoName: z.string().min(2, "Sacco Name is required"),
  regNumber: z.string().min(3, "Registration Number is required"),
});

export type ActionState = {
  status: 'success' | 'error';
  message: string;
} | null;

export async function registerSaccoAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabaseAdmin = createAdminClient();
  const supabaseStandard = await createClient(); // Used for setting the cookie

  // 1. Validation
  const rawData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    phone: formData.get('phone'),
    saccoName: formData.get('saccoName'),
    regNumber: formData.get('regNumber'),
  };

  const validated = saccoRegisterSchema.safeParse(rawData);
  if (!validated.success) {
    return { status: 'error', message: validated.error.issues[0].message };
  }

  const { email, password, fullName, phone, saccoName, regNumber } = validated.data;
  const files = formData.getAll('documents') as File[];

  if (files.length === 0 || files[0].size === 0) {
     return { status: 'error', message: 'Verification documents are required.' };
  }

  // 2. Create Auth User (Admin Context to bypass "Disable Signups")
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name: fullName, phone_number: phone },
    email_confirm: true // Auto-confirm so they can login immediately
  });

  if (authError || !authData.user) {
    return { status: 'error', message: authError?.message || 'User creation failed.' };
  }

  const userId = authData.user.id;
  const docUrls: string[] = [];

  // 3. Upload Documents
  try {
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${Date.now()}-${sanitizedName}`;
      
      const { error: uploadError } = await supabaseAdmin.storage
        .from('sacco-docs')
        .upload(filePath, buffer, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;
      docUrls.push(filePath);
    }
  } catch (error) {
    console.error('Upload Error:', error);
    await supabaseAdmin.auth.admin.deleteUser(userId); // Rollback
    return { status: 'error', message: 'Document upload failed. Please try again.' };
  }

  // 4. Create Sacco Profile
  const { error: saccoError } = await supabaseAdmin.from('saccos').insert({
    name: saccoName,
    admin_id: userId,
    registration_number: regNumber,
    contact_email: email,
    verification_docs: docUrls,
    status: 'pending' 
  });

  if (saccoError) {
    console.error('Sacco DB Error:', saccoError);
    await supabaseAdmin.auth.admin.deleteUser(userId); // Rollback
    return { status: 'error', message: 'Failed to create profile. Please try again.' };
  }

  // 5. AUTO-LOGIN (The Magic Step)
  // We use the Standard client to sign them in. This sets the cookie in the browser.
  const { error: loginError } = await supabaseStandard.auth.signInWithPassword({
    email,
    password
  });

  if (loginError) {
    // Edge case: Account created, but auto-login failed.
    return { status: 'success', message: 'Account created! Please log in manually.' };
  }

  return { status: 'success', message: 'Application submitted successfully.' };
}