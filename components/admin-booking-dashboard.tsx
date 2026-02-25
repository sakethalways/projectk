'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { Booking } from '@/lib/supabase-client';
import { Loader2, AlertCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BookingWithDetails extends Booking {
  tourist?: { id: string; user_id: string; name: string; phone_number: string; location: string; email: string; profile_picture_url?: string };
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

export default function AdminBookingDashboard() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'active' | 'past' | 'all'>('all');
  const [viewingItinerary, setViewingItinerary] = useState<BookingWithDetails | null>(null);

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const loadBookings = async () => {
    if (!supabase) {
      setError('Service unavailable');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/get-admin-bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      } else {
        setError('Failed to load bookings');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
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

  const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'past' || b.status === 'completed');

  if (loading) {
    return (
      <Card className="border border-border p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading bookings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Booking Management</h2>
        <p className="text-muted-foreground mt-1">View and manage all platform bookings</p>
      </div>

      {/* Error */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Card className="border border-border p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground mb-1">{bookings.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Total Bookings</p>
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 mb-1">{activeBookings.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
          </div>
        </Card>
        <Card className="border border-border p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 mb-1">{pastBookings.length}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as 'active' | 'past' | 'all')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="past">Completed</TabsTrigger>
          <TabsTrigger value="all">All Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value={filterStatus} className="space-y-4 mt-6">
          {bookings.length === 0 ? (
            <Card className="border border-border border-dashed p-12 text-center">
              <p className="text-muted-foreground">No bookings found</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="border border-border p-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Left Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="font-semibold text-foreground">{booking.id.slice(0, 8)}...</h3>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="space-y-3 text-sm">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {booking.tourist?.profile_picture_url && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.tourist.profile_picture_url} alt={booking.tourist.name} />
                                <AvatarFallback>{booking.tourist.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="text-muted-foreground">Tourist</p>
                              <p className="font-medium text-foreground">{booking.tourist?.name || 'N/A'}</p>
                            </div>
                          </div>
                          {booking.tourist && (
                            <p className="text-xs text-muted-foreground ml-10">
                              {booking.tourist.phone_number} • {booking.tourist.location}
                            </p>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {booking.guide?.profile_picture_url && (
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={booking.guide.profile_picture_url} alt={booking.guide.name} />
                                <AvatarFallback>{booking.guide.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                            )}
                            <div>
                              <p className="text-muted-foreground">Guide</p>
                              <p className="font-medium text-foreground">{booking.guide?.name}</p>
                            </div>
                          </div>
                          {booking.guide && (
                            <p className="text-xs text-muted-foreground ml-10">
                              {booking.guide.phone_number || 'N/A'} • {booking.guide.location}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium text-foreground">{formatDate(booking.booking_date)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="font-medium text-foreground">{booking.itinerary?.number_of_days} days</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium text-foreground">
                            ₹{booking.price} {booking.price_type === 'per_day' ? '/ day' : '/ trip'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.itinerary && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground">Itinerary</p>
                      <Button
                        onClick={() => setViewingItinerary(booking)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        View Itinerary
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Itinerary Modal */}
      {viewingItinerary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="border border-border p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Trip Details</h2>
                <p className="text-muted-foreground">{viewingItinerary.guide?.name} - {viewingItinerary.guide?.location}</p>
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
