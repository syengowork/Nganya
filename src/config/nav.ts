// src/config/nav.ts
import { LayoutDashboard, Home, Car, CalendarClock, Settings, User, LogOut } from 'lucide-react';

export const navConfig = {
  sacco: [
    { title: 'Overview', href: '/dashboard/sacco', icon: LayoutDashboard },
    { title: 'My Fleet', href: '/dashboard/sacco/fleet', icon: Car },
    { title: 'Bookings', href: '/dashboard/sacco/bookings', icon: CalendarClock },
    { title: 'Settings', href: '/dashboard/sacco/settings', icon: Settings },
  ],
  user: [
    { title: 'Home', href: '/dashboard/user', icon: Home },
    { title: 'Explore', href: '/dashboard/user/explore', icon: Car },
    { title: 'My Trips', href: '/dashboard/user/trips', icon: CalendarClock },
    { title: 'Profile', href: '/dashboard/user/profile', icon: User },
  ],
};