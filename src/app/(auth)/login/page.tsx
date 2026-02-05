import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      
      {/* LEFT SIDE: Visual Hook (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-60">
           {/* Replace '/matatu-art.jpg' with your actual image path */}
           <Image 
             src="/nganya1.jpg" // Using one of your existing mock images
             alt="Nganya Culture" 
             fill 
             className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105"
             priority
           />
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 p-12 text-white">
          <h1 className="text-6xl font-black tracking-tighter mb-4">
            NGANYA<span className="text-primary">OPS</span>
          </h1>
          <p className="text-xl text-white/80 max-w-md leading-relaxed">
            The intelligent operating system for Kenya's vibrant transport culture. 
            Manage fleets, bookings, and analytics in one place.
          </p>
        </div>

        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* RIGHT SIDE: Functional Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <LoginForm />
      </div>
      
    </div>
  );
}