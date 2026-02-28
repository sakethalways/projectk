'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GuideBookingRequests from '@/components/guide-booking-requests';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function BookingRequestsPage() {
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
            Booking Requests
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Review and respond to tour booking requests from tourists
          </p>
        </div>

        <GuideBookingRequests />
      </ResponsiveContainer>
    );
}
