import { RegisterForm } from '@/components/auth/RegisterForm';
import Image from 'next/image';

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex">
      
      {/* LEFT SIDE: Functional Area (Swapped position) */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background relative z-20">
        <RegisterForm />
      </div>

      {/* RIGHT SIDE: Visual Hook */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-60">
           <Image 
             src="/nganya2.jpg" // Use a different vibe image for signup
             alt="Nganya Road Trip" 
             fill 
             className="object-cover transition-transform duration-1000 hover:scale-105"
             priority
           />
        </div>
        
        <div className="relative z-10 p-12 text-white text-right">
          <h1 className="text-5xl font-black tracking-tighter mb-4">
            START YOUR <br/> <span className="text-primary">JOURNEY</span>
          </h1>
          <p className="text-xl text-white/80 max-w-md ml-auto leading-relaxed">
            Book the hottest rides, create unforgettable road trip memories, and travel in style.
          </p>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
      </div>
      
    </div>
  );
}