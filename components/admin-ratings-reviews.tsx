'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function AdminRatingsReviews() {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
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

      const response = await fetch('/api/get-ratings-reviews?type=all', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatings(data.ratings || []);
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

  const handleDelete = async (ratingId: string) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast({
          title: 'Error',
          description: 'Please log in',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(`/api/delete-rating-review?rating_id=${ratingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }

      toast({
        title: 'Deleted',
        description: 'Rating has been removed',
      });

      fetchRatings();
    } catch (err) {
      console.error('Error deleting rating:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete rating',
        variant: 'destructive',
      });
    }
  };

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

  if (ratings.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
        <p className="text-slate-600 dark:text-slate-300 text-lg">No ratings found</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Ratings will appear here as tourists submit them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {ratings.length} total rating{ratings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid gap-6">
        {ratings.map((rating) => (
          <Card key={rating.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground mb-1">Tourist</p>
                    <p className="font-semibold text-foreground">
                      {rating.tourist?.email || 'Unknown Tourist'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Guide</p>
                    <p className="font-semibold text-foreground">
                      {rating.guide?.name || 'Unknown Guide'}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
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
                <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                  <p className="text-sm text-foreground">{rating.review_text}</p>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(rating.created_at).toLocaleString()}
                </p>

                <Button
                  onClick={() => handleDelete(rating.id)}
                  variant="destructive"
                  size="sm"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
