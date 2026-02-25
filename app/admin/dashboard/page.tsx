'use client';

import { Suspense } from 'react';
import AdminDashboardContent from '@/components/admin-dashboard-content';

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
