'use client';

import { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
  sidebarOpen?: boolean;
  onSidebarToggle?: (open: boolean) => void;
}

// Separate component to render hamburger icon to avoid conditional JSX in parent
function HamburgerIcon({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <X className="w-6 h-6 text-gray-900 dark:text-dark-text" />
  ) : (
    <Menu className="w-6 h-6 text-gray-900 dark:text-dark-text" />
  );
}

export default function DashboardLayout({
  children,
  sidebar,
  header,
  bottomNav,
  sidebarOpen: controlledOpen,
  onSidebarToggle,
}: DashboardLayoutProps) {
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  
  const sidebarOpen = controlledOpen ?? internalSidebarOpen;
  const setSidebarOpen = onSidebarToggle ?? setInternalSidebarOpen;

  return (
    <div className="flex h-screen bg-cream-100 dark:bg-dark-bg overflow-hidden">
      {/* ===== SIDEBAR (Full Height on Left) ===== */}
      {sidebar && (
        <>
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <aside
            className={`fixed left-0 top-0 bottom-0 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none z-30 lg:w-60 lg:flex-shrink-0 lg:h-screen ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            {sidebar}
          </aside>
        </>
      )}

      {/* ===== RIGHT SIDE (Header + Content) ===== */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header - Only on Right Side */}
        <header className="h-16 bg-white dark:bg-dark-surface border-b border-emerald-200 dark:border-slate-700 flex items-center px-4 sm:px-6 lg:px-8 flex-shrink-0 gap-4">
          {/* Mobile Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-cream-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <HamburgerIcon isOpen={sidebarOpen} />
          </button>

          {/* Header Content */}
          {header && <div className="flex-1 min-w-0">{header}</div>}
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-20 lg:pb-0">
          {children}

          {/* Bottom Navigation (Mobile) */}
          {bottomNav && (
            <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-dark-surface border-t border-emerald-200 dark:border-slate-700 z-20">
              {bottomNav}
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}
