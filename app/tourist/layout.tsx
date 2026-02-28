'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import TouristDashboardSidebar from '@/components/sidebars/TouristDashboardSidebar';

const BOTTOM_NAV_ITEMS = [
  { label: 'Home', href: '/tourist/dashboard', iconName: 'home' },
  { label: 'Explore', href: '/tourist/explore-guides', iconName: 'compass' },
  { label: 'Bookings', href: '/tourist/booking-status', iconName: 'mapPin' },
  { label: 'Saved', href: '/tourist/saved-guides', iconName: 'heart' },
  { label: 'Past', href: '/tourist/past-bookings', iconName: 'star' },
];

// Wrapper component that checks if it's an auth page
function TouristDashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <TouristDashboardLayoutContent>{children}</TouristDashboardLayoutContent>;
}

// Actual layout component that always calls hooks
function TouristDashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push('/tourist/login');
          return;
        }
        const { data: profileData } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
        if (profileData) setProfile(profileData);
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('tourist_id');
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
        <TouristDashboardSidebar
          userName={profile?.name}
          userEmail={profile?.email}
          userAvatar={profile?.profile_picture_url}
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

export default function TouristDashboardLayout({ children }: { children: React.ReactNode }) {
  return <TouristDashboardLayoutWrapper>{children}</TouristDashboardLayoutWrapper>;
}
