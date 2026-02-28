'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { sendNotification } from '@/lib/send-notification';
import { CheckCircle, XCircle, Clock, Eye, Trash2, Ban } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Guide } from '@/lib/supabase-client';
import GuideDetailModal from '@/components/guide-detail-modal';
import AdminActionsModal from '@/components/admin-actions-modal';
import AdminBookingDashboard from '@/components/admin-booking-dashboard';
import ResponsiveContainer from '@/components/layouts/ResponsiveContainer';

interface Tourist {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone_number: string;
  location: string;
  profile_picture_url: string | null;
  created_at: string;
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
  const [adminAction, setAdminAction] = useState<'deactivate' | 'delete' | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') || 'pending';
    setActiveTab(tabParam);
  }, [searchParams]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!supabase) {
      setError('Supabase configuration error');
      setLoading(false);
      return;
    }

    try {
      // Verify admin access
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push('/admin/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userData?.role !== 'admin') {
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      // Load guides
      const { data: guidesData } = await supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false });

      setGuides(guidesData || []);

      // Load tourists
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await fetch('/api/get-tourists', {
          headers: { 'Authorization': `Bearer ${session?.access_token || ''}` },
        });
        if (response.ok) {
          const data = await response.json();
          setTourists(data.tourists || []);
        }
      } catch (err) {
        console.error('Loading tourists:', err);
      }
    } catch (err) {
      console.error('Load error:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pendingGuides = guides.filter(g => g.status === 'pending');
  const approvedGuides = guides.filter(g => g.status === 'approved');
  const rejectedGuides = guides.filter(g => g.status === 'rejected');

  const handleApprove = async (guide: Guide) => {
    if (!supabase) return;
    setActionLoading(guide.id);
    try {
      await supabase.from('guides').update({ status: 'approved' }).eq('id', guide.id);
      await sendNotification(
        guide.user_id,
        'guide_approved',
        '✅ Application Approved',
        'Your application has been approved!',
        { relatedGuideId: guide.id }
      );
      setGuides(guides.map(g => g.id === guide.id ? { ...g, status: 'approved' } : g));
      setShowModal(false);
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (guide: Guide, reason: string) => {
    if (!supabase) return;
    setActionLoading(guide.id);
    try {
      await supabase.from('guides').update({ status: 'rejected', rejection_reason: reason }).eq('id', guide.id);
      await sendNotification(
        guide.user_id,
        'guide_rejected',
        '❌ Application Rejected',
        `Reason: ${reason}`,
        { relatedGuideId: guide.id }
      );
      setGuides(guides.map(g => g.id === guide.id ? { ...g, status: 'rejected', rejection_reason: reason } : g));
      setShowModal(false);
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error && guides.length === 0) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button
            onClick={() => router.push('/admin/login')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer>
          {/* Header */}
          <section className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">
              Administration
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage guides, tourists, and bookings
            </p>
          </section>

          {/* Stats */}
          <section className="mb-8">
            <h2 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-dark-text mt-2">
                      {pendingGuides.length}
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-amber-600 dark:text-amber-500 opacity-30" />
                </div>
              </Card>

              <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-dark-text mt-2">
                      {approvedGuides.length}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-500 opacity-30" />
                </div>
              </Card>

              <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-dark-text mt-2">
                      {rejectedGuides.length}
                    </p>
                  </div>
                  <XCircle className="w-12 h-12 text-red-600 dark:text-red-500 opacity-30" />
                </div>
              </Card>
            </div>
          </section>

          {/* Content */}
          <section>
            <Tabs
              value={activeTab}
              onValueChange={value => {
                setActiveTab(value);
                router.push(`/admin/dashboard?tab=${value}`);
              }}
            >
              <TabsList className="grid w-full grid-cols-5 mb-6 bg-white dark:bg-dark-surface border border-emerald-200 dark:border-slate-700 p-1 rounded-lg">
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Pending</span>
                  <span className="sm:hidden text-xs">{pendingGuides.length}</span>
                </TabsTrigger>
                <TabsTrigger value="approved" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Approved</span>
                  <span className="sm:hidden text-xs">{approvedGuides.length}</span>
                </TabsTrigger>
                <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Rejected</span>
                  <span className="sm:hidden text-xs">{rejectedGuides.length}</span>
                </TabsTrigger>
                <TabsTrigger value="tourists" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Tourists</span>
                  <span className="sm:hidden text-xs">{tourists.length}</span>
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs sm:text-sm">
                  Bookings
                </TabsTrigger>
              </TabsList>

              {/* Pending Tab */}
              <TabsContent value="pending" className="space-y-4">
                {pendingGuides.length === 0 ? (
                  <Card className="border border-emerald-200 dark:border-slate-700 p-12 text-center bg-white dark:bg-dark-surface">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No pending guides</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingGuides.map(guide => (
                      <GuideCard
                        key={guide.id}
                        guide={guide}
                        onView={() => {
                          setSelectedGuide(guide);
                          setShowModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Approved Tab */}
              <TabsContent value="approved" className="space-y-4">
                {approvedGuides.length === 0 ? (
                  <Card className="border border-emerald-200 dark:border-slate-700 p-12 text-center bg-white dark:bg-dark-surface">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No approved guides</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {approvedGuides.map(guide => (
                      <GuideCard
                        key={guide.id}
                        guide={guide}
                        status="approved"
                        onView={() => {
                          setSelectedGuide(guide);
                          setShowModal(true);
                        }}
                        onDeactivate={() => {
                          setSelectedGuide(guide);
                          setAdminAction('deactivate');
                          setShowActionModal(true);
                        }}
                        onDelete={() => {
                          setSelectedGuide(guide);
                          setAdminAction('delete');
                          setShowActionModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Rejected Tab */}
              <TabsContent value="rejected" className="space-y-4">
                {rejectedGuides.length === 0 ? (
                  <Card className="border border-emerald-200 dark:border-slate-700 p-12 text-center bg-white dark:bg-dark-surface">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No rejected guides</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {rejectedGuides.map(guide => (
                      <GuideCard
                        key={guide.id}
                        guide={guide}
                        status="rejected"
                        rejectionReason={guide.rejection_reason}
                        onView={() => {
                          setSelectedGuide(guide);
                          setShowModal(true);
                        }}
                        onDelete={() => {
                          setSelectedGuide(guide);
                          setAdminAction('delete');
                          setShowActionModal(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tourists Tab */}
              <TabsContent value="tourists" className="space-y-4">
                {tourists.length === 0 ? (
                  <Card className="border border-emerald-200 dark:border-slate-700 p-12 text-center bg-white dark:bg-dark-surface">
                    <p className="text-sm text-gray-600 dark:text-gray-400">No tourists registered</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {tourists.map(tourist => (
                      <TouristCard key={tourist.id} tourist={tourist} />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <AdminBookingDashboard />
              </TabsContent>
            </Tabs>
          </section>

      {selectedGuide && (
        <GuideDetailModal
          open={showModal}
          onOpenChange={setShowModal}
          guide={selectedGuide}
          onApprove={() => handleApprove(selectedGuide)}
          onReject={reason => handleReject(selectedGuide, reason)}
          loading={actionLoading === selectedGuide.id}
        />
      )}

      <AdminActionsModal
        guide={selectedGuide}
        action={adminAction}
        open={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setAdminAction(null);
          setSelectedGuide(null);
        }}
        onSuccess={() => {
          setShowActionModal(false);
          loadDashboardData();
        }}
      />
    </ResponsiveContainer>
  );
}

// Sub-component for guide cards
interface GuideCardProps {
  guide: Guide;
  status?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string | null;
  onView: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
}

function GuideCard({ guide, status, rejectionReason, onView, onDeactivate, onDelete }: GuideCardProps) {
  return (
    <Card className={`border p-6 bg-white dark:bg-dark-surface ${
      status === 'approved' ? 'border-emerald-200 dark:border-emerald-900' :
      status === 'rejected' ? 'border-red-200 dark:border-red-900' :
      'border-emerald-200 dark:border-slate-700'
    }`}>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {guide.profile_picture_url && (
          <img
            src={guide.profile_picture_url}
            alt={guide.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-1">
            {guide.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-gray-200">{guide.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-gray-200">{guide.phone_number}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-gray-900 dark:text-gray-200">{guide.location}</p>
            </div>
            {rejectionReason && (
              <div className="sm:col-span-2">
                <p className="text-gray-600 dark:text-gray-400">Rejection Reason</p>
                <p className="text-gray-900 dark:text-gray-200">{rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 sm:flex-col flex-shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            className="flex-1 sm:flex-none gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
            onClick={onView}
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">View</span>
          </Button>
          {status === 'approved' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 sm:flex-none gap-1 text-xs"
                onClick={onDeactivate}
              >
                <Ban className="w-4 h-4" />
                <span className="hidden sm:inline">Deactivate</span>
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="flex-1 sm:flex-none gap-1 text-xs"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
          {status === 'rejected' && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 sm:flex-none gap-1 text-xs"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// Sub-component for tourist cards
interface TouristCardProps {
  tourist: Tourist;
}

function TouristCard({ tourist }: TouristCardProps) {
  return (
    <Card className="border border-emerald-200 dark:border-slate-700 p-6 bg-white dark:bg-dark-surface">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {tourist.profile_picture_url && (
          <img
            src={tourist.profile_picture_url}
            alt={tourist.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover flex-shrink-0"
          />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-dark-text mb-1">
            {tourist.name}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Email</p>
              <p className="text-gray-900 dark:text-gray-200">{tourist.email}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Phone</p>
              <p className="text-gray-900 dark:text-gray-200">{tourist.phone_number}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-600 dark:text-gray-400">Location</p>
              <p className="text-gray-900 dark:text-gray-200">{tourist.location}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Member Since</p>
              <p className="text-gray-900 dark:text-gray-200">
                {new Date(tourist.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
