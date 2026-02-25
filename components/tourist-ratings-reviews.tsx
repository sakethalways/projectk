'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Loader2, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RatingReviewModal from './rating-review-modal';
import { useToast } from '@/hooks/use-toast';

export default function TouristRatingsReviews() {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRatingId, setEditingRatingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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

      const response = await fetch('/api/get-ratings-reviews?type=my', {
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
        <p className="text-slate-600 dark:text-slate-300 text-lg">No ratings yet</p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Complete a trip to rate a guide!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {ratings.length} rating{ratings.length !== 1 ? 's' : ''} given
        </p>
      </div>

      <div className="grid gap-6">
        {ratings.map((rating) => (
          <Card key={rating.id} className="overflow-hidden p-6">
            <div className="flex gap-6">
              {/* Guide Image */}
              <div className="flex-shrink-0 w-24 h-24 relative rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
                {rating.guide?.profile_picture_url ? (
                  <Image
                    src={rating.guide.profile_picture_url}
                    alt={rating.guide.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{rating.guide?.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{rating.guide?.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="w-4 h-4" />
                      <span>{rating.guide?.email}</span>
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

                {/* Review Text */}
                {rating.review_text && (
                  <p className="text-sm text-foreground mb-4 leading-relaxed">
                    {rating.review_text}
                  </p>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Reviewed on {new Date(rating.created_at).toLocaleDateString()}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingRatingId(rating.booking_id)}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
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
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rating Modal */}
      {editingRatingId && (
        <RatingReviewModal
          open={showModal || !!editingRatingId}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) setEditingRatingId(null);
          }}
          bookingId={editingRatingId}
          guideId=""
          guideName=""
          onRatingSubmitted={fetchRatings}
        />
      )}
    </div>
  );
}
