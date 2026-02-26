'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, LayoutDashboard, User, Edit, Home, Star, Clock, CheckCircle2, History, Calendar, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notification-bell';

interface GuideSidebarProps {
  onLogout: () => void;
  guideName?: string;
}

export default function GuideSidebar({ onLogout, guideName }: GuideSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/guide/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      section: 'Bookings',
      items: [
        {
          href: '/guide/booking-requests',
          label: 'Booking Requests',
          icon: Clock,
        },
        {
          href: '/guide/confirmed-bookings',
          label: 'Confirmed Bookings',
          icon: CheckCircle2,
        },
        {
          href: '/guide/past-bookings',
          label: 'Past Trips',
          icon: History,
        },
        {
          href: '/guide/my-ratings',
          label: 'Ratings',
          icon: Star,
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          href: '/guide/availability',
          label: 'Availability',
          icon: Calendar,
        },
        {
          href: '/guide/itinerary',
          label: 'Itinerary',
          icon: MapPin,
        },
      ],
    },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/guide/dashboard" className="flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-foreground">GuideVerify</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell className="text-slate-700 dark:text-slate-300" />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              suppressHydrationWarning
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="border-t border-border bg-slate-50 dark:bg-slate-800 px-4 py-4 space-y-4">
            {menuItems.map((item: any, idx) => (
              <div key={idx}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                      isActive(item.href)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                        : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <>
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.section}</p>
                    <div className="space-y-1">
                      {item.items.map((subItem: any) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm',
                            isActive(subItem.href)
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                              : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground'
                          )}
                        >
                          <subItem.icon className="w-4 h-4" />
                          <span>{subItem.label}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-start"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </nav>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-64 h-screen bg-white dark:bg-slate-900 border-r border-border z-40">
        {/* Logo */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/guide/dashboard" className="flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold text-foreground">GuideVerify</span>
          </Link>
          <NotificationBell className="text-slate-700 dark:text-slate-300" />
        </div>
        {guideName && (
          <p className="text-sm text-muted-foreground px-6 py-2 truncate">Welcome, {guideName}</p>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {menuItems.map((item: any, idx) => (
            <div key={idx}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                      : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <>
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.section}</p>
                  <div className="space-y-1">
                    {item.items.map((subItem: any) => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm text-left',
                          isActive(subItem.href)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                            : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                        )}
                      >
                        <subItem.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{subItem.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="w-full gap-2 justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Content Offset for Desktop */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
