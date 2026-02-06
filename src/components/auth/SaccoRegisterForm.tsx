'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { registerSaccoAction } from '@/actions/sacco-auth';
import { 
  Loader2, Upload, FileText, CheckCircle2, Building2, 
  ChevronRight, ChevronLeft, Clock, ShieldAlert, XCircle 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Validation Schema
const schema = z.object({
  fullName: z.string().min(2, "Admin Name required"),
  email: z.string().email(),
  phone: z.string().min(10, "Valid phone required"),
  password: z.string().min(6),
  saccoName: z.string().min(2, "Sacco Name required"),
  regNumber: z.string().min(3, "Registration No. required"),
  documents: z.custom<File[]>().refine(files => files?.length > 0, "Upload at least 1 document"),
});

type FormData = z.infer<typeof schema>;

// New Prop Interface
interface SaccoRegisterFormProps {
  existingApplication?: {
    status: 'pending' | 'approved' | 'rejected' | string;
    rejection_reason?: string | null;
    name: string;
  } | null;
}

export function SaccoRegisterForm({ existingApplication }: SaccoRegisterFormProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{status: string, message: string} | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { documents: [] }
  });

  const { register, handleSubmit, trigger, setValue, watch, formState: { errors } } = form;
  const documents = watch('documents');

  // --- LOGIC: DECIDE WHICH VIEW TO SHOW ---
  // Show Success View if:
  // 1. The Server passed an existing application (User refreshed page)
  // 2. The User just submitted successfully (Client state)
  const appStatus = existingApplication?.status || (result?.status === 'success' ? 'pending' : null);
  
  if (appStatus) {
    const isApproved = appStatus === 'approved';
    const isRejected = appStatus === 'rejected';
    const saccoName = existingApplication?.name || "your Sacco";

    // REJECTED VIEW
    if (isRejected) {
       return (
          <div className="bg-card border-destructive/50 border rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6">
             <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
               <XCircle className="w-10 h-10" />
             </div>
             <h2 className="text-2xl font-bold">Application Rejected</h2>
             <p className="text-muted-foreground">We could not verify your documents.</p>
             <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200 text-sm text-left">
               <span className="font-bold">Reason:</span> {existingApplication?.rejection_reason || "Compliance check failed."}
             </div>
             <p className="text-xs text-muted-foreground">Please contact support to resolve this issue.</p>
          </div>
       );
    }

    // APPROVED / PENDING VIEW
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6"
      >
        <div className="relative w-24 h-24 mx-auto">
          <div className={cn("w-full h-full rounded-full flex items-center justify-center transition-colors", 
            isApproved ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
          )}>
            {isApproved ? <CheckCircle2 className="w-12 h-12" /> : <Clock className="w-12 h-12" />}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isApproved ? "Application Approved!" : "Application Under Review"}
          </h2>
          <p className="text-muted-foreground text-lg">
            {isApproved 
              ? "Your account is fully active." 
              : `Thank you for registering ${saccoName}.`}
          </p>
        </div>

        {isApproved ? (
           <Button asChild className="w-full h-11"><Link href="/dashboard/sacco">Enter Dashboard</Link></Button>
        ) : (
           <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3 text-sm">
             <div className="flex gap-3">
               <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
               <p><span className="font-semibold">Status: Pending Verification</span><br/>Our compliance team is currently reviewing your documents.</p>
             </div>
             <div className="flex gap-3">
               <Clock className="w-5 h-5 text-blue-500 shrink-0" />
               <p><span className="font-semibold">Timeline</span><br/>Reviews are typically completed within 24-48 hours.</p>
             </div>
           </div>
        )}
      </motion.div>
    );
  }

  // --- FORM SUBMISSION LOGIC ---
  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await trigger(['fullName', 'email', 'phone', 'password']);
    if (step === 2) valid = await trigger(['saccoName', 'regNumber']);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key !== 'documents') formData.append(key, (data as any)[key]);
      });
      if (data.documents && data.documents.length > 0) {
        Array.from(data.documents).forEach(file => formData.append('documents', file));
      }

      const res = await registerSaccoAction(null, formData);
      setResult(res);
    } catch (error) {
      console.error(error);
      setResult({ status: 'error', message: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-card border rounded-2xl shadow-xl overflow-hidden">
      {/* Progress Bar */}
      <div className="h-1.5 bg-muted w-full">
        <motion.div 
          className="h-full bg-primary" 
          animate={{ width: `${(step / 3) * 100}%` }} 
        />
      </div>

      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Register Sacco</h2>
          <p className="text-sm text-muted-foreground">Step {step} of 3: {step === 1 ? 'Admin Details' : step === 2 ? 'Sacco Profile' : 'Verification'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ADMIN INFO */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Admin Full Name</Label>
                  <Input {...register('fullName')} placeholder="Official Representative Name" />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input {...register('email')} placeholder="admin@sacco.co.ke" />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input {...register('phone')} placeholder="07..." />
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...register('password')} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 2: SACCO INFO */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="space-y-2">
                  <Label>Sacco Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    <Input className="pl-10" {...register('saccoName')} placeholder="e.g. Super Metro Sacco" />
                  </div>
                  {errors.saccoName && <p className="text-xs text-destructive">{errors.saccoName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Registration Number (NTSA)</Label>
                  <Input {...register('regNumber')} placeholder="TV-..." />
                  {errors.regNumber && <p className="text-xs text-destructive">{errors.regNumber.message}</p>}
                </div>
              </motion.div>
            )}

            {/* STEP 3: DOCUMENTS */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="border-2 border-dashed rounded-xl p-8 text-center space-y-4 hover:bg-muted/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    multiple 
                    accept=".pdf,.jpg,.png"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files?.length) setValue('documents', Array.from(e.target.files) as any);
                    }}
                  />
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium">Upload Registration Certificate</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG or PNG (Max 5MB)</p>
                  </div>
                </div>

                {/* File List Preview */}
                {documents && (documents as unknown as File[]).length > 0 && (
                  <div className="space-y-2">
                    {(documents as unknown as File[]).map((file, i) => (
                      <div key={i} className="flex items-center p-3 bg-muted rounded-lg text-sm">
                        <FileText className="w-4 h-4 mr-2 text-primary" />
                        <span className="truncate flex-1">{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
                {errors.documents && <p className="text-xs text-destructive text-center">{errors.documents.message}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" asChild><Link href="/register">Cancel</Link></Button>
            )}

            {step < 3 ? (
              <Button type="button" onClick={nextStep}>
                Next Step <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading} className="w-32">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
              </Button>
            )}
          </div>
          
          {result?.status === 'error' && (
            <p className="text-sm text-destructive text-center">{result.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}