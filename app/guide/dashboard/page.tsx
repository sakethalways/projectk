'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { Eye, Edit, User } from 'lucide-react';

import GuideSidebar from '@/components/guide-sidebar';
import type { Guide } from '@/lib/supabase-client';

export default function GuideDashboard() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndLoadGuide = async () => {
      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.push('/guide/login');
          return;
        }

        // Get guide data
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError || !guideData) {
          setError('Failed to load guide data');
          return;
        }

        // Check if status is not approved
        if (guideData.status !== 'approved') {
          router.push('/guide/login');
          return;
        }

        // Sync trips_completed count (calculate from completed bookings)
        try {
          await fetch(`/api/sync-trips-completed?guide_id=${guideData.id}`);
        } catch (err) {
          console.error('Error syncing trips_completed:', err);
          // Continue anyway, not critical
        }

        // Fetch fresh guide data after sync
        const { data: freshGuideData } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        setGuide(freshGuideData || guideData);
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
    localStorage.removeItem('guide_id');
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
        {/* Profile Button in Top Right */}
        <div className="flex justify-end mb-6">
          <Link href="/guide/account">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              Profile
            </Button>
          </Link>
        </div>

        {/* Welcome Section */}
        <Card className="border border-border p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">Welcome, {guide.name}! 👋</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your profile, availability, and itineraries all in one place.
          </p>
          {/* Trip Count Message */}
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <p className="text-sm sm:text-base font-medium text-foreground">
              {(guide.trips_completed ?? 0) === 0 ? (
                <span className="text-muted-foreground">No trips completed yet</span>
              ) : (
                <span>✨ Number of trips you have done: <strong className="text-green-600 dark:text-green-400">{guide.trips_completed}</strong></span>
              )}
            </p>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Profile Status */}
          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="text-center">
              <div className="inline-block mb-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-xs font-semibold">
                Verified ✓
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Member Status</p>
            </div>
          </Card>

          {/* Member Since */}
          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                {new Date(guide.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">Member Since</p>
            </div>
          </Card>

          {/* Language */}
          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">{guide.language}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Primary Language</p>
            </div>
          </Card>
        </div>

        {/* Profile Preview Card */}
        <Card className="border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {guide.profile_picture_url && (
              <img
                src={guide.profile_picture_url}
                alt={guide.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-border flex-shrink-0"
              />
            )}
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-1">{guide.name}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">{guide.email}</p>
              <p className="text-xs sm:text-sm text-foreground"><span className="font-medium">Location:</span> {guide.location}</p>
            </div>
          </div>
        </Card>

        {/* Profile Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
          <Link href="/guide/profile" className="block">
            <Button className="w-full gap-2 text-sm sm:text-base" variant="outline">
              <Eye className="w-4 h-4" />
              View Full Profile
            </Button>
          </Link>
          <Link href="/guide/edit-profile" className="block">
            <Button className="w-full gap-2 text-sm sm:text-base">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
        </div>


      </main>
    </div>
  );
}
