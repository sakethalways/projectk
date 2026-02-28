'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import AdminDashboardSidebar from '@/components/sidebars/AdminDashboardSidebar';

const BOTTOM_NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', iconName: 'home' },
  { label: 'Pending', href: '/admin/dashboard?tab=pending', iconName: 'alertCircle' },
  { label: 'Users', href: '/admin/dashboard?tab=tourists', iconName: 'users' },
  { label: 'Bookings', href: '/admin/dashboard?tab=bookings', iconName: 'barChart2' },
  { label: 'Ratings', href: '/admin/my-ratings', iconName: 'users' },
];

// Wrapper component that checks if it's an auth page
function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

// Actual layout component that always calls hooks
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          router.push('/admin/login');
          return;
        }
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();
        
        if (userData?.role !== 'admin') {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }
        
        setUser(authData.user);
      } catch (err) {
        console.error('Error checking admin access:', err);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    checkAdminAccess();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/admin/login');
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
        <AdminDashboardSidebar
          userName="Admin"
          userEmail={user?.email}
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
