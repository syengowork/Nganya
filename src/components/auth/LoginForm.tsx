'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; 
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr'; 
import { toast } from 'sonner';

// --- VALIDATION SCHEMA ---
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverState, setServerState] = useState<{ status: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  // --- GOOGLE OAUTH HANDLER ---
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setServerState(null);
    
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      toast.error("Google Login Failed", { description: error.message });
      setServerState({ status: 'error', message: error.message });
      setIsGoogleLoading(false);
    }
  };

  // --- EMAIL LOGIN HANDLER ---
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerState(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    try {
      const result = await loginAction(null, formData);
      if (result?.status === 'error') {
        setServerState(result);
        toast.error("Login Failed", { description: result.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      const msg = "An unexpected error occurred. Please try again.";
      setServerState({ status: 'error', message: msg });
      toast.error("Error", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">

      {/* 2. FORM CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl p-6 md:p-8 shadow-xl"
      >
        {/* GOOGLE BUTTON */}
        <div className="space-y-5 mb-6">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full h-12 relative font-bold border-border/60 hover:bg-background/80 hover:border-primary/30 transition-all shadow-sm" 
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <div className="flex items-center justify-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </div>
            )}
          </Button>
          
          {/* --- THE FIX: FLEXBOX SEPARATOR (No Masking Required) --- */}
          <div className="flex items-center justify-center w-full gap-2">
            <div className="h-[1px] flex-1 bg-border/60"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground whitespace-nowrap pb-0.5">
              Or with email
            </span>
            <div className="h-[1px] flex-1 bg-border/60"></div>
          </div>
        </div>

        {/* EMAIL FORM */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Server Error Message */}
          <AnimatePresence>
            {serverState?.status === 'error' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg flex items-center gap-2 font-medium"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverState.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10 h-11 bg-muted/30 border-input/60 focus:bg-background focus:border-primary transition-all duration-300 rounded-lg"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-destructive font-medium mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs uppercase font-bold text-muted-foreground tracking-wide">Password</Label>
              <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-muted/30 border-input/60 focus:bg-background focus:border-primary transition-all duration-300 rounded-lg"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none p-1 rounded-md hover:bg-muted"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive font-medium mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-12 font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-lg" 
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <span className="flex items-center">
                Sign In <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-muted-foreground">New to NganyaOps? </span>
          <Link href="/register" className="font-bold text-primary hover:text-primary/80 underline underline-offset-4 decoration-primary/30 transition-all">
            Create an account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}