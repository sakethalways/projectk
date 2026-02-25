'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';
import { MapPin, Mail, Phone, FileText, Globe } from 'lucide-react';
import GuideSidebar from '@/components/guide-sidebar';
import type { Guide } from '@/lib/supabase-client';

export default function GuideProfile() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuthAndLoadGuide = async () => {
      try {
        if (!supabase) {
          setError('Supabase not initialized');
          setLoading(false);
          return;
        }
        // Get current user
        const { data: authData, error: authError } = await supabase!.auth.getUser();

        if (authError || !authData.user) {
          router.push('/guide/login');
          return;
        }

        // Get guide data
        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError || !guideData) {
          setError('Failed to load guide data');
          return;
        }

        // Check if status is not approved
        if (guideData.status !== 'approved') {
          router.push('/guide/login');
          return;
        }

        setGuide(guideData);
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadGuide();
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase!.auth.signOut();
    localStorage.removeItem('guide_id');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Failed to load guide data'}</p>
          <Link href="/guide/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} guideName={guide.name} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="mb-6 sm:mb-8">
          <Card className="border border-border p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
              {guide.profile_picture_url && (
                <img
                  src={guide.profile_picture_url}
                  alt={guide.name}
                  className="w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 rounded-full object-cover border-4 border-border flex-shrink-0"
                />
              )}
              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">{guide.name}</h2>
                  <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-full text-xs sm:text-sm font-semibold">
                    Verified ✓
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-1">{guide.email}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Member since {new Date(guide.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Information Sections */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Contact Information */}
          <Card className="border border-border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Contact Information</h3>
            <div className="space-y-4 sm:space-y-6">
              {/* Email */}
              <div className="flex items-start gap-3 sm:gap-4">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Email Address</p>
                  <p className="text-sm sm:text-base text-foreground font-medium">{guide.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3 sm:gap-4">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Phone Number</p>
                  <p className="text-sm sm:text-base text-foreground font-medium">{guide.phone_number}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 sm:gap-4">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Location</p>
                  <p className="text-sm sm:text-base text-foreground font-medium">{guide.location}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="border border-border p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Additional Information</h3>
            <div className="space-y-4 sm:space-y-6">
              {/* Languages */}
              <div className="flex items-start gap-3 sm:gap-4">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(guide.languages) && guide.languages.length > 0 ? (
                      guide.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="text-xs sm:text-sm">{lang}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-foreground font-medium">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Type */}
              <div className="flex items-start gap-3 sm:gap-4">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Verified Document</p>
                  <p className="text-sm sm:text-base text-foreground font-medium capitalize">
                    {guide.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'}
                  </p>
                </div>
              </div>

              {/* Document Link */}
              {guide.document_url && (
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">View Document</p>
                  <a
                    href={guide.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium text-xs sm:text-sm"
                  >
                    Open Document →
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Edit Button */}
        <div className="mb-6 sm:mb-8">
          <Link href="/guide/edit-profile" className="block">
            <Button className="w-full text-sm sm:text-base py-2 sm:py-3" size="lg">
              Edit Profile Information
            </Button>
          </Link>
        </div>

        {/* Info Card */}
        <Card className="border border-border p-4 sm:p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-sm sm:text-base text-foreground mb-2">📝 Note</h4>
          <p className="text-muted-foreground text-xs sm:text-sm">
            You can edit your name, phone, location, language, and profile picture by clicking the "Edit Profile Information" button. 
            Your verified document cannot be changed after approval.
          </p>
        </Card>
      </main>
    </div>
  );
}
