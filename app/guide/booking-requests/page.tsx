'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GuideBookingRequests from '@/components/guide-booking-requests';
import GuideSidebar from '@/components/guide-sidebar';
import { supabase } from '@/lib/supabase-client';

export default function BookingRequestsPage() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('guide_id');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Booking Requests
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and respond to tour booking requests from tourists
          </p>
        </div>

        <GuideBookingRequests />
      </main>
    </div>
  );
}
