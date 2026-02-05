'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';

// 1. Zod Schema for Validation
const vehicleSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  plate_number: z.string().min(6, "Invalid Plate Number").regex(/^[A-Z]{3} \d{3}[A-Z]$/, "Format: KBC 123A"),
  capacity: z.coerce.number().min(1, "Capacity required"),
  rate_per_hour: z.coerce.number().min(100, "Minimum rate is KES 100"),
  features: z.string().optional(), // We'll parse comma-separated string for now
  // In a real app, image validation happens here too
});

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleToEdit?: any; // If null, we are in "Create Mode"
}

export function VehicleModal({ isOpen, onClose, vehicleToEdit }: VehicleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(vehicleToEdit?.img || null);

  // 2. Initialize Form
  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: vehicleToEdit?.name || '',
      plate_number: vehicleToEdit?.plate || '',
      capacity: vehicleToEdit?.capacity || 33,
      rate_per_hour: vehicleToEdit?.rate || 1500,
      features: '',
    },
  });

  // 3. Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 4. Handle Submit
  async function onSubmit(values: z.infer<typeof vehicleSchema>) {
    setIsSubmitting(true);
    // Simulate API Call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Submitting:", values);
    
    setIsSubmitting(false);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* THE GLASS EFFECT:
         bg-background/80 -> 80% opacity background
         backdrop-blur-xl -> heavy blur on whatever is behind it
         border-white/20 -> subtle border for depth 
      */}
      <DialogContent className="sm:max-w-[600px] bg-background/80 backdrop-blur-xl border border-white/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{vehicleToEdit ? 'Edit Nganya Details' : 'Add New Nganya'}</DialogTitle>
          <DialogDescription>
            Enter the vehicle details below. This will be visible to all users.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Row 1: Image Upload (The Visual Hook) */}
            <div className="flex flex-col items-center justify-center gap-4 mb-6">
               <div className="relative w-full h-40 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer group">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                      <UploadCloud className="h-10 w-10 mb-2" />
                      <span className="text-xs font-semibold">Tap to upload Nganya Photo</span>
                    </div>
                  )}
               </div>
            </div>

            {/* Row 2: Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Catalyst" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="plate_number" render={({ field }) => (
                <FormItem>
                  <FormLabel>Plate Number</FormLabel>
                  <FormControl><Input placeholder="KCA 123B" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Row 3: Specs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="capacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="rate_per_hour" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hourly Rate (KES)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {vehicleToEdit ? 'Save Changes' : 'Create Vehicle'}
              </Button>
            </div>
            
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}