'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// --- ZOD SCHEMA FOR REGISTRATION ---
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^(?:\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number (e.g., 0712345678)"),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function signupAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // 1. Validate Input
  const rawData = {
    fullName: formData.get('fullName'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const validatedFields = registerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { status: 'error', message: 'Please check your inputs.' };
  }

  const { email, password, fullName, phone } = validatedFields.data;

  // 2. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Metadata for Supabase Auth
        phone_number: phone,
      }
    }
  });

  if (authError) {
    return { status: 'error', message: authError.message };
  }

  if (authData.user) {
    // 3. Create Public Profile (The "Twin" Record)
    // Note: If you have a Supabase Trigger set up, this might be redundant, 
    // but explicit creation is safer for custom fields.
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      full_name: fullName,
      phone_number: phone,
      role: 'user', // Default role for this form
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError);
      // We don't stop the flow here, but we log it. 
      // ideally, you'd rollback the user creation, but Supabase Triggers are best for that.
    }
  }

  // 4. Success State
  // If email confirmation is enabled in Supabase, we tell them to check email.
  // If disabled (dev mode), we redirect to login or dashboard.
  return { status: 'success', message: 'Account created! Please check your email to confirm.' };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // 1. Validate Input
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
  });

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { status: 'error', message: 'Invalid credentials format.' };
  }

  // 2. Authenticate
  const { data, error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return { status: 'error', message: error.message };
  }

  // 3. INTELLIGENT REDIRECT
  // Fetch the user's role from the profiles table
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    const role = profile?.role || 'user';

    // Redirect based on role
    if (role === 'sacco_admin') {
      redirect('/dashboard/sacco');
    } else if (role === 'super_admin') {
      redirect('/dashboard/admin'); // Future proofing
    } else {
      redirect('/dashboard/user'); // The default for normal users
    }
  }

  return { status: 'error', message: 'User session not found.' };
}