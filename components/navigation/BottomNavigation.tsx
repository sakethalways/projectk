'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItemIcon } from './NavItemIcon';

interface NavItem {
  label: string;
  href: string;
  iconName: string;
  activePatterns?: string[];
}

interface BottomNavigationProps {
  items: NavItem[];
  baseClass?: string;
}

export default function BottomNavigation({
  items,
  baseClass = '',
}: BottomNavigationProps) {
  const pathname = usePathname();

  const isActive = (item: NavItem): boolean => {
    if (item.activePatterns) {
      return item.activePatterns.some(pattern => pathname.includes(pattern));
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className={`flex h-20 items-center justify-around ${baseClass}`}>
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
              active
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400'
            }`}
          >
            <div className="w-6 h-6">
              <NavItemIcon iconName={item.iconName} />
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}