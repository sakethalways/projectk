'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import TouristRatingsReviews from '@/components/tourist-ratings-reviews';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';
import { useIsMobile } from '@/hooks/use-mobile';

export default function TouristRatingsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('tourist_id');
    router.push('/');
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/tourist/login');
        return;
      }
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/tourist/login');
          return;
        }

        setUser(authUser);

        // Fetch tourist profile
        const { data: profileData } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (profileData) setProfile(profileData);
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer>


          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              My Ratings & Reviews
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your guide ratings and reviews
            </p>
          </div>

          {/* Ratings & Reviews */}
          <div>
            <TouristRatingsReviews />
          </div>
    </ResponsiveContainer>
  );
}
