'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleWizard } from '@/components/dashboard/sacco/VehicleWizard';
import { deleteVehicleAction } from '@/actions/vehicle';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Edit2, Trash2, Search, Plus, CarFront, AlertCircle, Loader2, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";

// Define strict types matching your DB
interface Vehicle {
  id: string;
  name: string;
  plate_number: string;
  capacity: number;
  rate_per_hour: number;
  cover_photo: string; // The DB returns 'image_url' aliased or 'cover_photo' depending on query
  image_url?: string;  // Fallback if your select query uses raw column name
  is_available: boolean;
  features: string[];
  description?: string;
  exterior_photos?: string[];
  interior_photos?: string[];
}

interface FleetClientProps {
  initialVehicles: Vehicle[];
}

export default function FleetClient({ initialVehicles }: FleetClientProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Delete States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // --- FILTER LOGIC ---
  const filteredVehicles = vehicles.filter((car) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      car.name.toLowerCase().includes(searchLower) || 
      car.plate_number.toLowerCase().includes(searchLower);
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'available' ? car.is_available :
      !car.is_available; 

    return matchesSearch && matchesStatus;
  });

  // --- HANDLERS ---

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    // Map DB fields to Wizard Form Schema
    // Ensure we handle both 'image_url' (DB column) and 'cover_photo' (UI prop)
    const mapped = {
        id: vehicle.id,
        name: vehicle.name,
        plate_number: vehicle.plate_number,
        rate_per_hour: vehicle.rate_per_hour,
        capacity: vehicle.capacity,
        description: vehicle.description || '',
        // Handle images: Wizard expects File[] for new uploads, but string for existing
        // We will pass the string URL so the Wizard can display a preview
        cover_photo_url: vehicle.cover_photo || vehicle.image_url, 
        exterior_photos_urls: vehicle.exterior_photos || [],
        interior_photos_urls: vehicle.interior_photos || [],
        features: vehicle.features || []
    };
    setSelectedVehicle(mapped);
    setIsModalOpen(true);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const executeDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    // 1. Optimistic Update (Remove immediately from UI)
    const previousVehicles = [...vehicles];
    setVehicles(v => v.filter(c => c.id !== deleteId));
    setDeleteId(null); // Close modal

    // 2. Server Action
    const result = await deleteVehicleAction(deleteId);

    if (result.status === 'error') {
      // Revert if failed
      setVehicles(previousVehicles);
      alert(result.message); // Simple alert fallback or use toast
    } else {
      // 3. Sync with Server
      router.refresh(); 
    }
    setIsDeleting(false);
  };

  const onWizardClose = () => {
    setIsModalOpen(false);
    // Refresh data to show new/edited vehicle
    router.refresh(); 
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black tracking-tighter">Fleet Management</h2>
           <p className="text-muted-foreground">
             <span className="font-semibold text-foreground">{vehicles.length}</span> vehicles total • <span className="text-green-600">{vehicles.filter(v => v.is_available).length} active</span>
           </p>
        </div>
        <Button onClick={handleCreate} size="lg" className="shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
          <Plus className="mr-2 h-5 w-5" /> Add New Nganya
        </Button>
      </div>

      {/* --- CONTROLS --- */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-2 rounded-2xl border shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or plate..." 
            className="pl-10 border-none bg-muted/50 focus-visible:ring-0 focus-visible:bg-muted transition-colors h-10 rounded-xl" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="h-6 w-px bg-border hidden sm:block" />

        <Tabs defaultValue="all" onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-transparent p-0 gap-2 h-10">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-full px-4">All</TabsTrigger>
            <TabsTrigger value="available" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600 rounded-full px-4">Active</TabsTrigger>
            <TabsTrigger value="booked" className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-600 rounded-full px-4">Booked</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* --- VEHICLE LIST --- */}
      {filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 border-2 border-dashed rounded-3xl bg-muted/20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <CarFront className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">No vehicles found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {searchQuery ? "Try adjusting your search terms to find your vehicle." : "Your fleet is empty. Add your first Nganya to get started."}
            </p>
          </div>
          {!searchQuery && <Button variant="outline" onClick={handleCreate}>Create Vehicle</Button>}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((car) => (
              <motion.div
                key={car.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <AccordionItem value={car.id} className="border rounded-2xl px-2 bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-4 px-2">
                    <div className="flex items-center gap-4 w-full text-left pr-4">
                      {/* Image Avatar */}
                      <Avatar className="h-14 w-14 rounded-xl border-2 border-border shadow-sm">
                        <AvatarImage src={car.cover_photo || car.image_url} className="object-cover" />
                        <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold">
                          {car.plate_number.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Info Block */}
                      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <h4 className="font-bold text-lg truncate leading-tight">{car.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span className="font-mono font-medium bg-muted px-1.5 py-0.5 rounded text-foreground">{car.plate_number}</span>
                            <span>•</span>
                            <span>{car.capacity} Seats</span>
                          </div>
                        </div>
                        
                        {/* Status Badges (Visible on Desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                           <Badge variant="outline" className="bg-background/50">
                              KES {car.rate_per_hour}/hr
                           </Badge>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <Badge 
                        variant={car.is_available ? 'default' : 'secondary'} 
                        className={cn(
                          "mr-2 whitespace-nowrap px-3 py-1",
                          car.is_available 
                            ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" 
                            : "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200"
                        )}
                      >
                        {car.is_available ? (
                          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active</span>
                        ) : (
                          <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Booked</span>
                        )}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pb-4 pt-0 px-2">
                    <div className="bg-muted/30 rounded-xl p-6 mt-2 border border-border/50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                            <div className="space-y-1.5">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Pricing</p>
                                <p className="font-bold text-xl">KES {car.rate_per_hour?.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Highlights</p>
                                <div className="flex flex-wrap gap-1">
                                    {car.features?.length 
                                      ? car.features.slice(0, 3).map(f => <span key={f} className="bg-background border px-1.5 py-0.5 rounded text-xs">{f}</span>) 
                                      : <span className="text-muted-foreground italic">Standard</span>}
                                    {car.features?.length > 3 && <span className="text-xs text-muted-foreground">+{car.features.length - 3} more</span>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Description</p>
                                <p className="text-muted-foreground line-clamp-2">{car.description || "No description provided."}</p>
                            </div>
                            <div className="flex items-end justify-end gap-3 h-full">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={(e) => confirmDelete(e, car.id)}
                                  className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10 hover:border-destructive/30"
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/> Delete
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  onClick={() => handleEdit(car)}
                                  className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/10"
                                >
                                    <Edit2 className="w-4 h-4 mr-2"/> Edit Details
                                </Button>
                            </div>
                        </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </Accordion>
      )}

      {/* --- WIZARD MODAL --- */}
      <VehicleWizard 
        isOpen={isModalOpen} 
        onClose={onWizardClose} 
        vehicleToEdit={selectedVehicle}
      />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5"/> Delete Vehicle?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently remove the vehicle 
              <span className="font-semibold text-foreground"> {vehicles.find(v => v.id === deleteId)?.plate_number} </span>
              from your fleet and database.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={executeDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Trash2 className="w-4 h-4 mr-2"/>}
              Delete Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}