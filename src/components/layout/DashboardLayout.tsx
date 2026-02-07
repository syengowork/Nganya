'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { navConfig } from '@/config/nav';
import { Menu, ChevronLeft, ChevronRight, Zap, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle'; // Import the new Brain

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'sacco' | 'user';
  defaultCollapsed?: boolean;
}

export default function DashboardLayout({ 
  children, 
  userRole, 
  defaultCollapsed = false 
}: DashboardLayoutProps) {
  const pathname = usePathname();
  
  // Initialize state from Server Cookie (No hydration mismatch)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);

  const links = navConfig[userRole];

  // Function to toggle and save preference
  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    // Save to cookie for 1 year
    document.cookie = `sidebar:state=${newState}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans transition-colors duration-300 selection:bg-primary/20">
      
      {/* --- MOBILE HEADER (Visible only on mobile) --- */}
      <header className="md:hidden h-16 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
            <div className="flex flex-col h-full">
               <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50">
                  <div className="text-xl font-black tracking-tighter flex items-center gap-2 font-street text-foreground">
                     <Zap className="text-primary fill-primary w-6 h-6" /> NganyaOps
                  </div>
               </div>
               
               {/* Mobile Nav Links */}
               <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                 {links.map((link) => {
                   const isActive = pathname === link.href;
                   return (
                     <Link key={link.href} href={link.href}>
                       <Button 
                         variant="ghost" 
                         className={cn(
                           "w-full justify-start gap-3 mb-1 font-medium transition-all duration-200",
                           isActive 
                             ? "bg-sidebar-accent text-primary shadow-sm ring-1 ring-border/50" 
                             : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                         )}
                       >
                         <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} /> 
                         {link.title}
                       </Button>
                     </Link>
                   );
                 })}
               </nav>

               {/* Mobile Footer */}
               <div className="p-4 border-t border-sidebar-border/50">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/30">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">US</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">User Account</p>
                      <p className="text-xs text-muted-foreground truncate capitalize">{userRole === 'sacco' ? 'Admin' : 'Passenger'}</p>
                    </div>
                  </div>
               </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <span className="font-bold text-lg tracking-tight font-street text-foreground">NganyaOps</span>
        
        {/* Intelligent Theme Toggle (Mobile) */}
        <ThemeToggle />
      </header>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out sticky top-0 h-screen shadow-2xl z-40",
          isSidebarCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-sidebar-border/50 bg-sidebar transition-all duration-300",
          isSidebarCollapsed ? "justify-center px-0" : "justify-between px-6"
        )}>
           {!isSidebarCollapsed ? (
             <span className="font-black text-xl flex items-center gap-2 font-street tracking-wide animate-in fade-in slide-in-from-left-2 duration-300 text-foreground">
                <Zap className="text-primary fill-primary w-6 h-6"/> NganyaOps
             </span>
           ) : (
             <div className="flex justify-center animate-in fade-in zoom-in duration-300">
                <Zap className="text-primary fill-primary w-8 h-8" />
             </div>
           )}
        </div>

        {/* Toggle Button (Floating) */}
        <div className="absolute -right-3 top-20 z-50">
           <Button 
             variant="outline" 
             size="icon" 
             onClick={toggleSidebar} 
             className="h-6 w-6 rounded-full border-border bg-background text-foreground shadow-md hover:bg-accent hover:text-accent-foreground transition-all"
           >
             {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
           </Button>
        </div>

        {/* Desktop Nav Links */}
        <nav className="flex-1 p-3 gap-1 flex flex-col overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full transition-all duration-200 group relative overflow-hidden",
                    isSidebarCollapsed ? "justify-center px-0 h-12 w-12 mx-auto" : "justify-start gap-3 px-4 py-6",
                    isActive 
                      ? "bg-sidebar-accent text-primary shadow-sm font-bold border-l-4 border-primary rounded-l-none" 
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                  title={isSidebarCollapsed ? link.title : undefined}
                >
                  <link.icon className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-primary h-5 w-5" : "text-muted-foreground/80 h-5 w-5",
                    isSidebarCollapsed ? "h-6 w-6" : ""
                  )} />
                  
                  {!isSidebarCollapsed && (
                    <span className="text-sm tracking-wide">{link.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5">
            <div className={cn("flex items-center gap-2 mb-4", isSidebarCollapsed ? "justify-center" : "justify-between px-2")}>
                {/* Intelligent Theme Toggle (Desktop) */}
                <ThemeToggle />
                {!isSidebarCollapsed && <span className="text-xs font-medium text-muted-foreground">Appearance</span>}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:border-primary/20 group">
                <Avatar className="h-9 w-9 rounded-lg border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg">US</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate text-foreground">My Account</p>
                  <p className="text-xs text-muted-foreground truncate capitalize group-hover:text-primary transition-colors">{userRole}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                   <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
           {children}
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV (Visible only on mobile) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {links.slice(0, 4).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full group">
               <div className={cn(
                 "flex flex-col items-center gap-1 transition-all", 
                 isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
               )}>
                  <link.icon className={cn("h-5 w-5", isActive && "fill-current")} />
                  <span className="text-[10px] font-bold tracking-wide">{link.title}</span>
               </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}