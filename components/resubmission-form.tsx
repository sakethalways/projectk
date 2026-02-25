'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase-client';
import { Loader2, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MultiLanguageSelect from '@/components/multi-language-select';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import type { Guide } from '@/lib/supabase-client';

interface ResubmissionFormProps {
  email: string;
  onCancel: () => void;
}

export default function ResubmissionForm({ email, onCancel }: ResubmissionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [guideData, setGuideData] = useState<Guide | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: '',
    languages: [] as string[],
    document_type: 'aadhar' as 'aadhar' | 'driving_licence',
  });

  const [files, setFiles] = useState({
    profile_picture: null as File | null,
    document: null as File | null,
  });

  const [preview, setPreview] = useState({
    profile: '',
    document: '',
  });

  // Load rejected guide data on mount
  useEffect(() => {
    const loadGuideData = async () => {
      try {
        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();

        if (authError || !authData.user) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        // Get guide data
        const { data: guide, error: guideError } = await supabase
          .from('guides')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();

        if (guideError || !guide) {
          setError('Failed to load guide data');
          setLoading(false);
          return;
        }

        if (guide.status !== 'rejected') {
          setError('This form is only for rejected applications');
          setLoading(false);
          return;
        }

        setGuideData(guide);
        setFormData({
          name: guide.name,
          phone_number: guide.phone_number,
          location: guide.location,
          languages: Array.isArray(guide.languages) ? guide.languages : [],
          document_type: guide.document_type,
        });

        if (guide.profile_picture_url) {
          setPreview((prev) => ({ ...prev, profile: guide.profile_picture_url || '' }));
        }
        if (guide.document_url) {
          setPreview((prev) => ({ ...prev, document: guide.document_url || '' }));
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading guide data:', err);
        setError('An error occurred');
        setLoading(false);
      }
    };

    loadGuideData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocumentTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      document_type: value as 'aadhar' | 'driving_licence',
    }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'profile_picture' | 'document'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [fileType]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview((prev) => ({
          ...prev,
          [fileType === 'profile_picture' ? 'profile' : 'document']: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return urlData.publicUrl;
    } catch (err) {
      console.error('File upload error:', err);
      throw new Error('Failed to upload file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!formData.name || !formData.phone_number || !formData.location || formData.languages.length === 0) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      if (!guideData) {
        setError('Guide data not found');
        setSubmitting(false);
        return;
      }

      let profileUrl = preview.profile;
      let documentUrl = preview.document;

      // Upload new files if provided
      if (files.profile_picture) {
        const timestamp = Date.now();
        const profilePath = `${guideData.user_id}/profile-${timestamp}`;
        profileUrl = await uploadFile(files.profile_picture, 'profile-pictures', profilePath);
      }

      if (files.document) {
        const timestamp = Date.now();
        const documentPath = `${guideData.user_id}/document-${timestamp}`;
        documentUrl = await uploadFile(files.document, 'documents', documentPath);
      }

      // Update guide record with resubmission
      const { error: updateError } = await supabase
        .from('guides')
        .update({
          name: formData.name,
          phone_number: formData.phone_number,
          location: formData.location,
          language: formData.languages[0], // For backward compatibility
          languages: formData.languages,
          document_type: formData.document_type,
          profile_picture_url: profileUrl,
          document_url: documentUrl,
          status: 'pending', // Reset to pending
          is_resubmitted: true, // Mark as resubmitted
          rejection_reason: null, // Clear rejection reason
          updated_at: new Date().toISOString(),
        })
        .eq('id', guideData.id);

      if (updateError) {
        console.error('Update error:', updateError);
        setError('Failed to resubmit application');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);

      setTimeout(() => {
        router.push('/guide/login');
      }, 3000);
    } catch (err) {
      console.error('Resubmission error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-2xl p-8 text-center border border-border">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-4">Application Resubmitted!</h2>
        <p className="text-muted-foreground mb-6">
          Your updated application has been submitted for review. <br />
          You will receive updates at <strong>{email}</strong> or contact{' '}
          <strong>9550574212</strong>
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </Card>
    );
  }

  if (error && !formData.name) {
    return (
      <Card className="w-full max-w-2xl p-5 sm:p-6 border border-border">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
        <Button onClick={onCancel} className="mt-3 w-full text-sm" size="sm">
          Back to Signup
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl border border-border p-5 sm:p-6">
      <div className="mb-5 sm:mb-6 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
        <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <strong>Resubmitting Application:</strong> Review the rejection reason and make corrections.
        </p>
        {guideData?.rejection_reason && (
          <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-2">
            <strong>Reason:</strong> {guideData.rejection_reason}
          </p>
        )}
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Update Your Application</h2>
      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
        Make necessary changes and resubmit
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
            disabled={submitting}
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
            disabled={submitting}
            required
            className="text-sm"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs sm:text-sm">Full Address *</Label>
          <LocationAutocomplete
            value={formData.location}
            onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
            placeholder="Search for your location..."
            disabled={submitting}
            apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
          />
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <MultiLanguageSelect
            value={formData.languages}
            onChange={(languages) => setFormData((prev) => ({ ...prev, languages }))}
            disabled={submitting}
          />
        </div>

        {/* Document Type */}
        <div className="space-y-2">
          <Label htmlFor="document_type" className="text-xs sm:text-sm">Verification Document *</Label>
          <Select value={formData.document_type} onValueChange={handleDocumentTypeChange}>
            <SelectTrigger id="document_type" disabled={submitting} className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aadhar">Aadhar Card</SelectItem>
              <SelectItem value="driving_licence">Driving License</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Profile Picture */}
        <div className="space-y-2">
          <Label htmlFor="profile_picture" className="text-xs sm:text-sm">Profile Picture (Update if needed)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <input
              id="profile_picture"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'profile_picture')}
              disabled={submitting}
              className="hidden"
            />
            <label htmlFor="profile_picture" className="cursor-pointer block">
              {preview.profile ? (
                <div className="flex flex-col items-center">
                  <img
                    src={preview.profile}
                    alt="Profile preview"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs sm:text-sm text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1" />
                  <p className="text-xs sm:text-sm font-medium text-foreground">Upload Profile Picture</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG (Max 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Document */}
        <div className="space-y-2">
          <Label htmlFor="document" className="text-xs sm:text-sm">Verification Document (Update if needed)</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
            <input
              id="document"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleFileChange(e, 'document')}
              disabled={submitting}
              className="hidden"
            />
            <label htmlFor="document" className="cursor-pointer block">
              {preview.document ? (
                <div className="flex flex-col items-center">
                  {preview.document.startsWith('data:image') ? (
                    <img
                      src={preview.document}
                      alt="Document preview"
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground text-center px-2">Document</span>
                    </div>
                  )}
                  <p className="text-xs sm:text-sm text-muted-foreground">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1" />
                  <p className="text-xs sm:text-sm font-medium text-foreground">Upload Document</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, PDF (Max 10MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 sm:gap-4 pt-4">
          <Button type="submit" className="flex-1 text-sm" size="sm" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Resubmitting...
              </>
            ) : (
              'Resubmit Application'
            )}
          </Button>
          <Button type="button" variant="outline" className="flex-1 text-sm" size="sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
