'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Mail, Phone, FileText, Globe } from 'lucide-react';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

export default function GuideProfile() {
  return (
    <ResponsiveContainer>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile page - content to be displayed here</p>
          <Link href="/guide/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </ResponsiveContainer>
  );
}
