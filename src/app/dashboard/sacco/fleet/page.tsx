'use client';


import { useState } from 'react';
import { VehicleModal } from '@/components/dashboard/sacco/VehicleModal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Trash2 } from 'lucide-react';

// Mock Data (In reality, this comes from Supabase)
const vehicles = [
  { id: '1', name: 'Catalyst', plate: 'KDC 123A', status: 'Available', rate: 1500, capacity: 33, img: '/nganya1.jpg' },
  { id: '2', name: 'Bumblebee', plate: 'KDD 999Z', status: 'Booked', rate: 2000, capacity: 14, img: '/nganya2.jpg' },
  { id: '3', name: '007', plate: 'KCY 456B', status: 'Maintenance', rate: 1200, capacity: 33, img: '/nganya3.jpg' },
];

export default function FleetManager() {
  // State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleEdit = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };


  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold">My Fleet</h2>
           <p className="text-sm text-muted-foreground">Manage your vehicles and availability.</p>
        </div>
        {/* Trigger the Modal */}
        <Button onClick={handleCreate}>+ Add New Nganya</Button>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {vehicles.map((car) => (
          <AccordionItem key={car.id} value={car.id} className="border rounded-lg px-4 bg-card">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-4 w-full text-left">
                {/* Thumbnail */}
                <Avatar className="h-10 w-10 rounded-md">
                   <AvatarImage src={car.img} />
                   <AvatarFallback>NG</AvatarFallback>
                </Avatar>
                
                {/* Main Info */}
                <div className="flex-1">
                  <h4 className="font-semibold text-sm md:text-base">{car.name}</h4>
                  <span className="text-xs text-muted-foreground uppercase">{car.plate}</span>
                </div>

                {/* Status Badge (Visible on collapse) */}
                <Badge variant={car.status === 'Available' ? 'default' : 'secondary'} className="mr-2">
                  {car.status}
                </Badge>
              </div>
            </AccordionTrigger>
            
            <AccordionContent className="pb-4 pt-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4 border-t pt-4">
                 <div>
                    <p className="text-muted-foreground text-xs">Hourly Rate</p>
                    <p className="font-medium">KES {car.rate}</p>
                 </div>
                 <div>
                    <p className="text-muted-foreground text-xs">Capacity</p>
                    <p className="font-medium">{car.capacity} Pass</p>
                 </div>
                 <div>
                    <p className="text-muted-foreground text-xs">Total Trips</p>
                    <p className="font-medium">124</p>
                 </div>
                 <div>
                    <p className="text-muted-foreground text-xs">Next Service</p>
                    <p className="font-medium">In 14 Days</p>
                 </div>
              </div>

              <div className="flex justify-end gap-2">
                 <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4 mr-2"/> Remove</Button>
                 <Button size="sm" onClick={() => handleEdit(car)}><Edit2 className="w-4 h-4 mr-2"/> Edit Details</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

        <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        vehicleToEdit={selectedVehicle}
      />

    </div>
  );
}