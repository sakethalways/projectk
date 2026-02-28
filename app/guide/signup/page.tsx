'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
import ResubmissionForm from '@/components/resubmission-form';
import { LocationAutocomplete } from '@/components/location-autocomplete';

export default function GuideSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'choice' | 'login' | 'signup' | 'resubmit'>('choice');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [resubmitEmail, setResubmitEmail] = useState('');
  const [resubmitPassword, setResubmitPassword] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
      throw new Error('Failed to upload file');
    }
  };

  const handleResubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!resubmitEmail || !resubmitPassword) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: resubmitEmail,
        password: resubmitPassword,
      });

      if (authError || !authData.user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Check guide status
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('id, status')
        .eq('user_id', authData.user.id)
        .single();

      if (guideError || !guideData) {
        setError('Guide profile not found');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check if status is rejected
      if (guideData.status !== 'rejected') {
        setError('You can only resubmit rejected applications');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Move to resubmit step
      setStep('resubmit');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.phone_number || !formData.location || formData.languages.length === 0) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (!files.profile_picture || !files.document) {
        setError('Please upload both profile picture and document');
        setLoading(false);
        return;
      }

      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        if (authError?.message.includes('already registered')) {
          setError('Email already registered. Please login or use a different email.');
        } else {
          setError(authError?.message || 'Failed to create account');
        }
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Wait a moment for the trigger to create user record
      // (The database trigger automatically creates a user record with role='guide')
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Upload files
      const timestamp = Date.now();
      const profilePicturePath = `${userId}/profile-${timestamp}`;
      const documentPath = `${userId}/document-${timestamp}`;

      const profileUrl = await uploadFile(
        files.profile_picture,
        'profile-pictures',
        profilePicturePath
      );

      const documentUrl = await uploadFile(
        files.document,
        'documents',
        documentPath
      );

      // Create guide record
      const { error: guideError } = await supabase
        .from('guides')
        .insert({
          user_id: userId,
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone_number,
          location: formData.location,
          language: formData.languages[0], // For backward compatibility with existing schema
          languages: formData.languages,
          profile_picture_url: profileUrl,
          document_url: documentUrl,
          document_type: formData.document_type,
          status: 'pending',
        });

      if (guideError) {
        console.error('Guide creation error:', guideError);
        setError('Failed to save guide information');
        setLoading(false);
        return;
      }

      // Show success message
      setSubmitted(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/guide/login');
      }, 3000);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center px-3 py-8">
        <Card className="w-full max-w-md p-6 sm:p-8 text-center border border-emerald-200 dark:border-slate-700 bg-white dark:bg-dark-surface">
          <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-text mb-3">Registration Successful!</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Verification pending by admin. You will receive an email or message at <br />
            <strong className="text-foreground">{formData.phone_number}</strong> or contact{' '}
            <strong className="text-foreground">9550574212</strong>
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  // Step: Choice (New Registration vs Resubmit)
  if (step === 'choice') {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg py-8 px-3">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">← Back to Home</Button>
            </Link>
          </div>

          <Card className="border border-emerald-200 dark:border-slate-700 p-6 sm:p-8 bg-white dark:bg-dark-surface">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">Become a Guide</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Choose an option to get started
            </p>

            <div className="space-y-3">
              <Button 
                className="w-full h-24 sm:h-28 text-left flex flex-col items-start justify-start p-4 text-base sm:text-lg font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                onClick={() => setStep('signup')}
              >
                <span className="text-lg sm:text-2xl mb-1">✨ New Registration</span>
                <span className="text-xs sm:text-sm font-normal text-emerald-50">Register your application for the first time</span>
              </Button>

              <Button 
                variant="outline"
                className="w-full h-24 sm:h-28 text-left flex flex-col items-start justify-start p-4 text-base sm:text-lg font-semibold border-2 border-emerald-200 dark:border-slate-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800"
                onClick={() => setStep('login')}
              >
                <span className="text-lg sm:text-2xl mb-1">🔄 Resubmit Application</span>
                <span className="text-xs sm:text-sm font-normal text-gray-600 dark:text-gray-400">Your application was rejected? Update and resubmit</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Step: Login for Resubmission
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-cream-100 dark:bg-dark-bg py-8 px-3">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <Button variant="ghost" size="sm" onClick={() => setStep('choice')} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">← Back to Choice</Button>
          </div>

          <Card className="border border-emerald-200 dark:border-slate-700 p-6 sm:p-8 bg-white dark:bg-dark-surface">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">Resubmit Application</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Sign in to update your application
            </p>

            {error && (
              <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleResubmitLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={resubmitEmail}
                  onChange={(e) => setResubmitEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={resubmitPassword}
                  onChange={(e) => setResubmitPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                />
              </div>

              <Button type="submit" className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In to Resubmit'
                )}
              </Button>

              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-emerald-100 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">Or register new</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('signup')}
                className="w-full h-10 text-sm font-medium border-emerald-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800"
              >
                Register as New Guide
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // Step: Resubmission Form
  if (step === 'resubmit') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-3">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 sm:mb-6">
            <Button variant="ghost" size="sm" onClick={() => {
              setStep('choice');
              setResubmitEmail('');
              setResubmitPassword('');
              setError('');
            }} className="text-xs sm:text-sm">← Back</Button>
          </div>
          <ResubmissionForm 
            email={resubmitEmail}
            onCancel={() => {
              setStep('choice');
              setResubmitEmail('');
              setResubmitPassword('');
              setError('');
            }}
          />
        </div>
      </div>
    );
  }

  // Step: New Registration (Regular Signup)
  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg py-8 px-3">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => setStep('choice')} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">← Back to Choice</Button>
        </div>

        <Card className="border border-emerald-200 dark:border-slate-700 p-6 sm:p-8 bg-white dark:bg-dark-surface">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">Become a Guide</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            Register and get verified by our admin team
          </p>

          {error && (
            <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Min 6 characters. Use to login after approval.</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</Label>
              <Input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Full Address *</Label>
              <LocationAutocomplete
                value={formData.location}
                onChange={(value) => setFormData((prev) => ({ ...prev, location: value }))}
                placeholder="Search for your location..."
                disabled={loading}
                apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <MultiLanguageSelect
                value={formData.languages}
                onChange={(languages) =>
                  setFormData((prev) => ({ ...prev, languages }))
                }
                disabled={loading}
                required={true}
              />
            </div>

            {/* Profile Picture */}
            <div className="space-y-2">
              <Label htmlFor="profile_picture" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture *</Label>
              <div className="border-2 border-dashed border-emerald-200 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <input
                  id="profile_picture"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile_picture')}
                  disabled={loading}
                  required
                  className="hidden"
                />
                <label
                  htmlFor="profile_picture"
                  className="cursor-pointer block"
                >
                  {preview.profile ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={preview.profile}
                        alt="Profile preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-600 mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Upload Profile Picture</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="document_type" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Document Type *</Label>
              <Select
                value={formData.document_type}
                onValueChange={handleDocumentTypeChange}
                disabled={loading}
              >
                <SelectTrigger id="document_type" className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text focus:border-emerald-500 dark:focus:border-emerald-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-dark-surface border-emerald-200 dark:border-slate-700">
                  <SelectItem value="aadhar">Aadhar Card</SelectItem>
                  <SelectItem value="driving_licence">Driving License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Document Upload */}
            <div className="space-y-2">
              <Label htmlFor="document" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {formData.document_type === 'aadhar' ? 'Aadhar Card' : 'Driving License'} *
              </Label>
              <div className="border-2 border-dashed border-emerald-200 dark:border-slate-600 rounded-lg p-4 text-center hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                <input
                  id="document"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'document')}
                  disabled={loading}
                  required
                  className="hidden"
                />
                <label
                  htmlFor="document"
                  className="cursor-pointer block"
                >
                  {preview.document ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={preview.document}
                        alt="Document preview"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg mb-2"
                      />
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 dark:text-gray-600 mb-2" />
                      <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Upload Document</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-100 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">Already have an account?</span>
              </div>
            </div>

            <Link href="/guide/login">
              <Button variant="outline" className="w-full h-10 sm:h-11 text-sm font-medium border-emerald-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800">
                Sign In Here
              </Button>
            </Link>
          </form>
        </Card>
      </div>
    </div>
  );
}
