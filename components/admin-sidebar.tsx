'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, LayoutDashboard, Home, Shield, Star, Clock, CheckCircle2, XCircle, Users, Calendar, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notification-bell';

interface AdminSidebarProps {
  onLogout: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

type MenuItemType = MenuItem | MenuSection;

const isMenuSection = (item: MenuItemType): item is MenuSection => {
  return 'section' in item;
};

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItemType[] = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      section: 'Guide Verification',
      items: [
        {
          href: '/admin/dashboard?tab=pending',
          label: 'Pending',
          icon: Clock,
        },
        {
          href: '/admin/dashboard?tab=approved',
          label: 'Approved',
          icon: CheckCircle2,
        },
        {
          href: '/admin/dashboard?tab=rejected',
          label: 'Rejected',
          icon: XCircle,
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          href: '/admin/dashboard?tab=tourists',
          label: 'Tourists',
          icon: Users,
        },
        {
          href: '/admin/dashboard?tab=bookings',
          label: 'Bookings',
          icon: Calendar,
        },
      ],
    },
    {
      href: '/admin/my-ratings',
      label: 'Ratings & Reviews',
      icon: Star,
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
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-semibold text-foreground">GuideVerify Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
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
            {menuItems.map((item, idx) => {
              if (isMenuSection(item)) {
                // Render section header with items
                return (
                  <div key={`section-${idx}`}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                      {item.section}
                    </p>
                    <div className="space-y-2">
                      {item.items.map((subItem) => {
                        const Icon = subItem.icon;
                        const isItemActive = pathname === subItem.href || (pathname.includes('?tab=') && subItem.href.includes(`?tab=${pathname.split('?tab=')[1]}`));
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                              isItemActive
                                ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-medium'
                                : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground'
                            )}
                          >
                            <Icon className="w-5 h-5" />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                // Render regular menu item
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                      isActive(item.href)
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-medium'
                        : 'text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              }
            })}
            <div className="pt-4 border-t border-border">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full gap-2 justify-start text-destructive hover:text-destructive"
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
          <div className="flex-1">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              <span className="text-xl font-bold text-foreground">Admin Panel</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-2">GuideVerify</p>
          </div>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-6">
          {menuItems.map((item, idx) => {
            if (isMenuSection(item)) {
              // Render section header with items
              return (
                <div key={`section-${idx}`}>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
                    {item.section}
                  </p>
                  <div className="space-y-2">
                    {item.items.map((subItem) => {
                      const Icon = subItem.icon;
                      const isItemActive = pathname === subItem.href || (pathname.includes('?tab=') && subItem.href.includes(`?tab=${pathname.split('?tab=')[1]}`));
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                            isItemActive
                              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-medium'
                              : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              // Render regular menu item
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive(item.href)
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 font-medium'
                      : 'text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            }
          })}
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
