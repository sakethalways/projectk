'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GuideConfirmedBookings from '@/components/guide-confirmed-bookings';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function ConfirmedBookingsPage() {
  const router = useRouter();
  return (
    <ResponsiveContainer>
      <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Confirmed Bookings
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your confirmed bookings and mark trips as complete
          </p>
        </div>

        <GuideConfirmedBookings />
      </ResponsiveContainer>
    );
}
