'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Booking } from '@/lib/supabase-client';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface BookingWithDetails extends Booking {
  tourist?: { id: string; user_id: string; name: string; phone_number: string; location: string; email: string };
  itinerary?: { id: string; number_of_days: number; description: string };
}

export default function GuideConfirmedBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

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
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {booking.tourist ? `Tourist: ${booking.tourist.name}` : 'Confirmed Booking'}
                    </h3>
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

                  {booking.itinerary?.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {booking.itinerary.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[140px]">
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
    </div>
  );
}
