'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import GuideDashboardSidebar from '@/components/sidebars/GuideDashboardSidebar';
import type { Guide } from '@/lib/supabase-client';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/guide/dashboard', iconName: 'home' },
  { label: 'Calendar', href: '/guide/availability', iconName: 'calendar' },
  { label: 'Bookings', href: '/guide/confirmed-bookings', iconName: 'phone' },
  { label: 'Reviews', href: '/guide/my-ratings', iconName: 'star' },
  { label: 'Profile', href: '/guide/edit-profile', iconName: 'user' },
];

// Wrapper component that checks if it's an auth page
function GuideDashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <GuideDashboardLayoutContent>{children}</GuideDashboardLayoutContent>;
}

// Actual layout component that always calls hooks
function GuideDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadGuide = async () => {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push('/guide/login');
          return;
        }
        const { data: guideData } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
        if (guideData) setGuide(guideData);
      } catch (err) {
        console.error('Error loading guide:', err);
      } finally {
        setLoading(false);
      }
    };
    loadGuide();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('guide_id');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <DashboardLayout
      sidebar={
        <GuideDashboardSidebar
          userName={guide?.name}
          userEmail={guide?.email}
          userAvatar={guide?.profile_picture_url}
          onLogout={handleLogout}
        />
      }
      bottomNav={<BottomNavigation items={BOTTOM_NAV_ITEMS} />}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={setSidebarOpen}
    >
      {children}
    </DashboardLayout>
  );
}

export default function GuideDashboardLayout({ children }: { children: React.ReactNode }) {
  return <GuideDashboardLayoutWrapper>{children}</GuideDashboardLayoutWrapper>;
}
