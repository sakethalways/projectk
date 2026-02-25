'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { Guide, GuideAvailability, GuideItinerary } from '@/lib/supabase-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Calendar, DollarSign } from 'lucide-react';

interface BookGuideModalProps {
  guide: Guide;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingSuccess?: () => void;
}

type ModalStep = 'availability-check' | 'date-selection' | 'itinerary-selection' | 'confirmation';

export default function BookGuideModal({
  guide,
  open,
  onOpenChange,
  onBookingSuccess,
}: BookGuideModalProps) {
  const [step, setStep] = useState<ModalStep>('availability-check');
  const [availability, setAvailability] = useState<GuideAvailability | null>(null);
  const [itineraries, setItineraries] = useState<GuideItinerary[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedItinerary, setSelectedItinerary] = useState<GuideItinerary | null>(null);
  const [tourist, setTourist] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setStep('availability-check');
      setAvailability(null);
      setItineraries([]);
      setSelectedDate('');
      setSelectedItinerary(null);
      setError(null);
      return;
    }

    checkAvailabilityAndLoadData();
  }, [open, guide.id]);

  const checkAvailabilityAndLoadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        setTourist(authData.user);
      }

      // Check guide availability
      const { data: availData, error: availError } = await supabase
        .from('guide_availability')
        .select('*')
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (availError || !availData) {
        setError('Guide availability not set');
        return;
      }

      setAvailability(availData);

      // If guide is on leave, show error
      if (!availData.is_available) {
        setError('Guide is on leave. Please try another guide.');
        setStep('availability-check');
        return;
      }

      // Fetch itineraries
      const { data: itineraryData, error: itinError } = await supabase
        .from('guide_itineraries')
        .select('*')
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false });

      if (itinError || !itineraryData) {
        setError('Failed to load itineraries');
        return;
      }

      setItineraries(itineraryData);
      setStep('date-selection');
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load guide information');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep('itinerary-selection');
  };

  const handleItinerarySelect = (itinerary: GuideItinerary) => {
    setSelectedItinerary(itinerary);
    setStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedItinerary || !tourist) return;

    try {
      setBooking(true);
      setError(null);

      // Create booking
      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourist_id: tourist.id,
          guide_id: guide.id,
          itinerary_id: selectedItinerary.id,
          booking_date: selectedDate,
          price: selectedItinerary.price,
          price_type: selectedItinerary.price_type,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      // Success
      onOpenChange(false);
      onBookingSuccess?.();
    } catch (err) {
      console.error('Booking error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getAvailableDates = (): string[] => {
    if (!availability) return [];
    const dates: string[] = [];
    const start = new Date(availability.start_date);
    const end = new Date(availability.end_date);
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {guide.name}</DialogTitle>
          <DialogDescription>
            {step === 'availability-check' && 'Checking availability...'}
            {step === 'date-selection' && 'Select a date'}
            {step === 'itinerary-selection' && 'Choose an itinerary'}
            {step === 'confirmation' && 'Confirm your booking'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {loading && step === 'availability-check' && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Checking guide availability...</p>
            </div>
          )}

          {/* Date Selection */}
          {step === 'date-selection' && !loading && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Available from {formatDate(availability!.start_date)} to {formatDate(availability!.end_date)}
              </p>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className="p-2 rounded border border-border hover:bg-primary hover:text-white hover:border-primary text-xs text-center"
                  >
                    {new Date(date).getDate()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Selection */}
          {step === 'itinerary-selection' && !loading && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Selected: {formatDate(selectedDate)}</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {itineraries.map((itinerary) => (
                  <button
                    key={itinerary.id}
                    onClick={() => handleItinerarySelect(itinerary)}
                    className="w-full p-3 border border-border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 text-left transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm">
                        {itinerary.number_of_days} Days
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        ₹{itinerary.price} {itinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {itinerary.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && selectedItinerary && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{selectedItinerary.number_of_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold">{guide.location}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-primary">
                    ₹{selectedItinerary.price} {selectedItinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
                  </span>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Hey {tourist?.email?.split('@')[0]}, are you sure to confirm booking on {formatDate(selectedDate)} to {guide.location} with {guide.name} at ₹{selectedItinerary.price} {selectedItinerary.price_type === 'per_day' ? 'per day' : 'per trip'}?
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            {step === 'confirmation' && (
              <>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={booking}
                  className="flex-1"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
                <Button
                  onClick={() => setStep('itinerary-selection')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              </>
            )}

            {step === 'itinerary-selection' && (
              <Button
                onClick={() => setStep('date-selection')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            )}

            {step === 'date-selection' && error && (
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
