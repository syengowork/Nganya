'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loginAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Lock, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Validation Schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverState, setServerState] = useState<{ status: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setServerState(null);

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    try {
      // We pass 'null' as the initial prevState
      const result = await loginAction(null, formData);
      if (result?.status === 'error') {
        setServerState(result);
      }
    } catch (error) {
      setServerState({ status: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header Animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="mt-6 text-3xl font-extrabold tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your Nganya fleet
        </p>
      </motion.div>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="bg-card/50 backdrop-blur-sm border rounded-2xl p-8 shadow-xl"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Server Error Message */}
          {serverState?.status === 'error' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              {serverState.message}
            </motion.div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="sacco@nganya.com"
                className="pl-10 h-11 bg-background/50 border-input/60 focus:bg-background transition-all"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-xs text-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10 h-11 bg-background/50 border-input/60 focus:bg-background transition-all"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full h-11 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Link href="/register" className="font-medium text-primary hover:underline">
            Register Sacco
          </Link>
        </div>
      </motion.div>
    </div>
  );
}