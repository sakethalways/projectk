'use client';

import { Suspense } from 'react';
import AdminDashboardContent from '@/components/admin-dashboard-content';

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
