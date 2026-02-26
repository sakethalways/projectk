'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GuideRatingsReviews() {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [avgRating, setAvgRating] = useState(0);

  const fetchRatings = async () => {
    if (!supabase) {
      setError('Service unavailable');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError('Please log in to view ratings');
        setRatings([]);
        return;
      }

      const response = await fetch('/api/get-ratings-reviews?type=guide', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatings(data.ratings || []);

      // Calculate average rating
      if (data.ratings && data.ratings.length > 0) {
        const avg =
          data.ratings.reduce((sum: number, r: any) => sum + r.rating, 0) /
          data.ratings.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && ratings.length === 0) {
    return (
      <Alert className="bg-slate-100 border-slate-300">
        <AlertCircle className="h-4 w-4 text-slate-600" />
        <AlertDescription className="text-slate-700">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {ratings.length > 0 && (
        <Card className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-50 dark:from-emerald-950/30 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-foreground">{avgRating}</div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={`${
                        i < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {ratings.length} Rating{ratings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card>
      )}

      {/* No Ratings Message */}
      {ratings.length === 0 && (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-300 text-lg">No ratings yet</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Complete more trips to earn ratings from tourists!
          </p>
        </div>
      )}

      {/* Ratings List */}
      {ratings.length > 0 && (
        <div className="grid gap-4">
          {ratings.map((rating) => (
            <Card key={rating.id} className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">
                      {rating.tourist?.name || 'Anonymous Tourist'}
                    </p>
                    <p className="text-sm text-muted-foreground">{rating.tourist?.location || 'N/A'}</p>
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={`${
                          i < rating.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review */}
                {rating.review_text && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {rating.review_text}
                  </p>
                )}

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
