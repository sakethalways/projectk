'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { TouristSidebar } from '@/components/tourist-sidebar';
import { Loader2, AlertCircle, CheckCircle2, Upload, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useIsMobile } from '@/hooks/use-mobile';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import DeleteAccountModal from '@/components/delete-account-modal';

interface TouristProfile {
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

export default function TouristDashboardPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<TouristProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: '',
  });

  const [files, setFiles] = useState({
    profile_picture: null as File | null,
  });

  const [preview, setPreview] = useState({
    profile: '',
  });

  // Fetch user and profile
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          router.push('/tourist/login');
          return;
        }

        setUser(authUser);

        // Fetch tourist profile
        const { data: profileData, error: profileError } = await supabase
          .from('tourist_profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (profileError || !profileData) {
          setError('Failed to load profile');
          return;
        }

        setProfile(profileData);
        setFormData({
          name: profileData.name,
          phone_number: profileData.phone_number,
          location: profileData.location,
        });

        if (profileData.profile_picture_url) {
          setPreview((prev) => ({
            ...prev,
            profile: profileData.profile_picture_url,
          }));
        }
      } catch (err) {
        console.error('Error fetching user/profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Profile picture must be JPEG, PNG, or WebP');
        return;
      }

      setFiles((prev) => ({ ...prev, profile_picture: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({
          ...prev,
          profile: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (!profile) {
        setError('Profile not found');
        return;
      }

      // Validate form
      if (!formData.name.trim()) {
        setError('Name is required');
        setSaving(false);
        return;
      }

      if (!formData.phone_number.trim() || formData.phone_number.length < 10) {
        setError('Please enter a valid phone number');
        setSaving(false);
        return;
      }

      if (!formData.location.trim()) {
        setError('Location is required');
        setSaving(false);
        return;
      }

      let updatedPictureUrl = profile.profile_picture_url;

      // Upload new profile picture if provided
      if (files.profile_picture) {
        // Delete old picture if exists
        if (profile.profile_picture_url) {
          const oldFileName = profile.profile_picture_url.split('/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('tourist-profiles')
              .remove([`${profile.user_id}/${oldFileName}`]);
          }
        }

        // Upload new picture
        const fileExt = files.profile_picture.name.split('.').pop();
        const fileName = `${profile.user_id}/profile.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('tourist-profiles')
          .upload(fileName, files.profile_picture, {
            upsert: true,
          });

        if (uploadError) {
          setError('Failed to upload profile picture');
          setSaving(false);
          return;
        }

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('tourist-profiles')
          .getPublicUrl(fileName);

        updatedPictureUrl = publicUrl.publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('tourist_profiles')
        .update({
          name: formData.name,
          phone_number: formData.phone_number,
          location: formData.location,
          profile_picture_url: updatedPictureUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (updateError) {
        setError('Failed to update profile');
        setSaving(false);
        return;
      }

      // Update local state
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              name: formData.name,
              phone_number: formData.phone_number,
              location: formData.location,
              profile_picture_url: updatedPictureUrl,
            }
          : null
      );

      setFiles({ profile_picture: null });
      setEditing(false);
      setSuccess('Profile updated successfully!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('An error occurred while saving profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <TouristSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Welcome, {profile.name}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your profile and explore verified guides
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
            {/* Member Status */}
            <Card className="border border-border p-4 sm:p-6">
              <div className="text-center">
                <div className="inline-block mb-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-100 rounded-full text-xs font-semibold">
                  Active ✓
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
              </div>
            </Card>

            {/* Member Since */}
            <Card className="border border-border p-4 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                  {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">Member Since</p>
              </div>
            </Card>

            {/* Location */}
            <Card className="border border-border p-4 sm:p-6">
              <div className="text-center">
                <p className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 truncate px-1">
                  📍
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.location}</p>
              </div>
            </Card>
          </div>

          {/* Profile Card */}
          <Card className="border border-emerald-200 dark:border-emerald-800 p-6 sm:p-8 mb-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              {/* Profile Picture */}
              {profile.profile_picture_url && (
                <img
                  src={profile.profile_picture_url}
                  alt={profile.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 flex-shrink-0 shadow-lg"
                />
              )}
              
              {/* Profile Info */}
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{profile.name}</h3>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-muted-foreground break-all">{profile.email}</p>
                  <p className="text-sm text-foreground"><span className="font-semibold">Phone:</span> {profile.phone_number}</p>
                  <p className="text-sm text-foreground"><span className="font-semibold">Location:</span> {profile.location}</p>
                </div>
              </div>

              {/* Edit Button */}
              {!editing && (
                <Button
                  onClick={() => setEditing(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-4 sm:mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-xs sm:text-sm text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Edit Form */}
            {editing && (
              <Card className="border border-border p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-2xl font-bold text-foreground mb-6">Edit Profile</h3>

                <form className="space-y-5">
                  {/* Name */}
                  <div>
                    <Label className="text-sm font-semibold">Full Name</Label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="text-sm mt-2"
                      disabled={saving}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label className="text-sm font-semibold">Phone Number</Label>
                    <Input
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+91..."
                      className="text-sm mt-2"
                      disabled={saving}
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-semibold">Location</Label>
                    <LocationAutocomplete
                      value={formData.location}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, location: value }))
                      }
                      placeholder="Search location..."
                      disabled={saving}
                      apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
                    />
                  </div>

                  {/* Profile Picture */}
                  <div>
                    <Label className="text-sm font-semibold">Update Profile Picture</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        id="edit-profile-picture-input"
                        disabled={saving}
                      />
                      <label htmlFor="edit-profile-picture-input" className="cursor-pointer block">
                        {files.profile_picture ? (
                          <div className="space-y-2">
                            <img
                              src={preview.profile}
                              alt="Preview"
                              className="w-24 h-24 rounded-lg object-cover mx-auto border-2 border-emerald-200"
                            />
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Click to change
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-emerald-500" />
                            <p className="text-sm font-medium text-foreground">
                              Click to update profile picture
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Max 5MB • JPEG, PNG, WebP
                            </p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFiles({ profile_picture: null });
                        setFormData({
                          name: profile.name,
                          phone_number: profile.phone_number,
                          location: profile.location,
                        });
                        setPreview({ profile: profile.profile_picture_url || '' });
                      }}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Danger Zone - Delete Account */}
            <Card className="border border-red-200 bg-red-50 dark:bg-red-950 p-6 mt-8">
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
                  Deleting your account will permanently remove all your data including bookings,
                  ratings, reviews, and saved guides. This action cannot be undone.
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
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal open={deleteModalOpen} onOpenChange={setDeleteModalOpen} />
    </div>
  );
}
