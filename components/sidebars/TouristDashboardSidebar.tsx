'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Compass } from 'lucide-react';
import { NavItemIcon } from '@/components/navigation/NavItemIcon';
import { NotificationBell } from '@/components/notification-bell';

interface TouristSidebarItem {
  label: string;
  href: string;
  iconName: string;
}

interface TouristDashboardSidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
}

export default function TouristDashboardSidebar({
  userName = 'Tourist',
  userEmail = 'tourist@example.com',
  userAvatar,
  onLogout,
}: TouristDashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems: TouristSidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/tourist/dashboard',
      iconName: 'home',
    },
    {
      label: 'Explore Guides',
      href: '/tourist/explore-guides',
      iconName: 'compass',
    },
    {
      label: 'Saved Guides',
      href: '/tourist/saved-guides',
      iconName: 'bookmark',
    },
    {
      label: 'Booking Status',
      href: '/tourist/booking-status',
      iconName: 'calendar',
    },
    {
      label: 'Past Bookings',
      href: '/tourist/past-bookings',
      iconName: 'history',
    },
    {
      label: 'My Ratings & Reviews',
      href: '/tourist/my-ratings',
      iconName: 'star',
    },
  ];

  const isActive = (href: string): boolean => {
    return pathname.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-900 via-slate-900 to-slate-950 text-slate-100 border-r border-slate-800">
      {/* ===== HEADER ===== */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/40 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Tourist Portal</p>
              <p className="text-xs text-slate-400 truncate">Explore & Book</p>
            </div>
          </div>
          {/* Notification Bell */}
          <div className="flex-shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION (Scrollable) ===== */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${
                  active
                    ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-500 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                }
              `}
            >
              <div className={`flex-shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`}>
                <NavItemIcon iconName={item.iconName} />
              </div>
              <span className="text-sm font-medium truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ===== DIVIDER ===== */}
      <div className="px-2 py-2">
        <div className="h-px bg-gradient-to-r from-slate-800 via-slate-800 to-transparent" />
      </div>

      {/* ===== FOOTER (User Info + Logout) ===== */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-800/40 backdrop-blur-sm flex-shrink-0">
        {/* User Info */}
        <div className="flex items-center gap-3 px-2 py-2 mb-3 bg-slate-800/30 rounded-lg">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-100 truncate">{userName}</p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-emerald-900/20 hover:text-emerald-400 transition-all duration-200 border border-transparent hover:border-emerald-900/50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
