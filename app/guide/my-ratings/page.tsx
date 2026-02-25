'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import GuideSidebar from '@/components/guide-sidebar';
import GuideRatingsReviews from '@/components/guide-ratings-reviews';
import { useIsMobile } from '@/hooks/use-mobile';

export default function GuideRatingsPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication and fetch guide data
  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        router.push('/guide/login');
        return;
      }
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/guide/login');
          return;
        }

        // Fetch guide data
        const { data: guideData, error: guideError } = await supabase!
          .from('guides')
          .select('id, name')
          .eq('user_id', authUser.id)
          .single();

        if (guideError || !guideData) {
          router.push('/guide/login');
          return;
        }

        setGuide(guideData);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push('/guide/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      router.push('/guide/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} guideName={guide?.name} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Ratings & Reviews
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View ratings and reviews from tourists
            </p>
          </div>

          {/* Ratings & Reviews */}
          <div>
            <GuideRatingsReviews />
          </div>
        </div>
      </div>
    </div>
  );
}
