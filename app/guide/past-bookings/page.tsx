'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GuidePastBookings from '@/components/guide-past-bookings';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function PastBookingsPage() {
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
          Past Trips
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View your completed trips history
        </p>
      </div>

      <GuidePastBookings />
    </ResponsiveContainer>
  );
}
