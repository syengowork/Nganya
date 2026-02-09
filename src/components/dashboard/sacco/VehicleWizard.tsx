'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, Trash2, ShieldCheck, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { createVehicleAction, updateVehicleAction } from '@/actions/vehicle';
import { toast } from 'sonner';

// --- TYPES ---
interface VehicleEditData {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  rate_per_hour: number;
  description: string;
  features: string[];
  cover_photo_url?: string;
  exterior_photos_urls?: string[];
  interior_photos_urls?: string[];
}

interface VehicleWizardProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: VehicleEditData | null;
  userId: string;
  onSuccess?: () => void;
}

// --- SCHEMA & TYPES ---
const vehicleSchema = z.object({
  name: z.string().min(2, "Name is required"),
  plate_number: z.string().min(3, "Plate number is required"),
  // FIX: coerce handles string -> number conversion safely
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  rate_per_hour: z.coerce.number().min(0, "Rate cannot be negative"),
  features: z.array(z.string()).default([]),
  description: z.string().min(10, "Description needs to be longer"),
  
  // File handling: We use z.any() to bypass strict FileList checks in browser vs node
  cover_photo: z.any().optional(),
  exterior_photos: z.any().optional(),
  interior_photos: z.any().optional(),

  kept_exterior: z.array(z.string()).optional(),
  kept_interior: z.array(z.string()).optional(),
});

// Infer the type from the schema
type VehicleFormValues = z.infer<typeof vehicleSchema>;

const FEATURES_LIST = [
  "WiFi", "Music System", "TV Screens", "AC", "VIP Seating", 
  "CCTV", "USB Charging", "Mood Lights", "Fridge"
];

export function VehicleWizard({ isOpen, onClose, vehicleToEdit, userId, onSuccess }: VehicleWizardProps) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState<{ status: 'idle' | 'processing' | 'success' | 'error', message: string }>({ status: 'idle', message: '' });

  // --- FORM ENGINE ---
  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    trigger, 
    reset,
    formState: { errors } 
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleFormValues>,
    // FIX: Provide COMPLETE default values to satisfy TypeScript
    defaultValues: {
      name: '',
      plate_number: '',
      capacity: 0,
      rate_per_hour: 0,
      description: '',
      features: [],
      kept_exterior: [],
      kept_interior: [],
    }
  });

  const watchedFeatures = watch('features');
  const coverFiles = watch('cover_photo');
  const exteriorFiles = watch('exterior_photos');
  const interiorFiles = watch('interior_photos');

  // --- PRELOAD DATA ---
  useEffect(() => {
    if (isOpen) {
      if (vehicleToEdit) {
        reset({
          name: vehicleToEdit.name,
          plate_number: vehicleToEdit.plate_number,
          capacity: vehicleToEdit.capacity,
          rate_per_hour: vehicleToEdit.rate_per_hour,
          description: vehicleToEdit.description,
          features: vehicleToEdit.features || [],
          kept_exterior: vehicleToEdit.exterior_photos_urls || [],
          kept_interior: vehicleToEdit.interior_photos_urls || [],
        });
      } else {
        // Reset to clean state for new entry
        reset({
            name: '',
            plate_number: '',
            capacity: 0,
            rate_per_hour: 0,
            description: '',
            features: [],
            kept_exterior: [],
            kept_interior: [],
        }); 
      }
      setStep(1);
      setProgress({ status: 'idle', message: '' });
    }
  }, [isOpen, vehicleToEdit, reset]);


  // --- STEP LOGIC ---
  const handleNext = async () => {
    let isValid = false;

    if (step === 1) {
       // Validate Text Fields
       isValid = await trigger(['name', 'plate_number', 'capacity', 'rate_per_hour', 'features', 'description']);
       
       // Cover Photo Logic
       const hasNewCover = coverFiles && coverFiles.length > 0;
       const hasExistingCover = !!vehicleToEdit?.cover_photo_url;
       
       if (isValid && !hasNewCover && !hasExistingCover) {
          toast.error("Please upload a cover photo");
          return;
       }
    } 
    
    if (isValid || step === 2) {
       setStep((s) => s + 1);
    }
  };

  // --- SUBMISSION LOGIC ---
  const onSubmit: SubmitHandler<VehicleFormValues> = async (data) => {
    setStep(3);
    setProgress({ status: 'processing', message: 'Syncing with Headquarters...' });

    const formData = new FormData();
    
    // 1. Append Common Data
    formData.append('name', data.name);
    formData.append('plate_number', data.plate_number);
    formData.append('capacity', String(data.capacity));
    formData.append('rate_per_hour', String(data.rate_per_hour));
    formData.append('description', data.description);
    formData.append('features', JSON.stringify(data.features));
    formData.append('owner_id', userId);

    if (data.cover_photo?.[0]) formData.append('cover_photo', data.cover_photo[0]);

    // 2. Branch Logic (Update vs Create)
    try {
      let result;

      if (vehicleToEdit) {
        // === UPDATE MODE ===
        if (data.exterior_photos?.length) {
            Array.from(data.exterior_photos as File[]).forEach((file) => formData.append('new_exterior_photos', file));
        }
        if (data.interior_photos?.length) {
            Array.from(data.interior_photos as File[]).forEach((file) => formData.append('new_interior_photos', file));
        }
        
        formData.append('kept_exterior_photos', JSON.stringify(data.kept_exterior || []));
        formData.append('kept_interior_photos', JSON.stringify(data.kept_interior || []));

        // Call Action (3 Arguments)
        result = await updateVehicleAction(vehicleToEdit.id, null, formData);

      } else {
        // === CREATE MODE ===
        if (data.exterior_photos?.length) {
            Array.from(data.exterior_photos as File[]).forEach((file) => formData.append('exterior_photos', file));
        }
        if (data.interior_photos?.length) {
            Array.from(data.interior_photos as File[]).forEach((file) => formData.append('interior_photos', file));
        }

        // Call Action (2 Arguments)
        result = await createVehicleAction(null, formData);
      }

      // 3. Handle Result
      if (result?.status === 'success') {
        setProgress({ status: 'success', message: 'Operation Successful!' });
        toast.success(result.message);
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        throw new Error(result?.message || "Operation failed");
      }

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setProgress({ status: 'error', message: errorMessage });
        toast.error(errorMessage);
    }
  };

  // --- DROPZONE COMPONENT ---
  const FileUpload = ({ 
    label, 
    files, 
    setFiles, 
    multiple = false,
    existingUrls = [],
    onRemoveExisting
  }: { 
    label: string, 
    files?: File[], 
    setFiles: (f: File[]) => void, 
    multiple?: boolean,
    existingUrls?: string[],
    onRemoveExisting?: (url: string) => void
  }) => {
    const { getRootProps, getInputProps } = useDropzone({
      accept: { 'image/*': [] },
      multiple,
      onDrop: (acceptedFiles) => {
        setFiles(multiple ? [...(files || []), ...acceptedFiles] : acceptedFiles);
      }
    });

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
            {label}
        </label>
        
        <div className="grid grid-cols-4 gap-3 mb-2">
            {/* Existing Photos */}
            {existingUrls.map((url, idx) => (
                <div key={`exist-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-border/50 shadow-sm">
                    <Image src={url} alt="Existing" fill className="object-cover transition-transform group-hover:scale-110" />
                    <button 
                        type="button"
                        onClick={() => onRemoveExisting?.(url)}
                        className="absolute top-1 right-1 bg-black/60 backdrop-blur text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] text-[10px] font-bold text-white text-center py-1">SAVED</div>
                </div>
            ))}

            {/* New Uploads */}
            {files && Array.from(files).map((file, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-primary/50 shadow-sm ring-1 ring-primary/20">
                    <Image src={URL.createObjectURL(file)} alt="Preview" fill className="object-cover transition-transform group-hover:scale-110" />
                    <button 
                        type="button"
                        onClick={() => {
                            const newFiles = [...files];
                            newFiles.splice(idx, 1);
                            setFiles(newFiles);
                        }}
                        className="absolute top-1 right-1 bg-black/60 backdrop-blur text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive"
                    >
                        <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-[10px] font-bold text-white text-center py-1">NEW</div>
                </div>
            ))}
            
            {/* Drop Zone */}
            <div 
                {...getRootProps()} 
                className={cn(
                    "border-2 border-dashed border-muted-foreground/20 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group",
                    (files?.length === 0 && existingUrls.length === 0) && "col-span-4 aspect-auto h-32 bg-muted/20"
                )}
            >
                <input {...getInputProps()} />
                <div className="p-3 rounded-full bg-background shadow-sm group-hover:scale-110 transition-transform mb-2">
                    <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium text-center px-2">{multiple ? "Drop photos here" : "Upload Cover"}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* INDUSTRIAL UI UPGRADE: Aeroglass Effect */}
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/80 backdrop-blur-xl border border-border shadow-2xl sm:rounded-2xl">
         <DialogTitle className="sr-only">Vehicle Wizard</DialogTitle>
         <DialogDescription className="sr-only">Manage your fleet</DialogDescription>
        
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black font-street tracking-tight text-foreground">
                   {vehicleToEdit ? `Edit ${vehicleToEdit.name}` : 'Deploy Unit'}
                </h2>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Step {step} of 3</p>
              </div>
            </div>
            
            {/* Progress Indicators */}
            <div className="flex gap-1.5">
               {[1, 2, 3].map(i => (
                 <motion.div 
                    key={i} 
                    initial={false}
                    animate={{ 
                        width: step >= i ? 32 : 12,
                        backgroundColor: step >= i ? "var(--primary)" : "var(--muted)"
                    }}
                    className="h-1.5 rounded-full" 
                 />
               ))}
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth">
            <AnimatePresence mode="wait">
              
              {/* === STEP 1: DETAILS === */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Vehicle Name</label>
                        <Input {...register('name')} placeholder="e.g. CATALYST" className="bg-background/50 border-input focus:border-primary/50 h-11" />
                        {errors.name && <span className="text-xs text-destructive font-medium">{errors.name.message}</span>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-foreground">Plate Number</label>
                        <Input {...register('plate_number')} placeholder="KDA 001A" className="uppercase bg-background/50 border-input focus:border-primary/50 h-11" />
                        {errors.plate_number && <span className="text-xs text-destructive font-medium">{errors.plate_number.message}</span>}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-foreground">Capacity</label>
                         <Input type="number" {...register('capacity')} className="bg-background/50 border-border h-11" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-bold text-foreground">Hourly Rate (KES)</label>
                         <Input type="number" {...register('rate_per_hour')} className="bg-background/50 border-border h-11" />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground">Vibe Description</label>
                      <Textarea {...register('description')} placeholder="Tell us about the sound, the lights, the route..." rows={4} className="bg-background/50 border-border resize-none" />
                      {errors.description && <span className="text-xs text-destructive font-medium">{errors.description.message}</span>}
                   </div>

                   <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground">Features</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {FEATURES_LIST.map((feat) => (
                           <div key={feat} 
                                className={cn(
                                    "flex items-center space-x-3 border p-3 rounded-xl cursor-pointer transition-all",
                                    watchedFeatures?.includes(feat) 
                                        ? "bg-primary/10 border-primary text-primary" 
                                        : "bg-background/30 border-border hover:bg-muted/50"
                                )}
                                onClick={() => {
                                   const current = watchedFeatures || [];
                                   if (current.includes(feat)) setValue('features', current.filter(f => f !== feat));
                                   else setValue('features', [...current, feat]);
                                }}
                           >
                              <Checkbox checked={watchedFeatures?.includes(feat)} className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                              <span className="text-xs font-bold">{feat}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-4 border-t border-border">
                      <FileUpload 
                         label="Cover Photo (Showstopper)" 
                         files={coverFiles} 
                         setFiles={(f) => setValue('cover_photo', f)}
                         existingUrls={vehicleToEdit?.cover_photo_url ? [vehicleToEdit.cover_photo_url] : []}
                      />
                   </div>
                </motion.div>
              )}

              {/* === STEP 2: MEDIA GALLERY === */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                   <div className="bg-gradient-to-r from-primary/10 via-background to-background border border-primary/20 p-5 rounded-xl flex items-start gap-4">
                      <div className="p-2 bg-background rounded-lg shadow-sm">
                         <ImageIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-foreground">Visuals Matter</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                            High-quality photos increase bookings by <span className="text-primary font-bold">40%</span>. 
                            Focus on the rims, custom lights, and interior screens.
                        </p>
                      </div>
                   </div>

                   <FileUpload 
                      label="Exterior Shots" 
                      multiple 
                      files={exteriorFiles} 
                      setFiles={(f) => setValue('exterior_photos', f)} 
                      existingUrls={watch('kept_exterior') || []}
                      onRemoveExisting={(url) => setValue('kept_exterior', watch('kept_exterior')?.filter(u => u !== url))}
                   />
                   
                   <FileUpload 
                      label="Interior Vibes" 
                      multiple 
                      files={interiorFiles} 
                      setFiles={(f) => setValue('interior_photos', f)} 
                      existingUrls={watch('kept_interior') || []}
                      onRemoveExisting={(url) => setValue('kept_interior', watch('kept_interior')?.filter(u => u !== url))}
                   />
                </motion.div>
              )}

              {/* === STEP 3: PROCESSING === */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-8">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                     {/* Pulsing Background for processing */}
                     {progress.status === 'processing' && (
                         <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                     )}
                     
                     <div className="relative z-10 w-24 h-24 bg-muted/30 backdrop-blur-md rounded-full flex items-center justify-center border border-border shadow-xl">
                        {progress.status === 'processing' && <Loader2 className="w-10 h-10 animate-spin text-primary" />}
                        {progress.status === 'success' && <ShieldCheck className="w-10 h-10 text-green-500 scale-125 transition-transform duration-500" />}
                        {progress.status === 'error' && <Trash2 className="w-10 h-10 text-destructive" />}
                     </div>
                   </div>
                   
                   <div className="space-y-2 max-w-xs mx-auto">
                      <h3 className="text-2xl font-black font-street tracking-tight">
                          {progress.status === 'processing' ? 'Syncing Fleet...' : progress.status === 'success' ? 'Deployed!' : 'System Error'}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">{progress.message}</p>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          {/* Footer Navigation */}
          {step < 3 && (
            <div className="p-6 border-t border-border bg-muted/10 backdrop-blur-md flex justify-between items-center">
              {step > 1 ? (
                <Button type="button" variant="ghost" onClick={() => setStep(s => s - 1)} className="hover:bg-background/50">Back</Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onClose} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">Cancel</Button>
              )}

              {step === 1 && (
                 <Button type="button" onClick={handleNext} className="px-8 font-bold rounded-full shadow-lg shadow-primary/20">
                    Next Step
                 </Button>
              )}
              {step === 2 && (
                 <Button type="submit" onClick={handleSubmit(onSubmit)} className="px-8 font-bold rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                    {vehicleToEdit ? 'Save Changes' : 'Launch Vehicle'}
                 </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}