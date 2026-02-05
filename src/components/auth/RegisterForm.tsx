'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signupAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User, Phone, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr'; // Ensure you have this installed

// --- VALIDATION SCHEMA ---
const formSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  // Phone is now optional, but if entered, must be valid
  phone: z.string().refine(val => val === '' || /^(?:\+254|0)[17]\d{8}$/.test(val), {
    message: "Invalid Kenyan number"
  }).optional(),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

export function RegisterForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  // Toggle States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: '', phone: '', email: '', password: '', confirmPassword: '' },
  });

  // --- GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // Ensure this route exists
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      setServerError(error.message);
      setIsGoogleLoading(false);
    }
    // No need to set loading false on success as it redirects
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerError(null);
    
    const formData = new FormData();
    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    // Only append phone if it exists
    if (data.phone) formData.append('phone', data.phone);

    const result = await signupAction(null, formData);

    if (result?.status === 'success') {
      setIsSuccess(true);
    } else {
      setServerError(result?.message || "Something went wrong");
    }
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-8"
      >
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Check your email</h3>
          <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
            We've sent a confirmation link to <span className="font-medium text-foreground">{form.getValues('email')}</span>.
          </p>
        </div>
        <Button asChild className="w-full" variant="outline">
          <Link href="/login">Back to Login</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <h2 className="text-3xl font-extrabold tracking-tight">Create Account</h2>
        <p className="text-sm text-muted-foreground mt-2">Join the Nganya community today.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 shadow-xl"
      >
        {/* --- GOOGLE SIGN IN --- */}
        <div className="space-y-4 mb-6">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-11 relative" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </>
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or continue with</span></div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          
          {serverError && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
             {/* Full Name */}
             <div className="space-y-2">
              <Label>Full Name</Label>
              <div className="relative group">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input placeholder="John Doe" className="pl-10 h-10" {...form.register('fullName')} />
              </div>
              {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input placeholder="john@example.com" className="pl-10 h-10" {...form.register('email')} />
              </div>
              {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
            </div>

            {/* Optional Phone */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <Label>Phone (Optional)</Label>
                 <span className="text-[10px] text-muted-foreground">For easy booking</span>
              </div>
              <div className="relative group">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input placeholder="0712 345 678" className="pl-10 h-10" {...form.register('phone')} />
              </div>
              {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-10" 
                  {...form.register('password')} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password && <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  type={showConfirm ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 h-10" 
                  {...form.register('confirmPassword')} 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>

          <Button type="submit" className="w-full h-11 mt-2 font-semibold shadow-lg shadow-primary/20" disabled={isLoading || isGoogleLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <span className="flex items-center">Create Account <ArrowRight className="ml-2 w-4 h-4" /></span>}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}