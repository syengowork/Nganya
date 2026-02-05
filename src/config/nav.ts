// src/config/nav.ts
import { LayoutDashboard, Car, CalendarClock, Settings, User, LogOut } from 'lucide-react';

export const navConfig = {
  sacco: [
    { title: 'Overview', href: '/dashboard/sacco', icon: LayoutDashboard },
    { title: 'My Fleet', href: '/dashboard/sacco/fleet', icon: Car },
    { title: 'Bookings', href: '/dashboard/sacco/bookings', icon: CalendarClock },
    { title: 'Settings', href: '/dashboard/sacco/settings', icon: Settings },
  ],
  user: [
    { title: 'Explore', href: '/dashboard/explore', icon: Car },
    { title: 'My Trips', href: '/dashboard/trips', icon: CalendarClock },
    { title: 'Profile', href: '/dashboard/profile', icon: User },
  ],
};