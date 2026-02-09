'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet'; // Added Title/Desc for A11y
import { navConfig } from '@/config/nav';
import { Menu, ChevronLeft, ChevronRight, Zap, LogOut, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createBrowserClient } from '@supabase/ssr'; // For Logout
import { toast } from 'sonner';

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
  const router = useRouter();
  
  // State for Sidebar & Mobile Menu
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(defaultCollapsed);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile Menu State
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const links = navConfig[userRole];

  // --- ACTIONS ---

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    document.cookie = `sidebar:state=${newState}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
      setIsLoggingOut(false);
      return;
    }
    
    toast.success("Logged out successfully");
    router.push('/login');
    router.refresh();
  };

  // --- HELPER: CHECK ACTIVE LINK ---
  // handles exact match for root dashboard, or sub-path match for others
  const isLinkActive = (href: string) => {
    if (href === `/dashboard/${userRole}`) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans transition-colors duration-300 selection:bg-primary/20">
      
      {/* ================= MOBILE HEADER ================= */}
      <header className="md:hidden h-16 border-b border-border/40 flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted/50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col">
            
            {/* Accessibility Titles */}
            <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation links for NganyaOps</SheetDescription>

            <div className="h-16 flex items-center px-6 border-b border-sidebar-border/50 shrink-0">
               <div className="text-xl font-black tracking-tighter flex items-center gap-2 font-street text-foreground">
                  <Zap className="text-primary fill-primary w-6 h-6" /> NganyaOps
               </div>
            </div>
            
            {/* Mobile Links */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
              {links.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start gap-3 mb-1 font-medium transition-all duration-200 h-11",
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
            <div className="p-4 border-t border-sidebar-border/50 shrink-0 bg-sidebar-accent/5">
               <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-sidebar-border/30 shadow-sm mb-3">
                 <Avatar className="h-9 w-9 border border-border">
                   <AvatarFallback className="bg-primary/10 text-primary font-bold">US</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 overflow-hidden">
                   <p className="text-sm font-bold truncate">User Account</p>
                   <p className="text-xs text-muted-foreground truncate capitalize">{userRole === 'sacco' ? 'Admin' : 'Passenger'}</p>
                 </div>
                 <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleLogout} 
                    disabled={isLoggingOut}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4" />
                 </Button>
               </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <span className="font-bold text-lg tracking-tight font-street text-foreground">NganyaOps</span>
        <ThemeToggle />
      </header>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out sticky top-0 h-screen shadow-2xl z-40",
          isSidebarCollapsed ? "w-[80px]" : "w-72"
        )}
      >
        {/* Header */}
        <div className={cn(
          "h-16 flex items-center border-b border-sidebar-border/50 bg-sidebar transition-all duration-300 shrink-0",
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

        {/* Floating Toggle */}
        <div className="absolute -right-3 top-20 z-50">
           <Button 
             variant="outline" 
             size="icon" 
             onClick={toggleSidebar} 
             className="h-6 w-6 rounded-full border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-all"
           >
             {isSidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
           </Button>
        </div>

        {/* Desktop Links */}
        <nav className="flex-1 p-3 gap-1 flex flex-col overflow-y-auto no-scrollbar">
          {links.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full transition-all duration-200 group relative overflow-hidden",
                    isSidebarCollapsed ? "justify-center px-0 h-12 w-12 mx-auto rounded-xl" : "justify-start gap-3 px-4 py-6",
                    isActive 
                      ? "bg-sidebar-accent text-primary shadow-sm font-bold border-l-4 border-primary rounded-l-none" 
                      : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                  )}
                  title={isSidebarCollapsed ? link.title : undefined}
                >
                  <link.icon className={cn(
                    "transition-transform group-hover:scale-110 shrink-0",
                    isActive ? "text-primary h-5 w-5" : "text-muted-foreground/80 h-5 w-5",
                    isSidebarCollapsed ? "h-6 w-6" : ""
                  )} />
                  
                  {!isSidebarCollapsed && (
                    <span className="text-sm tracking-wide truncate">{link.title}</span>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/5 shrink-0">
            <div className={cn("flex items-center gap-2 mb-4", isSidebarCollapsed ? "justify-center" : "justify-between px-2")}>
                <ThemeToggle />
                {!isSidebarCollapsed && <span className="text-xs font-medium text-muted-foreground">Appearance</span>}
            </div>
            
            {!isSidebarCollapsed ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:border-primary/20 group">
                <Avatar className="h-9 w-9 rounded-lg border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg">US</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate text-foreground">My Account</p>
                  <p className="text-xs text-muted-foreground truncate capitalize group-hover:text-primary transition-colors">{userRole}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                   <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
               <div className="flex justify-center">
                  <Button 
                     variant="ghost" 
                     size="icon" 
                     onClick={handleLogout}
                     className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                     title="Logout"
                  >
                     <LogOut className="w-5 h-5" />
                  </Button>
               </div>
            )}
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth no-scrollbar">
           {children}
        </div>
      </main>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-xl border-t border-border flex items-center justify-around px-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {links.slice(0, 4).map((link) => {
          const isActive = isLinkActive(link.href);
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