'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { sendNotification } from '@/lib/send-notification';
import { CheckCircle, XCircle, Clock, Eye, Trash2, Ban, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { Guide } from '@/lib/supabase-client';
import GuideDetailModal from '@/components/guide-detail-modal';
import AdminActionsModal from '@/components/admin-actions-modal';
import AdminSidebar from '@/components/admin-sidebar';
import AdminBookingDashboard from '@/components/admin-booking-dashboard';
import { Loader2 } from 'lucide-react';

interface Tourist {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  location: string;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('pending');
  
  const [guides, setGuides] = useState<Guide[]>([]);
  const [tourists, setTourists] = useState<Tourist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminAction, setAdminAction] = useState<'deactivate' | 'activate' | 'delete' | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  // Handle search params
  useEffect(() => {
    const tabParam = searchParams.get('tab') || 'pending';
    setActiveTab(tabParam);
  }, [searchParams]);
  
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      if (!supabase) {
        setError('Supabase is not configured');
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          router.push('/admin/login');
          return;
        }

        // Check if user is admin
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', authData.user.id)
          .single();

        if (userError || userData?.role !== 'admin') {
          await supabase.auth.signOut();
          router.push('/admin/login');
          return;
        }

        // Sync all guides' trips_completed counts
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch('/api/sync-trips-completed', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token || ''}`,
            },
          });
        } catch (err) {
          console.error('Error syncing trips_completed:', err);
          // Continue anyway, not critical
        }

        // Load all guides
        const { data: guidesData, error: guidesError } = await supabase
          .from('guides')
          .select('*')
          .order('created_at', { ascending: false });

        if (guidesError) {
          setError('Failed to load guides');
          return;
        }

        setGuides(guidesData || []);

        // Load all tourists
        try {
          // Get the auth token
          const { data: { session } } = await supabase.auth.getSession();
          
          const response = await fetch('/api/get-tourists', {
            headers: {
              'Authorization': `Bearer ${session?.access_token || ''}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setTourists(data.tourists || []);
          }
        } catch (err) {
          console.error('Error loading tourists:', err);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleApprove = async (guide: Guide) => {
    if (!supabase) return;
    setActionLoading(guide.id);
    try {
      const { error } = await supabase
        .from('guides')
        .update({ status: 'approved' })
        .eq('id', guide.id);

      if (error) throw error;

      // Send notification to guide
      await sendNotification(
        guide.user_id,
        'guide_approved',
        '✅ Guide Application Approved',
        'Congratulations! Your guide application has been approved. You can now start accepting bookings.',
        { relatedGuideId: guide.id }
      );

      // Notify all admins about the approval
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          if (admin.id !== (await supabase.auth.getUser()).data.user?.id) { // Don't notify self
            await sendNotification(
              admin.id,
              'admin_action',
              '✅ Guide Approved',
              `Guide ${guide.name} has been approved.`,
              { relatedGuideId: guide.id }
            );
          }
        }
      }

      setGuides(guides.map(g => g.id === guide.id ? { ...g, status: 'approved' } : g));
      setShowModal(false);
    } catch (err) {
      console.error('Error approving guide:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (guide: Guide, reason: string) => {
    if (!supabase) return;
    setActionLoading(guide.id);
    try {
      const { error } = await supabase
        .from('guides')
        .update({ status: 'rejected', rejection_reason: reason })
        .eq('id', guide.id);

      if (error) throw error;

      // Send notification to guide
      await sendNotification(
        guide.user_id,
        'guide_rejected',
        '❌ Guide Application Rejected',
        `Your guide application has been rejected. Reason: ${reason}. You can reapply after addressing the feedback.`,
        { relatedGuideId: guide.id }
      );

      // Notify all admins about the rejection
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      if (admins && admins.length > 0) {
        for (const admin of admins) {
          if (admin.id !== (await supabase.auth.getUser()).data.user?.id) { // Don't notify self
            await sendNotification(
              admin.id,
              'admin_action',
              '❌ Guide Rejected',
              `Guide ${guide.name} has been rejected.`,
              { relatedGuideId: guide.id }
            );
          }
        }
      }

      setGuides(guides.map(g => g.id === guide.id ? { ...g, status: 'rejected', rejection_reason: reason } : g));
      setShowModal(false);
    } catch (err) {
      console.error('Error rejecting guide:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdminActionSuccess = async () => {
    setShowActionModal(false);
    if (!supabase) return;
    // Reload guides
    const { data: guidesData } = await supabase
      .from('guides')
      .select('*')
      .order('created_at', { ascending: false });
    if (guidesData) setGuides(guidesData);
  };

  const pendingGuides = guides.filter((g) => g.status === 'pending');
  const approvedGuides = guides.filter((g) => g.status === 'approved');
  const rejectedGuides = guides.filter((g) => g.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error && guides.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleLogout}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{pendingGuides.length}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 opacity-50 flex-shrink-0" />
            </div>
          </Card>

          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{approvedGuides.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 opacity-50 flex-shrink-0" />
            </div>
          </Card>

          <Card className="border border-border p-4 sm:p-5 lg:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{rejectedGuides.length}</p>
              </div>
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 opacity-50 flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          router.push(`/admin/dashboard?tab=${value}`);
        }} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{pendingGuides.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="text-xs sm:text-sm">
              Approved <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{approvedGuides.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">
              Rejected <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{rejectedGuides.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="tourists" className="text-xs sm:text-sm">
              Tourists <Badge variant="outline" className="ml-1 sm:ml-2 text-xs">{tourists.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">
              Bookings
            </TabsTrigger>
          </TabsList>

          {/* Pending Guides */}
          <TabsContent value="pending" className="mt-6">
            {pendingGuides.length === 0 ? (
              <Card className="border border-border p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No pending guides for review</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {pendingGuides.map((guide) => (
                  <Card key={guide.id} className="border border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Profile Picture */}
                      {guide.profile_picture_url && (
                        <img
                          src={guide.profile_picture_url}
                          alt={guide.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground">{guide.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="text-foreground">{guide.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="text-foreground">{guide.phone_number}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">Location</p>
                            <p className="text-foreground">{guide.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Languages</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.isArray(guide.languages) ? (
                                guide.languages.map((lang) => (
                                  <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs">{guide.languages || 'Not specified'}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Document Type</p>
                            <p className="text-foreground capitalize">{guide.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:flex-col sm:gap-2 justify-start flex-shrink-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="gap-1 text-xs flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setSelectedGuide(guide);
                            setShowModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approved Guides */}
          <TabsContent value="approved" className="mt-6">
            {approvedGuides.length === 0 ? (
              <Card className="border border-border p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No approved guides yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {approvedGuides.map((guide) => (
                  <Card key={guide.id} className="border border-border p-4 sm:p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {guide.profile_picture_url && (
                        <img
                          src={guide.profile_picture_url}
                          alt={guide.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{guide.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="text-foreground">{guide.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="text-foreground">{guide.phone_number}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">Location</p>
                            <p className="text-foreground">{guide.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Languages</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Array.isArray(guide.languages) ? (
                                guide.languages.map((lang) => (
                                  <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                                ))
                              ) : (
                                <Badge variant="secondary" className="text-xs">{guide.languages || 'Not specified'}</Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Document Type</p>
                            <p className="text-foreground capitalize">{guide.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 sm:flex-col sm:gap-2 justify-start flex-shrink-0 w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="gap-1 text-xs flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            setSelectedGuide(guide);
                            setShowModal(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs flex-1 sm:flex-none"
                          onClick={() => {
                            setSelectedGuide(guide);
                            setAdminAction('deactivate');
                            setShowActionModal(true);
                          }}
                        >
                          <Ban className="w-4 h-4" />
                          <span className="hidden sm:inline">Deactivate</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1 text-xs flex-1 sm:flex-none"
                          onClick={() => {
                            setSelectedGuide(guide);
                            setAdminAction('delete');
                            setShowActionModal(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Guides */}
          <TabsContent value="rejected" className="mt-6">
            {rejectedGuides.length === 0 ? (
              <Card className="border border-border p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No rejected guides</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {rejectedGuides.map((guide) => (
                  <Card key={guide.id} className="border border-border p-4 sm:p-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {guide.profile_picture_url && (
                        <img
                          src={guide.profile_picture_url}
                          alt={guide.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{guide.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="text-foreground">{guide.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="text-foreground">{guide.phone_number}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">Reason for Rejection</p>
                            {guide.rejection_reason && (
                              <p className="text-foreground">{guide.rejection_reason}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:flex-col sm:gap-2 justify-start flex-shrink-0 w-full sm:w-auto">
                        {!guide.is_resubmitted && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1 text-xs flex-1 sm:flex-none"
                            onClick={() => {
                              setSelectedGuide(guide);
                              setAdminAction('delete');
                              setShowActionModal(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tourists */}
          <TabsContent value="tourists" className="mt-6">
            {tourists.length === 0 ? (
              <Card className="border border-border p-8 sm:p-12 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">No tourists registered yet</p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:gap-6">
                {tourists.map((tourist) => (
                  <Card key={tourist.id} className="border border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {tourist.profile_picture_url && (
                        <img
                          src={tourist.profile_picture_url}
                          alt={tourist.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{tourist.name}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground">Email</p>
                            <p className="text-foreground">{tourist.email}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Phone</p>
                            <p className="text-foreground">{tourist.phone_number}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <p className="text-muted-foreground">Location</p>
                            <p className="text-foreground">{tourist.location}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Member Since</p>
                            <p className="text-foreground">
                              {new Date(tourist.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <AdminBookingDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Detail Modal */}
      {selectedGuide && (
        <GuideDetailModal
          open={showModal}
          onOpenChange={setShowModal}
          guide={selectedGuide}
          onApprove={() => handleApprove(selectedGuide)}
          onReject={(reason) => handleReject(selectedGuide, reason)}
          loading={actionLoading === selectedGuide.id}
        />
      )}

      {/* Admin Actions Modal */}
      <AdminActionsModal
        guide={selectedGuide}
        action={adminAction}
        open={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setAdminAction(null);
          setSelectedGuide(null);
        }}
        onSuccess={handleAdminActionSuccess}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
