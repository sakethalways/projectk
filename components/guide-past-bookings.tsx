'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Booking } from '@/lib/supabase-client';
import { Loader2, AlertCircle } from 'lucide-react';

interface BookingWithDetails extends Booking {
  tourist?: { id: string; user_id: string; name: string; phone_number: string; location: string; email: string };
  itinerary?: { id: string; number_of_days: number; description: string };
}

export default function GuidePastBookings() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError('Not authenticated');
          return;
        }

        const response = await fetch('/api/get-guide-past-bookings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
        } else {
          setError('Failed to load past bookings');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load past bookings');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    }
    return <Badge variant="outline">Past</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="border border-border p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading past bookings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Past Trips
          {bookings.length > 0 && (
            <Badge variant="outline" className="ml-3">{bookings.length} total</Badge>
          )}
        </h2>
        <p className="text-muted-foreground mt-1">Your tour history</p>
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
          <p className="text-muted-foreground">No past bookings yet</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border border-border p-6 opacity-75 hover:opacity-100 transition-opacity">
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold text-foreground">
                      {booking.tourist ? `Tourist: ${booking.tourist.name}` : 'Past Trip'}
                    </h3>
                    {getStatusBadge(booking.status)}
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
