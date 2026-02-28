'use client';

import { Home, Calendar, Phone, Star, User, MapPin, Compass, Heart, AlertCircle, BarChart2, Users, Clock, CheckCircle2, XCircle, LayoutDashboard, Bookmark, History, Settings } from 'lucide-react';
import React from 'react';

interface NavItemIconProps {
  iconName: string;
}

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  'home': Home,
  'calendar': Calendar,
  'phone': Phone,
  'star': Star,
  'user': User,
  'mapPin': MapPin,
  'compass': Compass,
  'heart': Heart,
  'alertCircle': AlertCircle,
  'barChart2': BarChart2,
  'users': Users,
  'clock': Clock,
  'checkCircle2': CheckCircle2,
  'xCircle': XCircle,
  'layoutDashboard': LayoutDashboard,
  'bookmark': Bookmark,
  'history': History,
  'settings': Settings,
};

export function NavItemIcon({ iconName }: NavItemIconProps) {
  const IconComponent = iconComponents[iconName];
  if (!IconComponent) return null;
  return <IconComponent className="w-5 h-5" />;
}
