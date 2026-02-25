'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { GuideItinerary } from '@/lib/supabase-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, Calendar, Clock, MapPin, Info, DollarSign } from 'lucide-react';

interface ItineraryModalProps {
  guideId: string;
  guideName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ItineraryContent({ itinerary }: { itinerary: GuideItinerary }) {
  return (
    <>
      {/* Trip Overview */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="font-semibold text-foreground">{itinerary.number_of_days} days</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Timing</p>
              <p className="font-semibold text-foreground">{itinerary.timings}</p>
            </div>
          </div>
        </div>
        
        {/* Pricing Display */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="font-semibold text-foreground">
              ₹{itinerary.price.toLocaleString('en-IN')} {itinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Overview
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {itinerary.description}
        </p>
      </div>

      {/* Places to Visit */}
      <div>
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Places to Visit
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {itinerary.places_to_visit}
        </p>
      </div>

      {/* Instructions */}
      {itinerary.instructions && (
        <div>
          <h4 className="font-semibold text-foreground mb-2">Instructions</h4>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {itinerary.instructions}
          </p>
        </div>
      )}

      {/* Images */}
      <div>
        <h4 className="font-semibold text-foreground mb-3">Gallery</h4>
        <div className="grid grid-cols-2 gap-4">
          {itinerary.image_1_url && (
            <div className="relative aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
              <Image
                src={itinerary.image_1_url}
                alt="Itinerary image 1"
                fill
                className="object-cover hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          {itinerary.image_2_url && (
            <div className="relative aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden">
              <Image
                src={itinerary.image_2_url}
                alt="Itinerary image 2"
                fill
                className="object-cover hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
        </div>
        {!itinerary.image_1_url && !itinerary.image_2_url && (
          <p className="text-sm text-muted-foreground text-center py-8">No images available</p>
        )}
      </div>
    </>
  );
}

export default function ItineraryModal({
  guideId,
  guideName,
  open,
  onOpenChange,
}: ItineraryModalProps) {
  const [itineraries, setItineraries] = useState<GuideItinerary[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setItineraries([]);
      setSelectedId('');
      setError(null);
      return;
    }

    const fetchItineraries = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/get-guide-itinerary?guideId=${guideId}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.itineraries || data.itineraries.length === 0) {
          setError(data.message || 'No itinerary available.');
          setItineraries([]);
          return;
        }

        setItineraries(data.itineraries as GuideItinerary[]);
        setSelectedId(data.itineraries[0].id);
      } catch (err) {
        // Only log unexpected errors, not expected edge cases
        if (err instanceof Error && !err.message.includes('API error')) {
          console.error('Unexpected error fetching itineraries:', err);
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch itineraries');
        setItineraries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [open, guideId]);

  const selectedItinerary = itineraries.find(it => it.id === selectedId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {guideName}'s {itineraries.length > 1 ? 'Itineraries' : 'Itinerary'}
          </DialogTitle>
          <DialogDescription>
            {itineraries.length > 1 
              ? `View ${itineraries.length} available tour packages` 
              : 'View the complete itinerary details and schedule'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[calc(80vh-120px)]">
          <div className="pr-4 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {error && !loading && (
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">{error}</AlertDescription>
              </Alert>
            )}

            {itineraries.length > 0 && !loading && (
              <>
                {/* Multiple Itineraries - Show Tabs */}
                {itineraries.length > 1 && (
                  <Tabs value={selectedId} onValueChange={setSelectedId} className="w-full">
                    <TabsList className="grid w-full gap-2" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(90px, 1fr))` }}>
                      {itineraries.map((it) => (
                        <TabsTrigger key={it.id} value={it.id} className="text-xs">
                          <div className="text-center w-full">
                            <div className="font-semibold">{it.number_of_days}D</div>
                            <div className="text-xs">₹{it.price}</div>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Display Selected or Only Itinerary */}
                {selectedItinerary && (
                  <ItineraryContent itinerary={selectedItinerary} />
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
