'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BookOpen, Calendar, Loader2, Bookmark } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Guide, GuideAvailability } from '@/lib/supabase-client';
import ItineraryModal from './itinerary-modal';
import BookGuideModal from './book-guide-modal';
import { useToast } from '@/hooks/use-toast';

interface TouristGuideCardProps {
  guide: Guide;
  onUnsave?: () => void;
}

export default function TouristGuideCard({ guide, onUnsave }: TouristGuideCardProps) {
  const { toast } = useToast();
  const [showItinerary, setShowItinerary] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [availability, setAvailability] = useState<GuideAvailability | null>(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [checkingSaveStatus, setCheckingSaveStatus] = useState(true);

  // Fetch availability when component mounts
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const { data, error } = await supabase
          .from('guide_availability')
          .select('*')
          .eq('guide_id', guide.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Supabase error fetching availability:', error);
        } else if (data) {
          setAvailability(data as GuideAvailability);
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [guide.id]);

  // Check if guide is saved
  useEffect(() => {
    const checkSaveStatus = async () => {
      try {
        setCheckingSaveStatus(true);
        const { data: savedGuideRecords, error } = await supabase
          .from('saved_guides')
          .select('id')
          .eq('guide_id', guide.id)
          .limit(1);

        if (!error && savedGuideRecords && savedGuideRecords.length > 0) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
      } catch (err) {
        console.error('Error checking save status:', err);
      } finally {
        setCheckingSaveStatus(false);
      }
    };

    checkSaveStatus();
  }, [guide.id]);

  // Handle save/unsave
  const handleToggleSave = async () => {
    try {
      setLoadingSave(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        toast({
          title: 'Error',
          description: 'Please log in to save guides',
          variant: 'destructive',
        });
        return;
      }

      if (isSaved) {
        // Unsave the guide
        const response = await fetch(`/api/unsave-guide?guide_id=${guide.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to unsave guide');
        }

        setIsSaved(false);
        toast({
          title: 'Removed',
          description: 'Guide removed from saved guides',
        });
        onUnsave?.();
      } else {
        // Save the guide
        const response = await fetch('/api/save-guide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ guide_id: guide.id }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save guide');
        }

        setIsSaved(true);
        toast({
          title: 'Saved',
          description: 'Guide added to saved guides',
        });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save guide',
        variant: 'destructive',
      });
    } finally {
      setLoadingSave(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col border border-border">
        {/* Profile Picture */}
        <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          {guide.profile_picture_url ? (
            <Image
              src={guide.profile_picture_url}
              alt={guide.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-5xl mb-2">👤</div>
              <p className="text-sm">No Photo</p>
            </div>
          )}
          
          {/* Save Button */}
          <Button
            onClick={handleToggleSave}
            disabled={loadingSave || checkingSaveStatus}
            className="absolute top-2 right-2 p-2 h-auto"
            variant={isSaved ? 'default' : 'outline'}
            size="sm"
            title={isSaved ? 'Remove from saved guides' : 'Save guide'}
          >
            {loadingSave || checkingSaveStatus ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isSaved ? (
              <Bookmark className="w-4 h-4 fill-current" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{guide.name}</h3>

          {/* Location */}
          <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{guide.location}</span>
          </div>

          {/* Languages */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {guide.languages && Array.isArray(guide.languages) && guide.languages.length > 0 ? (
                <>
                  {guide.languages.slice(0, 2).map((lang, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {guide.languages.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{guide.languages.length - 2}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No languages listed</span>
              )}
            </div>
          </div>

          {/* Availability Status */}
          {loadingAvailability && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg flex items-center justify-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Loading status...</span>
            </div>
          )}

          {availability && !loadingAvailability && (
            <div className="mb-4 space-y-2">
              {/* Status Badge */}
              <Badge 
                className={`text-xs font-semibold w-full justify-center py-1.5 ${
                  availability.is_available 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-700' 
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                }`}
              >
                {availability.is_available ? '✓ Available' : '🕐 On Leave'}
              </Badge>
              
              {/* Date Range */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(availability.start_date)} - {formatDate(availability.end_date)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {!availability && !loadingAvailability && (
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
              <Badge variant="outline" className="text-xs w-full justify-center">
                Status not available
              </Badge>
            </div>
          )}

          {/* View Itinerary & Book Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => setShowItinerary(true)}
              variant="default"
              size="sm"
              className="flex-1 gap-2"
            >
              <BookOpen className="w-4 h-4" />
              View
            </Button>
            <Button
              onClick={() => setShowBooking(true)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card>

      {/* Itinerary Modal */}
      <ItineraryModal
        guideId={guide.id}
        guideName={guide.name}
        open={showItinerary}
        onOpenChange={setShowItinerary}
      />

      {/* Book Guide Modal */}
      <BookGuideModal
        guide={guide}
        open={showBooking}
        onOpenChange={setShowBooking}
      />
    </>
  );
}
