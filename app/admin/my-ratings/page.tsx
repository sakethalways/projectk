'use client';

import { useState } from 'react';
import AdminRatingsReviews from '@/components/admin-ratings-reviews';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function AdminRatingsPage() {
  const [loading, setLoading] = useState(false);

  return (
    <ResponsiveContainer>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Ratings & Reviews Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage all ratings and reviews on the platform
        </p>
      </div>

      {/* Ratings & Reviews */}
      <div>
        <AdminRatingsReviews />
      </div>
    </ResponsiveContainer>
  );
}
