'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { Eye, Edit, User, BarChart2, Star, AlertCircle, Home, Calendar } from 'lucide-react';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

import type { Guide } from '@/lib/supabase-client';

// Separate component to render trips completed message
function TripsCompletedMessage({ tripsCompleted }: { tripsCompleted: number | null | undefined }) {
  if ((tripsCompleted ?? 0) === 0) {
    return <span className="text-gray-600 dark:text-gray-400">No trips completed yet</span>;
  }
  return (
    <span>✨ Number of trips you have done: <strong className="text-emerald-600 dark:text-emerald-400">{tripsCompleted}</strong></span>
  );
}

export default function GuideDashboard() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndLoadGuide = async () => {
      try {
        if (!supabase) {
          setError('Supabase not initialized');
          setLoading(false);
          return;
        }
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
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('guide_id');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Failed to load guide data'}</p>
          <Button onClick={handleLogout} className="bg-emerald-600 hover:bg-emerald-700 text-white">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer>

        {/* Welcome Section */}
        <Card className="border border-emerald-200 dark:border-slate-700 p-5 sm:p-6 lg:p-8 mb-6 sm:mb-8 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 shadow-md">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-dark-text mb-1 sm:mb-2">Welcome, {guide.name}! 👋</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your profile, availability, and itineraries all in one place.
          </p>
          {/* Trip Count Message */}
          <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-slate-600">
            <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-dark-text">
              <TripsCompletedMessage tripsCompleted={guide.trips_completed} />
            </p>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Profile Status */}
          <Card className="border border-emerald-200 dark:border-slate-700 p-4 sm:p-5 lg:p-6 bg-white dark:bg-dark-surface">
            <div className="text-center">
              <div className="inline-block mb-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold">
                Verified ✓
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Member Status</p>
            </div>
          </Card>

          {/* Member Since */}
          <Card className="border border-emerald-200 dark:border-slate-700 p-4 sm:p-5 lg:p-6">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-dark-text mb-1 sm:mb-2">
                {new Date(guide.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Member Since</p>
            </div>
          </Card>

          {/* Language */}
          <Card className="border border-emerald-200 dark:border-slate-700 p-4 sm:p-5 lg:p-6">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-dark-text mb-1 sm:mb-2">{Array.isArray(guide.languages) && guide.languages.length > 0 ? guide.languages[0] : 'Not specified'}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Primary Language</p>
            </div>
          </Card>
        </div>

        {/* Profile Preview Card */}
        <Card className="border border-emerald-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {guide.profile_picture_url && (
              <img
                src={guide.profile_picture_url}
                alt={guide.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-200 dark:border-emerald-900 flex-shrink-0"
              />
            )}
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-1">{guide.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">{guide.email}</p>
              <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-200"><span className="font-medium">Location:</span> {guide.location}</p>
            </div>
          </div>
        </Card>

        {/* Profile Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

        {/* Quick Access Sections */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mb-10 sm:mb-12">
          <Link href="/guide/confirmed-bookings" className="block">
            <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">Confirmed Bookings</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage upcoming tours</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/guide/past-bookings" className="block">
            <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">Past Bookings</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Your trip history</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/guide/availability" className="block">
            <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">Availability</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage your schedule</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/guide/my-ratings" className="block">
            <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">Ratings</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Guest reviews</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>


      </ResponsiveContainer>
  );
}
