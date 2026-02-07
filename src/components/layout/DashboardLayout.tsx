'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { navConfig } from '@/config/nav';
import { Menu, Moon, Sun, ChevronLeft, ChevronRight, Zap, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole: 'sacco' | 'user';
  defaultCollapsed?: boolean; // New Prop
}

export default function DashboardLayout({ 
  children, 
  userRole, 
  defaultCollapsed = false 
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();
  
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
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans transition-colors duration-300">
      
      {/* --- MOBILE HEADER (Visible only on mobile) --- */}
      <header className="md:hidden h-16 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground"><Menu className="h-5 w-5" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
            <div className="flex flex-col h-full">
               <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
                  <div className="text-xl font-black tracking-tighter flex items-center gap-2 font-street text-sidebar-foreground">
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
                           "w-full justify-start gap-3 mb-1 font-medium transition-all",
                           isActive 
                             ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                             : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                         )}
                       >
                         <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-sidebar-foreground/60")} /> 
                         {link.title}
                       </Button>
                     </Link>
                   );
                 })}
               </nav>

               {/* Mobile Footer */}
               <div className="p-4 border-t border-sidebar-border">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50">
                    <Avatar className="h-10 w-10 border border-sidebar-border">
                      <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">US</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate">User Account</p>
                      <p className="text-xs text-muted-foreground truncate">{userRole === 'sacco' ? 'Admin' : 'Passenger'}</p>
                    </div>
                  </div>
               </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <span className="font-bold text-lg tracking-tight font-street">NganyaOps</span>
        
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
        </Button>
      </header>

      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out sticky top-0 h-screen shadow-xl z-40",
          isSidebarCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border justify-between bg-sidebar">
           {!isSidebarCollapsed && (
             <span className="font-black text-xl flex items-center gap-2 font-street tracking-wide animate-in fade-in duration-300">
                <Zap className="text-primary fill-primary w-6 h-6"/> NganyaOps
             </span>
           )}
           {isSidebarCollapsed && (
             <div className="w-full flex justify-center">
                <Zap className="text-primary fill-primary w-8 h-8" />
             </div>
           )}
        </div>

        {/* Toggle Button (Floating overlap) */}
        <div className="absolute -right-3 top-20 z-50">
           <Button 
             variant="outline" 
             size="icon" 
             onClick={toggleSidebar} 
             className="h-6 w-6 rounded-full border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md hover:bg-sidebar-accent"
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
                    "w-full transition-all duration-200 group relative",
                    isSidebarCollapsed ? "justify-center px-0 h-12 w-12 mx-auto" : "justify-start gap-3 px-4 py-6",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm font-bold border-l-4 border-primary rounded-l-sm" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  title={isSidebarCollapsed ? link.title : undefined}
                >
                  <link.icon className={cn(
                    "transition-transform group-hover:scale-110",
                    isActive ? "text-primary h-5 w-5" : "text-sidebar-foreground/70 h-5 w-5",
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
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
            <div className={cn("flex items-center gap-2 mb-4", isSidebarCollapsed ? "justify-center" : "")}>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full hover:bg-sidebar-accent text-sidebar-foreground">
                  <Sun className="h-5 w-5 dark:hidden" />
                  <Moon className="h-5 w-5 hidden dark:block" />
                </Button>
                {!isSidebarCollapsed && <span className="text-xs font-medium text-sidebar-foreground/60">Switch Theme</span>}
            </div>
            
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent border border-sidebar-border/50">
                <Avatar className="h-9 w-9 rounded-lg border border-sidebar-border">
                  <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold rounded-lg">US</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate text-sidebar-foreground">My Account</p>
                  <p className="text-xs text-sidebar-foreground/60 truncate capitalize">{userRole}</p>
                </div>
                <LogOut className="w-4 h-4 text-sidebar-foreground/50 hover:text-destructive cursor-pointer" />
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        {links.slice(0, 4).map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href} className="flex flex-col items-center justify-center w-full h-full group">
               <div className={cn(
                 "flex flex-col items-center gap-1 transition-all", 
                 isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
               )}>
                  <link.icon className={cn("h-6 w-6", isActive && "fill-primary/20")} />
                  <span className="text-[10px] font-bold tracking-wide">{link.title}</span>
               </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}