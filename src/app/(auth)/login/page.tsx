import { LoginForm } from '@/components/auth/LoginForm';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      
      {/* LEFT SIDE: Visual Hook (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-muted relative items-center justify-center overflow-hidden border-r border-border">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-50">
           <Image 
             src="/nganya1.jpg" // Ensure this image exists in public/
             alt="Nganya Culture" 
             fill 
             className="object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105"
             priority
           />
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 p-12 text-foreground/90 bg-background/80 backdrop-blur-md rounded-2xl border border-border shadow-2xl max-w-lg text-center">
          <h1 className="text-4xl font-black tracking-tighter mb-4 font-street">
            NGANYA<span className="text-primary">OPS</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The intelligent operating system for Kenya's vibrant transport culture. 
            Manage fleets, bookings, and analytics in one place.
          </p>
        </div>

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
      </div>

      {/* RIGHT SIDE: Functional Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
           <Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
             <Link href="/"><ChevronLeft className="w-4 h-4" /> Back to Home</Link>
           </Button>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight font-street">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>
          
          {/* The Login Form Component */}
          <LoginForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}