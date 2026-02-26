'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface RatingReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  guideId: string;
  guideName: string;
  onRatingSubmitted?: () => void;
}

export default function RatingReviewModal({
  open,
  onOpenChange,
  bookingId,
  guideId,
  guideName,
  onRatingSubmitted,
}: RatingReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load existing rating if it exists
  useEffect(() => {
    if (open && bookingId) {
      fetchExistingRating();
    }
  }, [open, bookingId]);

  const fetchExistingRating = async () => {
    try {
      const response = await fetch(`/api/get-booking-rating?booking_id=${bookingId}`);
      const data = await response.json();

      if (data.hasRating) {
        setExistingRating(data.rating);
        setRating(data.rating.rating);
        setReviewText(data.rating.review_text || '');
        setIsEditing(true);
      }
    } catch (err) {
      console.error('Error fetching existing rating:', err);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!supabase) {
      toast.error('Service unavailable');
      return;
    }

    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error('Please log in to submit a rating');
        return;
      }

      const response = await fetch('/api/create-rating-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          booking_id: bookingId,
          rating,
          review_text: reviewText || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating');
      }

      toast.success(isEditing ? 'Rating updated successfully' : 'Rating submitted successfully');

      onOpenChange(false);
      onRatingSubmitted?.();
      setRating(0);
      setReviewText('');
      setIsEditing(false);
      setExistingRating(null);
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to submit rating');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRating) return;

    if (!supabase) {
      toast.error('Service unavailable');
      return;
    }
    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast.error('Please log in');
        return;
      }

      const response = await fetch(`/api/delete-rating-review?rating_id=${existingRating.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }

      toast.success('Rating has been deleted');

      onOpenChange(false);
      onRatingSubmitted?.();
      setRating(0);
      setReviewText('');
      setIsEditing(false);
      setExistingRating(null);
    } catch (err) {
      console.error('Error deleting rating:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete rating');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Rating' : 'Rate Guide'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Update your rating for ${guideName}` : `Share your experience with ${guideName}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Your Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground">You rated: {rating} star{rating !== 1 ? 's' : ''}</p>
            )}
          </div>

          {/* Review Text */}
          <div className="space-y-3">
            <Label htmlFor="review" className="text-base font-semibold">
              Your Review (Optional)
            </Label>
            <Textarea
              id="review"
              placeholder="Share your experience with this guide..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-32 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {isEditing && (
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading || rating === 0}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Update' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
