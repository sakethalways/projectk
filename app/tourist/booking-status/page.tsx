'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Booking } from '@/lib/supabase-client';
import { Loader2, AlertCircle, CheckCircle, XCircle, Clock, Trash2, Compass, Heart, MapPin, Star } from 'lucide-react';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

interface BookingWithDetails extends Booking {
  guide?: { id: string; name: string; location: string; phone_number?: string; profile_picture_url?: string };
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

export default function TouristBookingStatus() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewingItinerary, setViewingItinerary] = useState<BookingWithDetails | null>(null);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('tourist_id');
    router.push('/');
  };

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      if (!supabase) {
        setError('Service unavailable');
        setLoading(false);
        return;
      }
      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.push('/tourist/login');
          return;
        }

        setUser(authData.user);

        // Fetch tourist profile
        const { data: profileData } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (profileData) setProfile(profileData);

        // Load bookings
        await loadBookings(authData.user.id);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [router]);

  const loadBookings = async (userId: string) => {
    if (!supabase) return;
    try {
      // Get fresh session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        // Redirect to login if no session
        router.push('/tourist/login');
        return;
      }

      const response = await fetch('/api/get-tourist-bookings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      if (!supabase) {
        setError('Service unavailable');
        return;
      }
      setDeleting(bookingId);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        setDeleting(null);
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
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
    } finally {
      setDeleting(null);
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'past':
        return <Badge variant="outline">Past</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Status</h1>
          <p className="text-muted-foreground">View and manage your tour bookings</p>
        </div>

        {/* Error */}
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* No Bookings */}
        {bookings.length === 0 ? (
          <Card className="border border-border p-12 text-center">
            <p className="text-muted-foreground mb-4">No bookings yet</p>
            <Button onClick={() => router.push('/tourist/explore-guides')}>
              Explore Guides
            </Button>
          </Card>
        ) : (
          <div>
            {/* Active Bookings */}
            {bookings.filter(b => ['pending', 'accepted', 'rejected'].includes(b.status)).length > 0 ? (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Active Bookings</h2>
                <div className="grid gap-4">
                  {bookings
                    .filter(b => ['pending', 'accepted', 'rejected'].includes(b.status))
                    .map((booking) => (
                      <Card key={booking.id} className="border border-border p-6">
                        <div className="flex flex-col gap-4">
                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              {booking.guide?.profile_picture_url && (
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={booking.guide.profile_picture_url} alt={booking.guide.name} />
                                  <AvatarFallback>{booking.guide.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                  {booking.guide?.name}
                                </h3>
                                <p className="text-xs text-muted-foreground">{booking.guide?.location}</p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <p className="text-muted-foreground">Location</p>
                                <p className="font-semibold text-foreground">{booking.guide?.location}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-semibold text-foreground">{booking.guide?.phone_number || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-semibold text-foreground">{formatDate(booking.booking_date)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-semibold text-foreground">{booking.itinerary?.number_of_days} days</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-muted-foreground">Price</p>
                                <p className="font-semibold text-foreground text-lg">
                                  ₹{booking.price} {booking.price_type === 'per_day' ? '/ day' : '/ trip'}
                                </p>
                              </div>
                            </div>

                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              onClick={() => setViewingItinerary(booking)}
                              variant="outline"
                              size="sm"
                              className="flex-1 min-w-[120px]"
                            >
                              View Itinerary
                            </Button>
                            {booking.status === 'pending' && (
                              <Button
                                onClick={() => handleCancelBooking(booking.id)}
                                variant="outline"
                                size="sm"
                                disabled={deleting === booking.id}
                                className="flex-1 min-w-[100px] text-destructive hover:bg-destructive/10"
                              >
                                {deleting === booking.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>  
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Cancel
                                  </>
                                )}
                              </Button>
                            )}

                            {booking.status === 'accepted' && (
                              <Button
                                onClick={() => handleCancelBooking(booking.id)}
                                variant="outline"
                                size="sm"
                                disabled={deleting === booking.id}
                                className="flex-1 min-w-[100px]"
                              >
                                {deleting === booking.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  'Cancel'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ) : (
              <Card className="border border-border p-12 text-center">
                <p className="text-muted-foreground mb-4">No active bookings</p>
                <div className="space-y-2">
                  <Button onClick={() => router.push('/tourist/explore-guides')}>
                    Book a Guide
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">View your past bookings in the <strong>Past Bookings</strong> section</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </ResponsiveContainer>

      {/* Itinerary Modal */}
      {viewingItinerary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="border border-border p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Trip Details</h2>
                {viewingItinerary && (
                  <p className="text-muted-foreground">{viewingItinerary.guide?.name} - {viewingItinerary.guide?.location}</p>
                )}
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
                  <div>{getStatusBadge(viewingItinerary.status)}</div>
                </div>
              </div>

              {/* Guide Info */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground">Guide Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-semibold">{viewingItinerary.guide?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-semibold">{viewingItinerary.guide?.phone_number || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-semibold">{viewingItinerary.guide?.location}</p>
                  </div>
                </div>
              </div>

              {/* Itinerary Description */}
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
    </>
  );
}
