'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase-client';
import { Loader2, AlertCircle, CheckCircle2, Upload, ExternalLink, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MultiLanguageSelect from '@/components/multi-language-select';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import GuideSidebar from '@/components/guide-sidebar';
import DeleteAccountModal from '@/components/delete-account-modal';
import type { Guide } from '@/lib/supabase-client';

export default function EditProfilePage() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: '',
    languages: [] as string[],
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string>('');

  useEffect(() => {
    const checkAuthAndLoadGuide = async () => {
      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();

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

        // Check if status is approved
        if (guideData.status !== 'approved') {
          router.push('/guide/login');
          return;
        }

        setGuide(guideData);
        setFormData({
          name: guideData.name,
          phone_number: guideData.phone_number,
          location: guideData.location,
          languages: Array.isArray(guideData.languages) ? guideData.languages : (guideData.languages ? [guideData.languages] : []),
        });
        // Set current profile picture as preview
        if (guideData.profile_picture_url) {
          setProfilePreview(guideData.profile_picture_url);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadGuide();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (languages: string[]) => {
    setFormData((prev) => ({ ...prev, languages }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      console.error('File upload error:', err);
      throw new Error('Failed to upload profile picture');
    }
  };

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.warn('File deletion warning:', error);
        // Don't throw error for deletion failures, just warn
      }
    } catch (err) {
      console.warn('File delete error:', err);
      // Don't throw error for deletion failures
    }
  };

  const extractStoragePath = (publicUrl: string, bucket: string): string | null => {
    try {
      // Extract path from Supabase storage URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
      const baseUrl = `storage/v1/object/public/${bucket}/`;
      const startIndex = publicUrl.indexOf(baseUrl);
      if (startIndex !== -1) {
        return publicUrl.substring(startIndex + baseUrl.length);
      }
      return null;
    } catch (err) {
      console.warn('Error extracting storage path:', err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!formData.name || !formData.phone_number || !formData.location || formData.languages.length === 0) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      if (!guide) {
        setError('Guide data not found');
        setSaving(false);
        return;
      }

      // Upload new profile picture if selected
      let profilePictureUrl = guide.profile_picture_url;
      if (profilePicture) {
        // Delete old profile picture from storage
        if (guide.profile_picture_url) {
          const oldPath = extractStoragePath(guide.profile_picture_url, 'profile-pictures');
          if (oldPath) {
            await deleteFile('profile-pictures', oldPath);
          }
        }

        // Upload new profile picture
        const timestamp = Date.now();
        const profilePicturePath = `${guide.user_id}/profile-${timestamp}`;
        profilePictureUrl = await uploadFile(
          profilePicture,
          'profile-pictures',
          profilePicturePath
        );
      }

      // Update guide record
      const { error: updateError } = await supabase
        .from('guides')
        .update({
          name: formData.name,
          phone_number: formData.phone_number,
          location: formData.location,
          language: formData.languages[0], // For backward compatibility with existing schema
          languages: formData.languages,
          profile_picture_url: profilePictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guide.id);

      if (updateError) {
        console.error('Update error:', updateError);
        setError('Failed to update profile');
        setSaving(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      
      // Update local state
      setGuide({
        ...guide,
        name: formData.name,
        phone_number: formData.phone_number,
        location: formData.location,
        languages: formData.languages,
        profile_picture_url: profilePictureUrl,
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/guide/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  if (error && !guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleLogout}>Back to Home</Button>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <Button onClick={handleLogout}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} guideName={guide.name} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-3xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <Link href="/guide/dashboard">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">← Back to Dashboard</Button>
          </Link>
        </div>

        <Card className="border border-border p-5 sm:p-6 lg:p-8">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-1 sm:mb-2">Update Your Profile</h2>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-6 sm:mb-8">
            Edit your information and save the changes
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-4 sm:mb-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-200 text-xs sm:text-sm">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                disabled={saving}
                required
                className="text-sm"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-xs sm:text-sm">Phone Number *</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={saving}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Location *</Label>
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                placeholder="Search for your location..."
                disabled={saving}
                apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Languages</Label>
              <MultiLanguageSelect
                value={formData.languages}
                onChange={handleLanguageChange}
                disabled={saving}
              />
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <Label htmlFor="profile_picture" className="text-xs sm:text-sm">Profile Picture</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  id="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={saving}
                  className="hidden"
                />
                <label
                  htmlFor="profile_picture"
                  className="cursor-pointer block"
                >
                  {profilePreview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-lg mb-2"
                      />
                      <p className="text-xs sm:text-sm text-muted-foreground">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-foreground">Upload Profile Picture</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Verified Document (Read-Only) */}
            <div className="space-y-2 bg-muted/50 p-3 sm:p-4 rounded-lg border border-border">
              <Label className="text-xs sm:text-sm text-foreground font-semibold">Verified Document (Read-Only)</Label>
              <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                Your verified document cannot be changed after admin approval
              </p>
              {guide.document_url && (
                <div className="flex items-center justify-between bg-background p-2 sm:p-3 rounded border border-border">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                      {guide.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'}
                    </p>
                  </div>
                  <a
                    href={guide.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs sm:text-sm flex items-center gap-2"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <Button type="submit" className="flex-1 text-sm" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Link href="/guide/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full text-sm">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Danger Zone - Delete Account */}
        <Card className="border border-red-200 bg-red-50 dark:bg-red-950 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Danger Zone
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Irreversible actions
            </p>
          </div>

          <Alert className="mb-4 border-red-300 bg-red-100 dark:bg-red-900">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              Deleting your account will permanently remove all your data including itineraries,
              bookings, ratings received, and all profile information. This action cannot be undone.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete My Account
          </Button>
        </Card>
      </main>

      {/* Delete Account Modal */}
      <DeleteAccountModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </div>
  );
}
