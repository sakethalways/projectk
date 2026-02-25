'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase-client';
import GuideSidebar from '@/components/guide-sidebar';
import MultiLanguageSelect from '@/components/multi-language-select';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import DeleteAccountModal from '@/components/delete-account-modal';
import { Loader2, AlertCircle, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import type { Guide } from '@/lib/supabase-client';

export default function GuideAccountPage() {
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone_number: '',
    languages: [] as string[],
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const loadGuide = async () => {
      try {
        if (!supabase) {
          setError('Supabase not initialized');
          setLoading(false);
          return;
        }
        const { data: authData } = await supabase!.auth.getUser();

        if (!authData.user) {
          router.push('/guide/login');
          return;
        }

        const { data: guideData, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .limit(1);

        if (guideError || !guideData || guideData.length === 0) {
          setError('Failed to load guide data');
          return;
        }

        const data = guideData[0];
        setGuide(data);
        setFormData({
          name: data.name,
          location: data.location,
          phone_number: data.phone_number || '',
          languages: Array.isArray(data.languages) ? data.languages : (data.languages ? [data.languages] : []),
        });
        setPreview(data.profile_picture_url || '');
      } catch (err) {
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadGuide();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanguageChange = (languages: string[]) => {
    setFormData((prev) => ({ ...prev, languages }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleSaveProfile = async () => {
    try {
      if (!supabase) {
        setError('Supabase not initialized');
        return;
      }
      setSaving(true);
      setError('');
      setSuccess('');

      if (!formData.name || !formData.location || !formData.phone_number || formData.languages.length === 0) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      let picUrl = guide?.profile_picture_url;

      if (profilePicture && guide) {
        const fileExt = profilePicture.name.split('.').pop();
        const fileName = `${guide.user_id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase!.storage
          .from('guide-profiles')
          .upload(fileName, profilePicture, { upsert: true });

        if (uploadError) {
          setError('Failed to upload profile picture');
          setSaving(false);
          return;
        }

        const { data: urlData } = supabase!.storage
          .from('guide-profiles')
          .getPublicUrl(fileName);

        picUrl = urlData.publicUrl;
      }

      const { error: updateError } = await supabase!
        .from('guides')
        .update({
          name: formData.name,
          location: formData.location,
          phone_number: formData.phone_number,
          language: formData.languages[0],
          languages: formData.languages,
          profile_picture_url: picUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guide?.id);

      if (updateError) {
        setError('Failed to update profile');
        setSaving(false);
        return;
      }

      setGuide((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              location: formData.location,
              phone_number: formData.phone_number,
              languages: formData.languages,
              profile_picture_url: picUrl || prev.profile_picture_url,
            }
          : null
      );

      setSuccess('Profile updated successfully!');
      setEditing(false);
      setProfilePicture(null);

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase!.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load account</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <GuideSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 w-full lg:w-0 px-4 sm:px-6 py-6 sm:py-10 max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Account Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your profile information and settings
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert className="bg-red-50 border-red-200 mb-6">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Card */}
        <Card className="border border-border p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>

          {!editing ? (
            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {preview && (
                  <img
                    src={preview}
                    alt={guide.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-border"
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Profile Picture</p>
                  <p className="text-foreground">{guide.name}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Email</p>
                  <p className="text-foreground">{guide.email}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Location</p>
                  <p className="text-foreground">{guide.location}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Phone Number</p>
                  <p className="text-foreground">{guide.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(guide.languages) && guide.languages.length > 0 ? (
                      guide.languages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">Not specified</p>
                    )}
                  </div>
                </div>
              </div>

              <Button onClick={() => setEditing(true)} className="w-full">
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Picture */}
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Profile Picture
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={saving}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-border mt-4"
                  />
                )}
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-sm font-semibold mb-2">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              {/* Phone */}
              <div>
                <Label htmlFor="phone_number" className="text-sm font-semibold mb-2">
                  Phone Number
                </Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-semibold mb-2">Location</Label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                  placeholder="Search for your location..."
                  disabled={saving}
                  apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
                />
              </div>

              {/* Languages */}
              <div>
                <Label className="text-sm font-semibold mb-2">Languages</Label>
                <MultiLanguageSelect
                  value={formData.languages}
                  onChange={handleLanguageChange}
                  disabled={saving}
                  required={true}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
                <Button
                  onClick={() => {
                    setEditing(false);
                    setProfilePicture(null);
                    setFormData({
                      name: guide.name,
                      location: guide.location,
                      phone_number: guide.phone_number || '',
                      languages: Array.isArray(guide.languages)
                        ? guide.languages
                        : guide.languages
                        ? [guide.languages]
                        : [],
                    });
                    setPreview(guide.profile_picture_url || '');
                  }}
                  variant="outline"
                  disabled={saving}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Danger Zone */}
        <Card className="border border-red-200 dark:border-red-800 p-6 sm:p-8 bg-red-50 dark:bg-red-950/20">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6" />
            Danger Zone
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white w-full gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete My Account
          </Button>
        </Card>
      </main>

      {/* Delete Account Modal */}
      <DeleteAccountModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </div>
  );
}
