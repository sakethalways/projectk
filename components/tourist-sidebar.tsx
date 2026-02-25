'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  MapPin,
  Compass,
  Calendar,
  History,
  Bookmark,
  Star,
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export function TouristSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/tourist/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Explore Guides',
      href: '/tourist/explore-guides',
      icon: Compass,
    },
    {
      label: 'Saved Guides',
      href: '/tourist/saved-guides',
      icon: Bookmark,
    },
    {
      label: 'Booking Status',
      href: '/tourist/booking-status',
      icon: Calendar,
    },
    {
      label: 'Past Bookings',
      href: '/tourist/past-bookings',
      icon: History,
    },
    {
      label: 'My Ratings & Reviews',
      href: '/tourist/my-ratings',
      icon: Star,
    },
  ];

  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900 text-foreground">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm truncate">Tourist</p>
            <p className="text-xs text-muted-foreground truncate">Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? 'default' : 'ghost'}
                className={`w-full justify-start text-xs sm:text-sm gap-2 ${
                  active
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'hover:bg-emerald-100 dark:hover:bg-emerald-800'
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 sm:px-4 py-2">
        <div className="h-px bg-emerald-200 dark:bg-emerald-800"></div>
      </div>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-emerald-200 dark:border-emerald-800">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-xs sm:text-sm text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </div>
    </div>
  );

  // Desktop Sidebar
  if (!isMobile) {
    return (
      <div className="w-48 sm:w-56 border-r border-border flex flex-col">
        <SidebarContent />
      </div>
    );
  }

  // Mobile Sidebar (Sheet)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-40 md:hidden"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-56">
        <VisuallyHidden>
          <SheetTitle>Tourist Navigation Menu</SheetTitle>
        </VisuallyHidden>
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}
