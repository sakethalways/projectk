'use client';

import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';
import GuideRatingsReviews from '@/components/guide-ratings-reviews';

export default function GuideRatingsPage() {
  return (
    <ResponsiveContainer>
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Ratings & Reviews
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View ratings and reviews from tourists
        </p>
      </div>

      <div>
        <GuideRatingsReviews />
      </div>
    </ResponsiveContainer>
  );
}
