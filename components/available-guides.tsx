'use client';

import { useEffect, useState } from 'react';
import type { Guide } from '@/lib/supabase-client';
import GuideCard from './guide-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AvailableGuides() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApprovedGuides = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching approved guides from API...');

        // Use API endpoint to bypass RLS restrictions
        const response = await fetch('/api/get-approved-guides');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Guides fetched:', { count: data.count, guides: data.guides });

        if (data.error) {
          setError(data.error);
          setGuides([]);
          return;
        }

        setGuides(data.guides || []);
      } catch (err) {
        console.error('Error fetching guides:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch guides');
        setGuides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedGuides();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Only show error if there's an actual error message
  if (error && guides.length === 0) {
    return (
      <Alert className="bg-slate-100 border-slate-300">
        <AlertCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">{error}</AlertDescription>
      </Alert>
    );
  }

  // If no guides found, show placeholder
  if (guides.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-300 text-lg">No guides available at the moment</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Check back soon for verified guides!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </div>
    </div>
  );
}
