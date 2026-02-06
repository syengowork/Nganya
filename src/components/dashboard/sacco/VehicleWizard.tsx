'use client';

import { useState, useEffect } from 'react';
import { useForm, UseFormSetValue, FieldErrors, PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, Trash2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { createVehicleAction, updateVehicleAction } from '@/actions/vehicle';

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
}

// --- SCHEMAS ---
const fileSchema = z.custom<File[]>();

// Base schema for shared fields
const baseSchema = z.object({
  name: z.string().min(2, "Name is required"),
  plate_number: z.string().regex(/^[A-Z]{3} \d{3}[A-Z]$/, "Format: KBC 123A"),
  capacity: z.coerce.number().min(1, "Capacity required"),
  rate_per_hour: z.coerce.number().min(100, "Min rate KES 100"),
  features: z.array(z.string()).min(1, "Select at least one feature"),
  description: z.string().min(20, "Tell us more about this Nganya (min 20 chars)"),
  // New files (optional in edit mode, required in create mode via refinement)
  cover_photo: fileSchema.optional(),
  exterior_photos: fileSchema.optional(),
  interior_photos: fileSchema.optional(),
  // Tracking existing images
  kept_exterior: z.array(z.string()).optional(),
  kept_interior: z.array(z.string()).optional(),
});

type VehicleFormValues = z.infer<typeof baseSchema>;

const FEATURES_LIST = ["WiFi", "Sound System", "TV Screens", "VIP Lighting", "CCTV", "AC", "DJ on Board"];

// --- SMART DROPZONE COMPONENT ---
interface ImageDropzoneProps {
  fieldName: 'cover_photo' | 'exterior_photos' | 'interior_photos';
  label: string;
  maxFiles: number;
  form: any; // Passing full form to handle both "new" and "kept" state
  existingUrls?: string[]; // URLs from DB
  keptFieldName?: 'kept_exterior' | 'kept_interior';
}

const ImageDropzone = ({ fieldName, label, maxFiles, form, existingUrls = [], keptFieldName }: ImageDropzoneProps) => {
  const { setValue, watch, formState: { errors } } = form;
  
  // Watch new files
  const newFiles = watch(fieldName) || [];
  // Watch kept existing images (if applicable)
  const keptFiles = keptFieldName ? watch(keptFieldName) : [];

  // Determine total count to enforce limits
  const totalCount = (keptFieldName ? keptFiles.length : (existingUrls.length > 0 && newFiles.length === 0 ? 1 : 0)) + newFiles.length;

  const onDrop = (acceptedFiles: File[]) => {
    const remainingSlots = maxFiles - (keptFieldName ? keptFiles.length : 0);
    if (remainingSlots <= 0) return;

    const filesToAdd = acceptedFiles.slice(0, remainingSlots);
    const updatedNewFiles = maxFiles === 1 ? filesToAdd : [...newFiles, ...filesToAdd];
    
    setValue(fieldName, updatedNewFiles, { shouldValidate: true });
  };

  const removeNewFile = (index: number) => {
    const updated = newFiles.filter((_: File, i: number) => i !== index);
    setValue(fieldName, updated, { shouldValidate: true });
  };

  const removeExisting = (urlToRemove: string) => {
    if (keptFieldName) {
      // Remove from the "kept" array
      const updated = keptFiles.filter((url: string) => url !== urlToRemove);
      setValue(keptFieldName, updated, { shouldValidate: true });
    } else {
      // For single cover photo, we can't "remove" it, only replace it.
      // But we can technically clear the preview if needed.
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {'image/*': []}, 
    maxFiles: maxFiles
  });

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex justify-between">
        {label}
        <span className="text-xs text-muted-foreground">{totalCount}/{maxFiles}</span>
      </label>
      
      {/* Drop Area */}
      {totalCount < maxFiles && (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/20 hover:bg-muted/40",
            isDragActive ? "border-primary bg-primary/5" : "border-border",
            errors[fieldName] ? "border-destructive" : ""
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-6 w-6 mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-medium">Click or drop to upload</p>
        </div>
      )}

      {/* Previews Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Existing Images (Kept) */}
        {keptFieldName && keptFiles.map((url: string, i: number) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
            <Image src={url} alt="Existing" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeExisting(url)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        
        {/* Special Case: Single Cover Photo Existing */}
        {!keptFieldName && existingUrls.length > 0 && newFiles.length === 0 && (
           <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
             <Image src={existingUrls[0]} alt="Current Cover" fill className="object-cover" />
             <div className="absolute bottom-0 w-full bg-black/60 text-white text-[10px] text-center py-1">Current</div>
           </div>
        )}

        {/* 2. New Files */}
        {newFiles.map((file: File, i: number) => (
          <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
            <Image src={URL.createObjectURL(file)} alt="New" fill className="object-cover" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button type="button" variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => removeNewFile(i)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute top-1 right-1">
              <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">NEW</span>
            </div>
          </div>
        ))}
      </div>
      {errors[fieldName] && <p className="text-xs text-destructive">{errors[fieldName]?.message as string}</p>}
    </div>
  );
};


// --- MAIN WIZARD ---
export function VehicleWizard({ isOpen, onClose, vehicleToEdit }: VehicleWizardProps) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState<{status: string, message: string}>({ status: 'idle', message: '' });
  
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(baseSchema), // We use simple schema and refine logic in onSubmit
    defaultValues: { 
      name: '', plate_number: '', capacity: 33, rate_per_hour: 0, description: '', features: [],
      cover_photo: [], exterior_photos: [], interior_photos: [],
      kept_exterior: [], kept_interior: []
    }
  });

  const { register, handleSubmit, formState: { errors, isValid }, trigger, setValue, reset, watch } = form;

  // --- EFFECT: PREFILL FORM ON OPEN ---
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setProgress({ status: 'idle', message: '' });

      if (vehicleToEdit) {
        // EDIT MODE: Populate fields
        reset({
          name: vehicleToEdit.name,
          plate_number: vehicleToEdit.plate_number,
          capacity: vehicleToEdit.capacity,
          rate_per_hour: vehicleToEdit.rate_per_hour,
          description: vehicleToEdit.description || '',
          features: vehicleToEdit.features || [],
          cover_photo: [], // Reset new files
          exterior_photos: [],
          interior_photos: [],
          kept_exterior: vehicleToEdit.exterior_photos_urls || [],
          kept_interior: vehicleToEdit.interior_photos_urls || []
        });
      } else {
        // CREATE MODE: Reset to empty
        reset({
          name: '', plate_number: '', capacity: 33, rate_per_hour: 0, description: '', features: [],
          cover_photo: [], exterior_photos: [], interior_photos: [],
          kept_exterior: [], kept_interior: []
        });
      }
    }
  }, [isOpen, vehicleToEdit, reset]);

  // --- HANDLERS ---
  const handleNext = async () => {
    const fieldsToValidate: any[] = ['name', 'plate_number', 'capacity', 'rate_per_hour'];
    
    // Custom Validation for Cover Photo in Step 1
    const coverNew = watch('cover_photo');
    const hasExistingCover = vehicleToEdit?.cover_photo_url;
    
    if (!hasExistingCover && (!coverNew || coverNew.length === 0)) {
      form.setError('cover_photo', { message: 'Cover photo is required' });
      return; 
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setStep(2);
  };

  const onSubmit = async (data: VehicleFormValues) => {
    setStep(3);
    setProgress({ status: 'processing', message: vehicleToEdit ? 'Updating Vehicle...' : 'Screening & Creating...' });

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('plate_number', data.plate_number);
    formData.append('capacity', data.capacity.toString());
    formData.append('rate_per_hour', data.rate_per_hour.toString());
    formData.append('description', data.description);
    formData.append('features', JSON.stringify(data.features));

    // Handle Cover Photo
    if (data.cover_photo?.[0]) {
      formData.append('cover_photo', data.cover_photo[0]);
    }

    // Handle Arrays (New Files)
    if (data.exterior_photos) Array.from(data.exterior_photos).forEach(f => formData.append('new_exterior_photos', f));
    if (data.interior_photos) Array.from(data.interior_photos).forEach(f => formData.append('new_interior_photos', f));

    // Handle Arrays (Kept URLs - Only for Edit)
    if (vehicleToEdit) {
      formData.append('kept_exterior_photos', JSON.stringify(data.kept_exterior));
      formData.append('kept_interior_photos', JSON.stringify(data.kept_interior));
    }

    let result;
    if (vehicleToEdit) {
      result = await updateVehicleAction(vehicleToEdit.id, null, formData);
    } else {
      result = await createVehicleAction(null, formData);
    }

    if (result.status === 'success') {
      setProgress({ status: 'success', message: 'Operation Successful!' });
      setTimeout(onClose, 1500);
    } else {
      setProgress({ status: 'error', message: result.message });
      setTimeout(() => setStep(2), 2000); // Go back to fix
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-2xl border-white/10 shadow-2xl flex flex-col h-[90vh]">
        <DialogTitle className="sr-only">Vehicle Wizard</DialogTitle>
        
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          {/* Header Progress */}
          <div className="shrink-0 h-1.5 bg-muted w-full relative">
            <motion.div 
              className="h-full bg-primary absolute left-0 top-0" 
              initial={{ width: 0 }} 
              animate={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold">{vehicleToEdit ? 'Edit Identity' : 'Vehicle Identity'}</h2>
                    <p className="text-muted-foreground text-sm">Basic details and registration.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageDropzone 
                      fieldName="cover_photo" 
                      label="Cover Photo" 
                      maxFiles={1} 
                      form={form}
                      existingUrls={vehicleToEdit?.cover_photo_url ? [vehicleToEdit.cover_photo_url] : []}
                    />
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-sm font-medium">Name</label>
                         <Input {...register('name')} placeholder="e.g. Catalyst" />
                         {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium">Plate Number</label>
                         <Input {...register('plate_number')} placeholder="KBA 123A" className="uppercase font-mono" />
                         {errors.plate_number && <p className="text-xs text-destructive">{errors.plate_number.message}</p>}
                      </div>
                      <div className="flex gap-4">
                         <div className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Capacity</label>
                           <Input type="number" {...register('capacity')} />
                         </div>
                         <div className="flex-1 space-y-2">
                           <label className="text-sm font-medium">Rate/Hr</label>
                           <Input type="number" {...register('rate_per_hour')} />
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                   <div>
                    <h2 className="text-2xl font-bold">Features & Photos</h2>
                    <p className="text-muted-foreground text-sm">Interior, exterior, and amenities.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ImageDropzone fieldName="exterior_photos" label="Exterior" maxFiles={4} form={form} keptFieldName="kept_exterior" />
                    <ImageDropzone fieldName="interior_photos" label="Interior" maxFiles={4} form={form} keptFieldName="kept_interior" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Features</label>
                    <div className="grid grid-cols-3 gap-3">
                      {FEATURES_LIST.map(feat => (
                        <div key={feat} className="flex items-center space-x-2 bg-muted/40 p-2 rounded-lg">
                          <Checkbox 
                            id={feat} 
                            checked={watch('features').includes(feat)}
                            onCheckedChange={(checked) => {
                              const current = watch('features');
                              setValue('features', checked ? [...current, feat] : current.filter(f => f !== feat));
                            }}
                          />
                          <label htmlFor={feat} className="text-xs font-medium cursor-pointer w-full">{feat}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea {...register('description')} className="h-20" />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                   <div className="relative w-20 h-20 flex items-center justify-center">
                     {progress.status === 'processing' && <Loader2 className="w-16 h-16 animate-spin text-primary" />}
                     {progress.status === 'success' && <ShieldCheck className="w-16 h-16 text-green-500" />}
                     {progress.status === 'error' && <Trash2 className="w-16 h-16 text-destructive" />}
                   </div>
                   <h3 className="text-xl font-bold">{progress.message}</h3>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          {step < 3 && (
            <div className="p-6 border-t bg-background/95 backdrop-blur flex justify-between">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
              ) : (
                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              )}

              {step === 1 && <Button type="button" onClick={handleNext}>Next Step</Button>}
              {step === 2 && <Button type="submit">{vehicleToEdit ? 'Save Changes' : 'Create Vehicle'}</Button>}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}