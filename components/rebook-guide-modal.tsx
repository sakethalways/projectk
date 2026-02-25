'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import type { Guide, GuideAvailability, GuideItinerary } from '@/lib/supabase-client';
import type { Booking } from '@/lib/supabase-client';
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
import { Loader2, AlertCircle, CheckCircle2, XCircle, Calendar, DollarSign } from 'lucide-react';

interface RebookGuideModalProps {
  previousBooking: Booking & {
    guide?: { id: string; name: string; location: string; phone_number?: string };
    itinerary?: { id: string; number_of_days: number; description: string };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingSuccess?: () => void;
}

type ModalStep = 'validation' | 'date-selection' | 'confirmation';

interface ValidationResult {
  guideExists: boolean;
  guideMessage: string;
  guideAvailable: boolean;
  availabilityMessage: string;
  itineraryExists: boolean;
  itineraryMessage: string;
  overallStatus: 'success' | 'warning' | 'error';
}

export default function RebookGuideModal({
  previousBooking,
  open,
  onOpenChange,
  onBookingSuccess,
}: RebookGuideModalProps) {
  const [step, setStep] = useState<ModalStep>('validation');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [availability, setAvailability] = useState<GuideAvailability | null>(null);
  const [itinerary, setItinerary] = useState<GuideItinerary | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [tourist, setTourist] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setStep('validation');
      setValidation(null);
      setAvailability(null);
      setItinerary(null);
      setSelectedDate('');
      setError(null);
      return;
    }

    validateAndLoad();
  }, [open, previousBooking.guide?.id, previousBooking.itinerary?.id]);

  const validateAndLoad = async () => {
    try {
      setLoading(true);
      setError(null);
      const validationResult: ValidationResult = {
        guideExists: false,
        guideMessage: '',
        guideAvailable: false,
        availabilityMessage: '',
        itineraryExists: false,
        itineraryMessage: '',
        overallStatus: 'error',
      };

      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (authData.user) {
        setTourist(authData.user);
      }

      const guideId = previousBooking.guide?.id;
      const itineraryId = previousBooking.itinerary?.id;

      if (!guideId || !itineraryId) {
        validationResult.overallStatus = 'error';
        validationResult.guideMessage = 'Guide information incomplete';
        setValidation(validationResult);
        return;
      }

      // TEST CASE 1: Check if guide still exists
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('*')
        .eq('id', guideId)
        .single();

      if (guideError || !guideData) {
        validationResult.guideExists = false;
        validationResult.guideMessage = '❌ Guide no longer exists. They may have removed their profile.';
        validationResult.overallStatus = 'error';
        setValidation(validationResult);
        return;
      }

      validationResult.guideExists = true;
      validationResult.guideMessage = `✓ Guide "${guideData.name}" still active`;

      // TEST CASE 2: Check guide's current availability status
      const { data: availData, error: availError } = await supabase
        .from('guide_availability')
        .select('*')
        .eq('guide_id', guideId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (availError || !availData) {
        validationResult.guideAvailable = false;
        validationResult.availabilityMessage = '⚠️ Guide availability not set';
        validationResult.overallStatus = 'warning';
        setValidation(validationResult);
        return;
      }

      // TEST CASE 3: Check if guide is on leave
      if (!availData.is_available) {
        validationResult.guideAvailable = false;
        validationResult.availabilityMessage = `⏸️ Guide is currently on leave (${new Date(availData.start_date).toLocaleDateString()} - ${new Date(availData.end_date).toLocaleDateString()})`;
        validationResult.overallStatus = 'warning';
        setValidation(validationResult);
        return;
      }

      validationResult.guideAvailable = true;
      validationResult.availabilityMessage = `✓ Available from ${new Date(availData.start_date).toLocaleDateString()} to ${new Date(availData.end_date).toLocaleDateString()}`;
      setAvailability(availData);

      // TEST CASE 4: Check if the same itinerary still exists
      const { data: itineraryData, error: itineraryError } = await supabase
        .from('guide_itineraries')
        .select('*')
        .eq('id', itineraryId)
        .eq('guide_id', guideId)
        .single();

      if (itineraryError || !itineraryData) {
        validationResult.itineraryExists = false;
        validationResult.itineraryMessage = '❌ The itinerary you booked is no longer available. Guide may have updated their offerings.';
        validationResult.overallStatus = 'error';
        setValidation(validationResult);
        return;
      }

      validationResult.itineraryExists = true;
      validationResult.itineraryMessage = `✓ Itinerary "${itineraryData.number_of_days} days" still available at ₹${itineraryData.price}`;
      setItinerary(itineraryData);

      // All validations passed
      validationResult.overallStatus = 'success';
      setValidation(validationResult);
      setStep('date-selection');
    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate booking information');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep('confirmation');
  };

  const handleConfirmBooking = async () => {
    if (!selectedDate || !itinerary || !tourist) return;

    try {
      setBooking(true);
      setError(null);

      // Create new booking
      const response = await fetch('/api/create-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourist_id: tourist.id,
          guide_id: previousBooking.guide?.id,
          itinerary_id: itinerary.id,
          booking_date: selectedDate,
          price: itinerary.price,
          price_type: itinerary.price_type,
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

  const getValidationIcon = (result: boolean) => {
    return result ? (
      <CheckCircle2 className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {previousBooking.guide?.name} Again</DialogTitle>
          <DialogDescription>
            {step === 'validation' && 'Validating guide information...'}
            {step === 'date-selection' && 'Select a new date'}
            {step === 'confirmation' && 'Confirm your new booking'}
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
          {loading && step === 'validation' && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Validating guide and availability...</p>
            </div>
          )}

          {/* Validation Results */}
          {validation && step === 'validation' && (
            <div className="space-y-3">
              {/* Guide Status */}
              <div className={`p-3 rounded-lg border flex gap-3 ${
                validation.guideExists
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                {getValidationIcon(validation.guideExists)}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {validation.guideExists ? 'Guide Verified' : 'Guide Not Found'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {validation.guideMessage}
                  </p>
                </div>
              </div>

              {/* Availability Status */}
              {validation.guideExists && (
                <div className={`p-3 rounded-lg border flex gap-3 ${
                  validation.guideAvailable
                    ? 'bg-green-50 border-green-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  {validation.guideAvailable ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {validation.guideAvailable ? 'Guide Available' : 'Guide On Leave'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {validation.availabilityMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Itinerary Status */}
              {validation.guideAvailable && (
                <div className={`p-3 rounded-lg border flex gap-3 ${
                  validation.itineraryExists
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  {getValidationIcon(validation.itineraryExists)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {validation.itineraryExists ? 'Itinerary Available' : 'Itinerary Unavailable'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {validation.itineraryMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Overall Status */}
              {validation.overallStatus === 'success' && (
                <Alert className="bg-blue-50 border-blue-200">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    ✓ Great! All checks passed. You can now book this guide again.
                  </AlertDescription>
                </Alert>
              )}

              {validation.overallStatus === 'error' && (
                <Alert className="bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-sm text-red-800">
                    ✗ Unable to book this guide. See details above.
                  </AlertDescription>
                </Alert>
              )}

              {validation.overallStatus === 'warning' && (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800">
                    ⚠️ Guide status changed. Please select another guide or try later.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Date Selection */}
          {step === 'date-selection' && availability && itinerary && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Select a date from {formatDate(availability.start_date)} to {formatDate(availability.end_date)}
              </p>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => handleDateSelect(date)}
                    className="p-2 rounded border border-border hover:bg-primary hover:text-white hover:border-primary text-xs text-center transition"
                  >
                    {new Date(date).getDate()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation */}
          {step === 'confirmation' && selectedDate && itinerary && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{formatDate(selectedDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{itinerary.number_of_days} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold">{previousBooking.guide?.location}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-primary">
                    ₹{itinerary.price} {itinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
                  </span>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  Ready to book {previousBooking.guide?.name} on {formatDate(selectedDate)}?
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            {step === 'confirmation' && validation?.overallStatus === 'success' && (
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
                  onClick={() => setStep('date-selection')}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
              </>
            )}

            {step === 'date-selection' && (
              <Button
                onClick={() => setStep('validation')}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            )}

            {step === 'validation' && validation && validation.overallStatus !== 'success' && (
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            )}

            {step === 'validation' && validation && validation.overallStatus === 'success' && (
              <Button
                onClick={() => setStep('date-selection')}
                className="w-full"
              >
                Proceed
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
