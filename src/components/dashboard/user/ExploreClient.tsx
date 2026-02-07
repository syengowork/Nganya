'use client';

import { useState } from 'react';
import { VehicleCard } from '@/components/dashboard/user/VehicleCard';
import { CarFront } from 'lucide-react';
import { ExploreFilters } from '@/components/dashboard/user/ExploreFilters';

// Define the shape of the data coming from the server
interface ExploreClientProps {
  vehicles: any[]; // Replace 'any' with your specific Vehicle Type if available
  searchQuery: string;
}

export function ExploreClient({ vehicles, searchQuery }: ExploreClientProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  return (
    <div className="space-y-8">
      {/* Filters live here so they can interact with the client if needed later */}
      <ExploreFilters />

      {/* Grid Content */}
      {vehicles && vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} onClick={() => setSelectedVehicle(vehicle)}>
              {/* We wrap card in a div to capture clicks easily, 
                  OR you can pass an onSelect prop to VehicleCard if you modify it */}
              <div className="cursor-pointer">
                <VehicleCard 
                    vehicle={vehicle} 
                    onClick={() => setSelectedVehicle(vehicle)} // The card now triggers the modal
                    />
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-3xl bg-muted/10">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <CarFront className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No vehicles found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                We couldn't find any vehicles matching "{searchQuery}". Try adjusting your filters.
            </p>
        </div>
      )}
    </div>
  );
}