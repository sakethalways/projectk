'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Phone, MapPin, ExternalLink, Calendar, MapPin as MapIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { Guide, GuideAvailability, GuideItinerary } from '@/lib/supabase-client';

interface GuideDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: Guide;
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
}

export default function GuideDetailModal({
  open,
  onOpenChange,
  guide,
  onApprove,
  onReject,
  loading,
}: GuideDetailModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [availability, setAvailability] = useState<GuideAvailability | null>(null);
  const [itineraries, setItineraries] = useState<GuideItinerary[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (open && (guide.status === 'approved' || guide.status === 'pending')) {
      fetchAvailabilityAndItinerary();
    }
  }, [open, guide.id, guide.status]);

  const fetchAvailabilityAndItinerary = async () => {
    setLoadingDetails(true);
    try {
      // Fetch availability
      const { data: availData } = await supabase
        .from('guide_availability')
        .select('*')
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setAvailability(availData || null);

      // Fetch itineraries
      const { data: itineraryData } = await supabase
        .from('guide_itineraries')
        .select('*')
        .eq('guide_id', guide.id)
        .order('created_at', { ascending: false });

      setItineraries(itineraryData || []);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
    setRejectionReason('');
    setShowRejectionForm(false);
  };

  const handleClose = () => {
    setShowRejectionForm(false);
    setRejectionReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guide Details - {guide.name}</DialogTitle>
          <DialogDescription>
            Review guide information and make approval decision
          </DialogDescription>
        </DialogHeader>

        {guide.status !== 'pending' && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
            <Badge
              variant={guide.status === 'approved' ? 'default' : 'destructive'}
            >
              {guide.status.toUpperCase()}
            </Badge>
            {guide.status === 'rejected' && guide.rejection_reason && (
              <p className="text-sm text-muted-foreground">
                Reason: {guide.rejection_reason}
              </p>
            )}
          </div>
        )}

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="photo">Photo</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            {guide.status === 'approved' && (
              <>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Information Tab */}
          <TabsContent value="info" className="space-y-4">
            {guide.profile_picture_url && (
              <div className="flex gap-4 items-start">
                <img
                  src={guide.profile_picture_url}
                  alt={guide.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{guide.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Registered {new Date(guide.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-4">
              {/* Email */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Email</Label>
                </div>
                <p className="text-foreground font-medium">{guide.email}</p>
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                </div>
                <p className="text-foreground font-medium">{guide.phone_number}</p>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-xs text-muted-foreground">Location</Label>
                </div>
                <p className="text-foreground font-medium">{guide.location}</p>
              </div>

              {/* Document Type */}
              <div>
                <Label className="text-xs text-muted-foreground">Document Type</Label>
                <p className="text-foreground font-medium capitalize">
                  {guide.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'}
                </p>
              </div>

              {/* Languages */}
              <div>
                <Label className="text-xs text-muted-foreground">Languages</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {Array.isArray(guide.languages) ? (
                    guide.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))
                  ) : (
                    <Badge variant="secondary">{guide.languages || 'Not specified'}</Badge>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Photo Tab */}
          <TabsContent value="photo" className="space-y-4">
            {guide.profile_picture_url ? (
              <div>
                <img
                  src={guide.profile_picture_url}
                  alt={guide.name}
                  className="w-full max-h-96 object-contain rounded-lg border border-border"
                />
                <a
                  href={guide.profile_picture_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in new tab
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground">No profile picture available</p>
            )}
          </TabsContent>

          {/* Document Tab */}
          <TabsContent value="document" className="space-y-4">
            {guide.document_url ? (
              <div>
                <img
                  src={guide.document_url}
                  alt="Document"
                  className="w-full max-h-96 object-contain rounded-lg border border-border"
                />
                <a
                  href={guide.document_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in new tab
                </a>
              </div>
            ) : (
              <p className="text-muted-foreground">No document available</p>
            )}
          </TabsContent>

          {/* Availability Tab */}
          {guide.status === 'approved' && (
            <TabsContent value="availability" className="space-y-4">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : availability ? (
                <div className="space-y-4">
                  {/* Availability Status */}
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Status</h4>
                      <Badge variant={availability.is_available ? 'default' : 'secondary'}>
                        {availability.is_available ? '✓ Available' : '🚫 On Leave'}
                      </Badge>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <Label className="text-xs text-muted-foreground">Availability Period</Label>
                    </div>
                    <p className="text-foreground font-medium">
                      {new Date(availability.start_date).toLocaleDateString()} to{' '}
                      {new Date(availability.end_date).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Last Updated */}
                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(availability.updated_at).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-muted-foreground">Not created yet</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Itinerary Tab */}
          {guide.status === 'approved' && (
            <TabsContent value="itinerary" className="space-y-4">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : itineraries.length > 0 ? (
                <div className="space-y-4">
                  {itineraries.map((itinerary) => (
                    <div key={itinerary.id} className="p-4 rounded-lg border border-border space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-foreground">{itinerary.number_of_days}-Day Itinerary</h4>
                        <div className="flex gap-2 flex-wrap justify-end">
                          <Badge variant="outline">{itinerary.timings}</Badge>
                          <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                            ₹{itinerary.price.toLocaleString('en-IN')} {itinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Description</Label>
                        <p className="text-foreground text-sm mt-1">{itinerary.description}</p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Places to Visit</Label>
                        <p className="text-foreground text-sm mt-1 whitespace-pre-wrap">{itinerary.places_to_visit}</p>
                      </div>

                      {itinerary.instructions && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Instructions</Label>
                          <p className="text-foreground text-sm mt-1">{itinerary.instructions}</p>
                        </div>
                      )}

                      {(itinerary.image_1_url || itinerary.image_2_url) && (
                        <div>
                          <Label className="text-xs text-muted-foreground mb-2 block">Images</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {itinerary.image_1_url && (
                              <a
                                href={itinerary.image_1_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group"
                              >
                                <img
                                  src={itinerary.image_1_url}
                                  alt="Itinerary 1"
                                  className="w-full h-24 object-cover rounded-md border border-border"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                  <ExternalLink className="w-5 h-5 text-white" />
                                </div>
                              </a>
                            )}
                            {itinerary.image_2_url && (
                              <a
                                href={itinerary.image_2_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group"
                              >
                                <img
                                  src={itinerary.image_2_url}
                                  alt="Itinerary 2"
                                  className="w-full h-24 object-cover rounded-md border border-border"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                  <ExternalLink className="w-5 h-5 text-white" />
                                </div>
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Created: {new Date(itinerary.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted border border-border">
                  <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <p className="text-muted-foreground">Not created yet</p>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        {/* Actions */}
        {guide.status === 'pending' && (
          <div className="space-y-4 border-t border-border pt-6">
            {showRejectionForm ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Rejection Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="destructive"
                    onClick={handleRejectSubmit}
                    disabled={loading || !rejectionReason.trim()}
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      'Confirm Rejection'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectionForm(false);
                      setRejectionReason('');
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={onApprove}
                  disabled={loading}
                  className="flex-1 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    '✓ Approve Guide'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectionForm(true)}
                  disabled={loading}
                  className="flex-1"
                >
                  ✗ Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
