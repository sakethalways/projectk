'use client';

import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * ResponsiveContainer wraps main content with proper width constraints
 * Mobile (375px): Full width with 16px padding
 * Tablet (640px): Full width with 24px padding, 2-column grids allowed
 * Desktop (1024px+): Max 960px width centered, 3-column grids allowed
 */
export default function ResponsiveContainer({
  children,
  className = '',
}: ResponsiveContainerProps) {
  return (
    <div className={`w-full h-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 mx-auto ${className}`}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}
