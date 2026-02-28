'use client';

import { useRouter } from 'next/navigation';
import GuideItineraryManager from '@/components/guide-itinerary-manager';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function ItineraryPage() {
  const router = useRouter();

  return (
    <ResponsiveContainer>
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
      </div>

      <GuideItineraryManager />
    </ResponsiveContainer>
  );
}
