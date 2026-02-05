'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, X, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

// --- ZOD SCHEMAS ---

// Step 1 Validation
const step1Schema = z.object({
  cover_photo: z.any().refine((files) => files?.length === 1, "Cover photo is required."),
  name: z.string().min(2, "Name is required"),
  plate_number: z.string().regex(/^[A-Z]{3} \d{3}[A-Z]$/, "Format: KBC 123A"),
  capacity: z.coerce.number().min(1),
  rate_per_hour: z.coerce.number().min(100),
});

// Step 2 Validation
const step2Schema = z.object({
  exterior_photos: z.array(z.any()).max(4, "Max 4 exterior photos"),
  interior_photos: z.array(z.any()).max(4, "Max 4 interior photos"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
  description: z.string().min(20, "Tell us more about this Nganya (min 20 chars)"),
});

// Combine for final submission type
const combinedSchema = step1Schema.merge(step2Schema);
type FormData = z.infer<typeof combinedSchema>;

const FEATURES_LIST = ["WiFi", "Sound System", "TV Screens", "VIP Lighting", "CCTV", "AC", "DJ on Board"];

interface VehicleWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VehicleWizard({ isOpen, onClose }: VehicleWizardProps) {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{ status: 'scanning' | 'uploading' | 'success' | 'error', message: string }>({ status: 'scanning', message: '' });
  
  // We use one form to manage all state, but validate per step
  const form = useForm<FormData>({
    resolver: zodResolver(step === 1 ? step1Schema : step2Schema),
    mode: 'onChange',
    defaultValues: {
      capacity: 33,
      exterior_photos: [],
      interior_photos: [],
      features: [],
    }
  });

  const { register, handleSubmit, formState: { errors, isValid }, trigger, watch, setValue } = form;
  
  // Watchers for previews
  const coverPhoto = watch('cover_photo');
  const extPhotos = watch('exterior_photos');
  const intPhotos = watch('interior_photos');

  // --- ACTIONS ---

  const nextStep = async () => {
    const isStepValid = await trigger(); // Trigger validation for current fields
    if (isStepValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: FormData) => {
    // 1. Start the "Processing" UI
    setStep(3);
    setUploadProgress({ status: 'scanning', message: 'AI Scanning for explicit content...' });

    try {
      // SIMULATION: In real app, here you call your Server Action
      // await checkSafety(data.cover_photo); 
      
      await new Promise(r => setTimeout(r, 2000)); // Simulate AI Scan

      setUploadProgress({ status: 'uploading', message: 'Optimizing & Uploading images...' });
      await new Promise(r => setTimeout(r, 2000)); // Simulate Upload

      setUploadProgress({ status: 'success', message: 'Vehicle Added Successfully!' });
      
      setTimeout(() => {
        onClose();
        setStep(1); // Reset
      }, 1500);

    } catch (error) {
      setUploadProgress({ status: 'error', message: 'Safety Check Failed: Explicit content detected.' });
    }
  };

  // --- CUSTOM FILE UPLOAD COMPONENT ---
  const ImageDropzone = ({ fieldName, label, maxFiles = 1, currentFiles }: any) => {
    const onDrop = (acceptedFiles: File[]) => {
      // In a real app, combine new files with existing
      const newFiles = maxFiles === 1 ? acceptedFiles : [...(currentFiles || []), ...acceptedFiles].slice(0, maxFiles);
      setValue(fieldName, newFiles, { shouldValidate: true });
    };

    const { getRootProps, getInputProps } = useDropzone({ 
        onDrop, 
        accept: {'image/*': []},
        maxFiles: maxFiles
    });

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <div {...getRootProps()} className={cn("border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-muted/50", errors[fieldName] ? "border-red-500" : "border-border")}>
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground text-center">Drag & drop or click to upload</p>
          <p className="text-[10px] text-muted-foreground/60">Max {maxFiles} images</p>
        </div>
        
        {/* Previews */}
        {currentFiles && currentFiles.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {Array.from(currentFiles).map((file: any, i) => (
              <div key={i} className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image src={URL.createObjectURL(file)} alt="preview" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
        {errors[fieldName] && <p className="text-xs text-red-500">{(errors[fieldName] as any)?.message}</p>}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background/90 backdrop-blur-xl border-white/20 shadow-2xl">
        
        {/* PROGRESS BAR */}
        <div className="h-1 bg-muted w-full">
          <motion.div 
            className="h-full bg-primary" 
            initial={{ width: 0 }} 
            animate={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: IDENTITY --- */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold">Identity</h2>
                    <p className="text-muted-foreground text-sm">Let's verify the basics of the Nganya.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageDropzone fieldName="cover_photo" label="Cover Photo (Profile)" maxFiles={1} currentFiles={coverPhoto} />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nganya Name (Dubbed)</label>
                        <Input {...register("name")} placeholder="e.g. Catalyst" />
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Plate Number</label>
                        <Input {...register("plate_number")} placeholder="KBA 123A" />
                        {errors.plate_number && <p className="text-xs text-red-500">{errors.plate_number.message}</p>}
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Capacity</label>
                           <Input type="number" {...register("capacity")} readOnly className="bg-muted" />
                        </div>
                        <div className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Rate / Hr (KES)</label>
                           <Input type="number" {...register("rate_per_hour")} />
                           {errors.rate_per_hour && <p className="text-xs text-red-500">{errors.rate_per_hour.message}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 2: DETAILS & VIBES --- */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold">The Vibe</h2>
                    <p className="text-muted-foreground text-sm">Show off the art and custom features.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <ImageDropzone fieldName="exterior_photos" label="Exterior Angles (Max 4)" maxFiles={4} currentFiles={extPhotos} />
                     <ImageDropzone fieldName="interior_photos" label="Interior Shots (Max 4)" maxFiles={4} currentFiles={intPhotos} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Features</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FEATURES_LIST.map((feat) => (
                        <div key={feat} className="flex items-center space-x-2">
                          <Checkbox 
                            id={feat} 
                            onCheckedChange={(checked) => {
                              const current = form.getValues('features');
                              if (checked) setValue('features', [...current, feat], { shouldValidate: true });
                              else setValue('features', current.filter(f => f !== feat), { shouldValidate: true });
                            }}
                          />
                          <label htmlFor={feat} className="text-sm cursor-pointer select-none">{feat}</label>
                        </div>
                      ))}
                    </div>
                    {errors.features && <p className="text-xs text-red-500">{errors.features.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description & Fun Facts</label>
                    <Textarea 
                      {...register("description")} 
                      placeholder="e.g. Winner of Nganya Awards 2025. Best sound system on Thika Road..." 
                      className="h-20"
                    />
                    {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                  </div>
                </motion.div>
              )}

              {/* --- STEP 3: PROCESSING & SCREENING --- */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-6 text-center"
                >
                   <div className="relative">
                      {uploadProgress.status === 'scanning' && <ShieldCheck className="w-20 h-20 text-blue-500 animate-pulse" />}
                      {uploadProgress.status === 'uploading' && <Loader2 className="w-20 h-20 text-primary animate-spin" />}
                      {uploadProgress.status === 'success' && <CheckCircle2 className="w-20 h-20 text-green-500" />}
                      {uploadProgress.status === 'error' && <AlertTriangle className="w-20 h-20 text-destructive" />}
                   </div>
                   
                   <div>
                     <h3 className="text-xl font-bold">{
                        uploadProgress.status === 'scanning' ? 'AI Safety Check' : 
                        uploadProgress.status === 'uploading' ? 'Finalizing...' : 
                        uploadProgress.status === 'success' ? 'All Set!' : 'Action Needed'
                     }</h3>
                     <p className="text-muted-foreground mt-2">{uploadProgress.message}</p>
                   </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* --- FOOTER NAVIGATION --- */}
            {step < 3 && (
              <div className="flex justify-between mt-8 pt-4 border-t">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep}>Back</Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                )}

                {step === 1 && (
                  <Button type="button" onClick={nextStep}>Next: Details</Button>
                )}
                
                {step === 2 && (
                  <Button 
                    type="submit" 
                    disabled={!isValid} // Button comes to life only when valid
                    className={cn("transition-all", isValid ? "opacity-100" : "opacity-50 cursor-not-allowed")}
                  >
                    Create & Screen Vehicle
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}