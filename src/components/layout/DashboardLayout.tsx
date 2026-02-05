'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navConfig } from '@/config/nav';
import { Menu, Moon, Sun, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useTheme } from 'next-themes';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'sacco' | 'user'; // We pass the role to decide which links to show
}

export default function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const links = navConfig[userRole];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* --- MOBILE HEADER (Visible only on mobile) --- */}
      <header className="md:hidden h-16 border-b flex items-center justify-between px-4 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col gap-6 mt-8">
               <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                  <Zap className="text-primary fill-primary" /> NganyaOps
               </div>
               <nav className="flex flex-col gap-2">
                 {links.map((link) => (
                   <Link key={link.href} href={link.href}>
                     <Button variant={pathname === link.href ? 'secondary' : 'ghost'} className="w-full justify-start gap-3">
                       <link.icon className="h-4 w-4" /> {link.title}
                     </Button>
                   </Link>
                 ))}
               </nav>
            </div>
          </SheetContent>
        </Sheet>
        
        <span className="font-bold text-lg tracking-tight">NganyaOps</span>
        
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </header>

      {/* --- DESKTOP SIDEBAR (Hidden on mobile) --- */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-300 ease-in-out sticky top-0 h-screen",
          isSidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className="h-16 flex items-center px-4 border-b justify-between">
           {!isSidebarCollapsed && (
             <span className="font-bold text-xl flex items-center gap-2"><Zap className="text-primary fill-primary"/> NganyaOps</span>
           )}
           <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="ml-auto">
             {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
           </Button>
        </div>

        <nav className="flex-1 p-2 gap-2 flex flex-col">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button 
                variant={pathname === link.href ? 'secondary' : 'ghost'} 
                className={cn("w-full justify-start", isSidebarCollapsed ? "justify-center px-2" : "gap-3 px-4")}
              >
                <link.icon className="h-5 w-5" />
                {!isSidebarCollapsed && <span>{link.title}</span>}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Desktop Theme Toggle at bottom */}
        <div className="p-4 border-t flex justify-center">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-5 w-5 dark:hidden" />
              <Moon className="h-5 w-5 hidden dark:block" />
            </Button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-16 md:mb-0">
        {children}
      </main>

      {/* --- MOBILE BOTTOM NAV (Visible only on mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex items-center justify-around px-2 z-50 pb-safe">
        {links.slice(0, 4).map((link) => ( // Only show first 4 links to prevent crowding
          <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full">
             <div className={cn("flex flex-col items-center gap-1", pathname === link.href ? "text-primary" : "text-muted-foreground")}>
                <link.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{link.title}</span>
             </div>
          </Link>
        ))}
      </nav>
    </div>
  );
}