'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { NavItemIcon } from '@/components/navigation/NavItemIcon';
import { NotificationBell } from '@/components/notification-bell';

interface AdminSidebarItem {
  label: string;
  href: string;
  iconName: string;
  section?: string;
}

interface AdminDashboardSidebarProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string | null;
  onLogout?: () => void;
}

export default function AdminDashboardSidebar({
  userName = 'Admin',
  userEmail = 'admin@example.com',
  userAvatar,
  onLogout,
}: AdminDashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems: AdminSidebarItem[] = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      iconName: 'home',
      section: 'main',
    },
    {
      label: 'Guide Verification',
      href: '#',
      iconName: 'alertCircle',
      section: 'verification-header',
    },
    {
      label: 'Pending Guides',
      href: '/admin/dashboard?tab=pending',
      iconName: 'clock',
      section: 'verification',
    },
    {
      label: 'Approved Guides',
      href: '/admin/dashboard?tab=approved',
      iconName: 'checkCircle2',
      section: 'verification',
    },
    {
      label: 'Rejected Guides',
      href: '/admin/dashboard?tab=rejected',
      iconName: 'xCircle',
      section: 'verification',
    },
    {
      label: 'Management',
      href: '#',
      iconName: 'users',
      section: 'management-header',
    },
    {
      label: 'Tourists',
      href: '/admin/dashboard?tab=tourists',
      iconName: 'users',
      section: 'management',
    },
    {
      label: 'Bookings',
      href: '/admin/dashboard?tab=bookings',
      iconName: 'calendar',
      section: 'management',
    },
    {
      label: 'Ratings & Reviews',
      href: '/admin/my-ratings',
      iconName: 'star',
      section: 'main',
    },
  ];

  const isActive = (href: string): boolean => {
    if (href === '#') return false;
    if (href.includes('?')) {
      return pathname === href.split('?')[0] && window.location.search.includes(href.split('?')[1]);
    }
    return pathname.startsWith(href);
  };

  const getSectionLabel = (section?: string): string | null => {
    if (section === 'verification-header') return 'Guide Verification';
    if (section === 'management-header') return 'Management';
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 text-slate-100 border-r border-slate-800">
      {/* ===== HEADER ===== */}
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/40 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Admin Portal</p>
              <p className="text-xs text-slate-400 truncate">Management</p>
            </div>
          </div>
          {/* Notification Bell */}
          <div className="flex-shrink-0">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* ===== NAVIGATION (Scrollable) ===== */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5">
        {menuItems.map((item, idx) => {
          const sectionLabel = getSectionLabel(item.section);
          const active = isActive(item.href);
          const isHeader = item.section?.includes('header');

          // Render section header
          if (sectionLabel) {
            return (
              <div key={`section-${idx}`} className="px-2 pt-4 pb-2 first:pt-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {sectionLabel}
                </p>
              </div>
            );
          }

          // Skip section header items from rendering as links
          if (isHeader) {
            return null;
          }

          // Render nested items with indent
          const isNested = item.section === 'verification' || item.section === 'management';

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${isNested ? 'ml-3' : ''}
                ${
                  active
                    ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-slate-100'
                }
              `}
            >
              <div className={`flex-shrink-0 ${active ? 'text-red-400' : 'text-slate-400'}`}>
                <NavItemIcon iconName={item.iconName} />
              </div>
              <span className="text-sm font-medium truncate">{item.label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center flex-shrink-0 text-white font-semibold text-xs">
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-900/50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Logout</span>
          </button>
        )}
      </div>
    </div>
  );
}
