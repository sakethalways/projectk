'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import TouristSearchGuides from '@/components/tourist-search-guides';
import TouristAvailableGuides from '@/components/tourist-available-guides';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function ExploreGuidesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
            Explore Guides
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Search and discover verified guides from around the world
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-12 sm:mb-14">
          <TouristSearchGuides />
        </div>

        {/* Featured Guides Section */}
        <div>
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              Featured Guides
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Check out our most popular and verified guides
            </p>
          </div>
          <TouristAvailableGuides />
        </div>
    </ResponsiveContainer>
  );
}
