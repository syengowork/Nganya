'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, ShieldCheck, AlertTriangle, X, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { createVehicleAction } from '@/actions/vehicle';

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  },
  exit: { 
    opacity: 0, 
    x: -20, 
    transition: { duration: 0.2 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

// --- ZOD SCHEMAS ---
const fileSchema = z.custom<File[]>();

const step1Schema = z.object({
  // FIX 1: Ensure validation checks for length > 0, not just existence
  cover_photo: fileSchema.refine((files) => files?.length > 0, "Cover photo is required."),
  name: z.string().min(2, "Name is required"),
  plate_number: z.string().regex(/^[A-Z]{3} \d{3}[A-Z]$/, "Format: KBC 123A"),
  capacity: z.coerce.number().min(1, "Capacity required"),
  rate_per_hour: z.coerce.number().min(100, "Min rate KES 100"),
});

const step2Schema = z.object({
  exterior_photos: fileSchema.refine((files) => files?.length <= 4, "Max 4 exterior photos"),
  interior_photos: fileSchema.refine((files) => files?.length <= 4, "Max 4 interior photos"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
  description: z.string().min(20, "Tell us more about this Nganya (min 20 chars)"),
});

const combinedSchema = step1Schema.merge(step2Schema);
type VehicleFormValues = z.infer<typeof combinedSchema>;

const FEATURES_LIST = ["WiFi", "Sound System", "TV Screens", "VIP Lighting", "CCTV", "AC", "DJ on Board"];

interface VehicleWizardProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: { id: string; name: string; plate: string; rate: number; capacity: number; img: string; } | null;
}

export function VehicleWizard({ isOpen, onClose }: VehicleWizardProps) {
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{ status: 'scanning' | 'uploading' | 'success' | 'error', message: string }>({ status: 'scanning', message: '' });
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(combinedSchema),
    mode: 'onChange',
    // FIX 2: Initialize ALL fields to prevent "uncontrolled" errors and validation blocking
    defaultValues: { 
      name: '',
      plate_number: '',
      capacity: 33, // Default, but editable now
      rate_per_hour: 0,
      cover_photo: [], // Crucial for Step 1 validation
      exterior_photos: [], 
      interior_photos: [], 
      features: [] 
    }
  });

  const { register, handleSubmit, formState: { errors, isValid }, trigger, watch, setValue, getValues } = form;
  const coverPhoto = watch('cover_photo');
  const extPhotos = watch('exterior_photos');
  const intPhotos = watch('interior_photos');

  const nextStep = async () => {
    let isStepValid = false;
    if (step === 1) {
       // Debugging: Log errors if validation fails
       isStepValid = await trigger(['cover_photo', 'name', 'plate_number', 'capacity', 'rate_per_hour']);
       if (!isStepValid) console.log("Step 1 Validation Failed", form.formState.errors);
    }
    if (isStepValid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => s - 1);

  const onSubmit = async (data: VehicleFormValues) => {
    setStep(3);
    setUploadProgress({ status: 'scanning', message: 'AI Scanning for explicit content...' });

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('plate_number', data.plate_number);
    formData.append('capacity', data.capacity.toString());
    formData.append('rate_per_hour', data.rate_per_hour.toString());
    formData.append('description', data.description);
    formData.append('features', JSON.stringify(data.features));

    if (data.cover_photo?.[0]) formData.append('cover_photo', data.cover_photo[0]);
    if (data.exterior_photos) Array.from(data.exterior_photos).forEach((file) => formData.append('exterior_photos', file));
    if (data.interior_photos) Array.from(data.interior_photos).forEach((file) => formData.append('interior_photos', file));

    const result = await createVehicleAction(null, formData);

    if (result.status === 'success') {
      setUploadProgress({ status: 'success', message: 'Vehicle Added Successfully!' });
      setTimeout(() => {
        onClose();
        setStep(1);
      }, 2000);
    } else {
      setUploadProgress({ status: 'error', message: result.message || 'Something went wrong' });
    }
  };

  // --- UPGRADED IMAGE DROPZONE (With Delete) ---
  // --- FIXED IMAGE DROPZONE ---
  const ImageDropzone = ({ fieldName, label, maxFiles = 1, currentFiles }: { fieldName: keyof VehicleFormValues, label: string, maxFiles?: number, currentFiles: File[] }) => {
    
    // safeFiles ensures we always have an array, even if the form is empty
    const safeFiles = Array.isArray(currentFiles) ? currentFiles : [];

    const onDrop = (acceptedFiles: File[]) => {
      // If maxFiles is 1, we REPLACE the file. If > 1, we APPEND.
      const newFiles = maxFiles === 1 ? acceptedFiles : [...safeFiles, ...acceptedFiles].slice(0, maxFiles);
      setValue(fieldName, newFiles as any, { shouldValidate: true });
    };

    const removeFile = (indexToRemove: number, e: React.MouseEvent) => {
      e.stopPropagation();
      const newFiles = safeFiles.filter((_, index) => index !== indexToRemove);
      setValue(fieldName, newFiles as any, { shouldValidate: true });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      accept: {'image/*': []}, 
      maxFiles 
    });

    // LOGIC: Should we show the upload box?
    // Yes, if we allow multiple files AND haven't hit the limit.
    // OR Yes, if we only allow 1 file and haven't selected one yet.
    const showUploadBox = maxFiles > 1 ? safeFiles.length < maxFiles : safeFiles.length === 0;

    return (
      <motion.div variants={itemVariants} className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        
        {/* 1. The Upload Box */}
        {showUploadBox && (
          <motion.div 
            {...getRootProps()} 
            animate={{ 
              borderColor: isDragActive ? "hsl(var(--primary))" : errors[fieldName] ? "hsl(var(--destructive))" : "hsl(var(--border))",
              backgroundColor: isDragActive ? "hsl(var(--primary) / 0.05)" : "transparent",
            }}
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group min-h-[160px] hover:bg-muted/50 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className={cn("h-8 w-8 mb-2 transition-colors", isDragActive ? "text-primary" : "text-muted-foreground")} />
            <p className="text-xs text-muted-foreground text-center font-medium">
              {isDragActive ? "Drop it!" : "Click to upload"}
            </p>
          </motion.div>
        )}
        
        {/* 2. The Preview Area */}
        {safeFiles.length > 0 && (
          <div className={cn("grid gap-4", maxFiles === 1 ? "grid-cols-1" : "grid-cols-2")}>
            {safeFiles.map((file, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden border shadow-sm group h-48 bg-muted"
              >
                {/* Image Preview */}
                <Image 
                  src={URL.createObjectURL(file)} 
                  alt="preview" 
                  fill 
                  className="object-cover" 
                  onLoad={() => URL.revokeObjectURL(file.name)} // Memory cleanup
                />
                
                {/* Delete Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <Button 
                     type="button" 
                     variant="destructive" 
                     size="icon" 
                     className="rounded-full shadow-xl"
                     onClick={(e) => removeFile(i, e)}
                   >
                     <Trash2 className="w-4 h-4" />
                   </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {errors[fieldName] && <p className="text-xs text-destructive font-medium">{errors[fieldName]?.message as string}</p>}
      </motion.div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-white/10 shadow-2xl">
        <DialogTitle className="sr-only">Add New Nganya Wizard</DialogTitle>
        
        {/* SMOOTH PROGRESS BAR */}
        <div className="h-1.5 bg-muted w-full relative overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-purple-500 absolute left-0 top-0" 
            initial={{ width: 0 }} 
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              
              {/* --- STEP 1: IDENTITY --- */}
              {step === 1 && (
                <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  <motion.div variants={itemVariants} className="mb-4">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Identity</h2>
                    <p className="text-muted-foreground text-sm">Let&apos;s verify the basics of the Nganya.</p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* The dropzone will now hide the upload box when a file is selected, showing only the clearable preview */}
                    <ImageDropzone fieldName="cover_photo" label="Cover Photo (Profile)" maxFiles={1} currentFiles={coverPhoto as unknown as File[]} />
                    
                    <div className="space-y-4">
                      <motion.div variants={itemVariants} className="space-y-2">
                        <label className="text-sm font-medium">Nganya Name</label>
                        <Input {...register("name")} placeholder="e.g. Catalyst" className="transition-all focus:scale-[1.01]" />
                        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </motion.div>
                      
                      <motion.div variants={itemVariants} className="space-y-2">
                        <label className="text-sm font-medium">Plate Number</label>
                        <Input {...register("plate_number")} placeholder="KBA 123A" className="uppercase font-mono tracking-widest transition-all focus:scale-[1.01]" />
                        {errors.plate_number && <p className="text-xs text-destructive">{errors.plate_number.message}</p>}
                      </motion.div>

                      <div className="flex gap-4">
                        <motion.div variants={itemVariants} className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Capacity</label>
                           {/* FIX 5: Removed readOnly and bg-muted */}
                           <Input 
                             type="number" 
                             {...register("capacity")} 
                             className="transition-all focus:scale-[1.01]" 
                           />
                           {errors.capacity && <p className="text-xs text-destructive">{errors.capacity.message}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Rate / Hr (KES)</label>
                           <Input type="number" {...register("rate_per_hour")} className="font-semibold" />
                           {errors.rate_per_hour && <p className="text-xs text-destructive">{errors.rate_per_hour.message}</p>}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- STEP 2: DETAILS --- */}
              {step === 2 && (
                <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                  {/* ... (Same as before) ... */}
                  <motion.div variants={itemVariants} className="mb-2">
                    <h2 className="text-2xl font-bold">The Vibe</h2>
                    <p className="text-muted-foreground text-sm">Show off the art and custom features.</p>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                     <ImageDropzone fieldName="exterior_photos" label="Exterior Angles (Max 4)" maxFiles={4} currentFiles={extPhotos as unknown as File[]} />
                     <ImageDropzone fieldName="interior_photos" label="Interior Shots (Max 4)" maxFiles={4} currentFiles={intPhotos as unknown as File[]} />
                  </div>

                  <motion.div variants={itemVariants} className="space-y-3">
                    <label className="text-sm font-medium">Custom Features</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FEATURES_LIST.map((feat) => (
                        <motion.div key={feat} whileTap={{ scale: 0.95 }} className="flex items-center space-x-2 bg-muted/30 p-2 rounded-lg border border-transparent hover:border-primary/20 transition-colors">
                          <Checkbox 
                            id={feat} 
                            checked={getValues('features').includes(feat)}
                            onCheckedChange={(checked: boolean) => {
                              const current = getValues('features');
                              if (checked) setValue('features', [...current, feat], { shouldValidate: true });
                              else setValue('features', current.filter(f => f !== feat), { shouldValidate: true });
                            }}
                          />
                          <label htmlFor={feat} className="text-xs font-medium cursor-pointer select-none w-full">{feat}</label>
                        </motion.div>
                      ))}
                    </div>
                    {errors.features && <p className="text-xs text-destructive">{errors.features.message}</p>}
                  </motion.div>

                  <motion.div variants={itemVariants} className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea 
                      {...register("description")} 
                      placeholder="e.g. Winner of Nganya Awards 2025..." 
                      className="h-20 transition-all focus:scale-[1.01]"
                    />
                    {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                  </motion.div>
                </motion.div>
              )}

              {/* --- STEP 3: LOADING / SUCCESS --- */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 space-y-8 text-center">
                   
                   {/* SCANNER ANIMATION */}
                   <div className="relative w-24 h-24 flex items-center justify-center">
                      {uploadProgress.status === 'scanning' && (
                        <>
                           <ShieldCheck className="w-20 h-20 text-blue-500/20" />
                           {/* The Scanning Beam */}
                           <motion.div 
                             className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]"
                             animate={{ top: ["0%", "100%", "0%"] }}
                             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                           />
                           <motion.div 
                             className="absolute inset-0 bg-blue-500/10"
                             initial={{ clipPath: "inset(0 0 100% 0)" }}
                             animate={{ clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)", "inset(100% 0 0% 0)"] }}
                             transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                           />
                        </>
                      )}
                      
                      {uploadProgress.status === 'uploading' && (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <Loader2 className="w-20 h-20 text-primary" />
                        </motion.div>
                      )}

                      {uploadProgress.status === 'success' && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
                          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            {/* Animated Checkmark */}
                            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <motion.path 
                                d="M20 6L9 17l-5-5" 
                                initial={{ pathLength: 0 }} 
                                animate={{ pathLength: 1 }} 
                                transition={{ duration: 0.5, delay: 0.2 }} 
                              />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                      
                      {uploadProgress.status === 'error' && (
                        <motion.div initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} className="text-destructive">
                           <AlertTriangle className="w-20 h-20" />
                        </motion.div>
                      )}
                   </div>
                   
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                     <h3 className="text-2xl font-bold tracking-tight">
                        {uploadProgress.status === 'scanning' ? 'AI Safety Scan' : 
                         uploadProgress.status === 'uploading' ? 'Finalizing...' : 
                         uploadProgress.status === 'success' ? 'All Systems Go!' : 'Safety Alert'}
                     </h3>
                     <p className="text-muted-foreground mt-2 max-w-xs mx-auto text-sm">{uploadProgress.message}</p>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* --- FOOTER NAVIGATION --- */}
            {step < 3 && (
              <div className="flex justify-between mt-8 pt-4 border-t border-border/50">
                {step > 1 ? (
                  <Button type="button" variant="outline" onClick={prevStep} className="hover:bg-muted/50">Back</Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">Cancel</Button>
                )}

                {step === 1 && (
                  <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Next: Details</Button>
                )}
                
                {step === 2 && (
                  <Button 
                    type="submit" 
                    disabled={!isValid}
                    className={cn(
                      "transition-all duration-300 shadow-lg", 
                      isValid ? "opacity-100 scale-100 shadow-primary/20" : "opacity-50 scale-95 cursor-not-allowed grayscale"
                    )}
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