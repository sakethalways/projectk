'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Booking } from '@/lib/supabase-client';
import { Loader2, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

interface BookingWithDetails extends Booking {
  tourist?: { id: string; user_id: string; name: string; phone_number: string; location: string; email: string; profile_picture_url?: string };
  guide?: { id: string; name: string; location: string; profile_picture_url?: string };
  itinerary?: {
    id: string;
    number_of_days: number;
    description: string;
    places_to_visit?: string;
    instructions?: string;
    image_1_url?: string;
    image_2_url?: string;
  };
}

export default function GuideConfirmedBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewingItinerary, setViewingItinerary] = useState<BookingWithDetails | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/get-guide-confirmed-bookings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        } else {
          setError('Failed to load confirmed bookings');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load confirmed bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const handleCompleteTrip = async (bookingId: string) => {
    if (!confirm('Mark this trip as completed?')) return;

    try {
      setUpdating(bookingId);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        setUpdating(null);
        return;
      }

      const response = await fetch('/api/update-booking-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, status: 'completed' }),
      });

      if (response.ok) {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
      } else {
        setError('Failed to update booking');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to update booking');
    } finally {
      setUpdating(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Cancel this booking? The tourist will be notified.')) return;

    try {
      setUpdating(bookingId);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        setUpdating(null);
        return;
      }

      const response = await fetch('/api/update-booking-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ booking_id: bookingId, status: 'cancelled' }),
      });

      if (response.ok) {
        setBookings(bookings.filter(b => b.id !== bookingId));
      } else {
        setError('Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to cancel booking');
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="border border-border p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading bookings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Confirmed Bookings
          {bookings.length > 0 && (
            <Badge className="ml-3 bg-green-100 text-green-800">{bookings.length} upcoming</Badge>
          )}
        </h2>
        <p className="text-muted-foreground mt-1">Manage your upcoming confirmed tours</p>
      </div>

      {/* Error */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* No Bookings */}
      {bookings.length === 0 ? (
        <Card className="border border-border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No confirmed bookings</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-border p-6">
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {booking.tourist?.profile_picture_url && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={booking.tourist.profile_picture_url} alt={booking.tourist.name} />
                        <AvatarFallback>{booking.tourist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {booking.tourist ? `Tourist: ${booking.tourist.name}` : 'Confirmed Booking'}
                      </h3>
                      <p className="text-xs text-muted-foreground">{booking.tourist?.location || 'N/A'}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                  </div>

                  {booking.tourist && (
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-semibold text-foreground">{booking.tourist.phone_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-semibold text-foreground">{booking.tourist.location || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-semibold text-foreground text-xs">{booking.tourist.email || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold text-foreground">{formatDate(booking.booking_date)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{booking.itinerary?.number_of_days} days</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price</p>
                      <p className="font-semibold text-foreground">
                        ₹{booking.price} {booking.price_type === 'per_day' ? '/ day' : '/ trip'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                  <Button
                    onClick={() => setViewingItinerary(booking)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Itinerary
                  </Button>
                  <Button
                    onClick={() => handleCompleteTrip(booking.id)}
                    disabled={updating === booking.id}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Trip Done
                  </Button>
                  <Button
                    onClick={() => handleCancelBooking(booking.id)}
                    variant="outline"
                    disabled={updating === booking.id}
                  >
                    {updating === booking.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Itinerary Modal */}
      {viewingItinerary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="border border-border p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Trip Details</h2>
                <p className="text-muted-foreground">Tourist: {viewingItinerary.tourist?.name}</p>
              </div>
              <button
                onClick={() => setViewingItinerary(null)}
                className="text-2xl font-bold text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Trip Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Date</p>
                  <p className="font-semibold text-foreground">{formatDate(viewingItinerary.booking_date)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Duration</p>
                  <p className="font-semibold text-foreground">{viewingItinerary.itinerary?.number_of_days} days</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Price</p>
                  <p className="font-semibold text-foreground">₹{viewingItinerary.price} {viewingItinerary.price_type === 'per_day' ? '/ day' : '/ trip'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Status</p>
                  <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
                </div>
              </div>

              {/* Tourist Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Tourist Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">{viewingItinerary.tourist?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{viewingItinerary.tourist?.phone_number || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{viewingItinerary.tourist?.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Overview</h3>
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                  {viewingItinerary.itinerary?.description || 'No overview available'}
                </div>
              </div>

              {/* Places to Visit */}
              {viewingItinerary.itinerary?.places_to_visit && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Places to Visit</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                    {viewingItinerary.itinerary.places_to_visit}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {viewingItinerary.itinerary?.instructions && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Instructions</h3>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                    {viewingItinerary.itinerary.instructions}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {(viewingItinerary.itinerary?.image_1_url || viewingItinerary.itinerary?.image_2_url) && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Gallery</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {viewingItinerary.itinerary?.image_1_url && (
                      <div className="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-square">
                        <img
                          src={viewingItinerary.itinerary.image_1_url}
                          alt="Trip image 1"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {viewingItinerary.itinerary?.image_2_url && (
                      <div className="rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 aspect-square">
                        <img
                          src={viewingItinerary.itinerary.image_2_url}
                          alt="Trip image 2"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setViewingItinerary(null)}
              className="w-full mt-6"
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
