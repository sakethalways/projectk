'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
import GuideSidebar from '@/components/guide-sidebar';
import GuideAvailabilityManager from '@/components/guide-availability-manager';
import type { Guide } from '@/lib/supabase-client';

export default function AvailabilityPage() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndLoadGuide = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.push('/guide/login');
          return;
        }

        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .limit(1);

        if (guideError || !guideData || guideData.length === 0) {
          setError('Failed to load guide data');
          return;
        }

        const data = guideData[0];
        if (data.status !== 'approved') {
          router.push('/guide/login');
          return;
        }

        setGuide(data);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadGuide();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Failed to load guide data'}</p>
          <Button onClick={handleLogout}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} guideName={guide.name} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
        </div>

        {/* Availability Manager */}
        <GuideAvailabilityManager guideId={guide.id} userId={guide.user_id} />
      </main>
    </div>
  );
}
