'use client';

import { useRouter } from 'next/navigation';
import GuideAvailabilityManager from '@/components/guide-availability-manager';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function AvailabilityPage() {
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

      <GuideAvailabilityManager />
    </ResponsiveContainer>
  );
}
