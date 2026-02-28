'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { Loader2, Upload, AlertCircle, CheckCircle2, MapPin, Mail, Lock, Phone, Upload as UploadIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationAutocomplete } from '@/components/location-autocomplete';

export const dynamic = 'force-dynamic';

function TouristSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'choice' | 'signup' | 'login'>('choice');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    location: '',
  });

  const [files, setFiles] = useState({
    profile_picture: null as File | null,
  });

  const [preview, setPreview] = useState({
    profile: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Check if coming from login page to skip choice step
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setStep('signup');
    } else if (mode === 'login') {
      setStep('login');
    }
  }, [searchParams]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (location: string) => {
    setFormData((prev) => ({ ...prev, location }));
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile picture must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }

    setFiles((prev) => ({ ...prev, profile_picture: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview((prev) => ({ ...prev, profile: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!formData.password || formData.password.length < 5) {
      setError('Password must be at least 5 characters');
      return false;
    }
    if (formData.password.length > 128) {
      setError('Password must be less than 128 characters');
      return false;
    }
    if (!formData.phone_number.trim() || formData.phone_number.length < 10) {
      setError('Please enter a valid phone number');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!files.profile_picture) {
      setError('Profile picture is required');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!supabase) {
        setError('Service unavailable');
        setLoading(false);
        return;
      }
      // Create auth user
      const { data: authData, error: authError } = await supabase!.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        setError(authError?.message || 'Failed to create account');
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Upsert user role
      const { error: userError } = await supabase!.from('users').upsert(
        {
          id: userId,
          email: formData.email,
          role: 'tourist',
        },
        { onConflict: 'id' }
      );

      if (userError) {
        console.error('Error creating user record:', userError);
        setError('Failed to create user record');
        setLoading(false);
        return;
      }

      // Upload profile picture
      const fileExt = files.profile_picture!.name.split('.').pop();
      const fileName = `${userId}/profile.${fileExt}`;

      const { error: uploadError } = await supabase!.storage
        .from('tourist-profiles')
        .upload(fileName, files.profile_picture!);

      if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        setError('Failed to upload profile picture');
        setLoading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase!.storage
        .from('tourist-profiles')
        .getPublicUrl(fileName);

      // Create tourist profile
      const { error: profileError } = await supabase!.from('tourist_profiles').insert({
        user_id: userId,
        name: formData.name,
        email: formData.email,
        phone_number: formData.phone_number,
        location: formData.location,
        profile_picture_url: urlData.publicUrl,
      });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        setError('Failed to create profile');
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push('/tourist/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred during signup');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!loginData.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      if (!supabase) {
        setError('Service unavailable');
        setLoading(false);
        return;
      }
      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (authError || !authData.user) {
        setError(authError?.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase!
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userError || userData?.role !== 'tourist') {
        await supabase!.auth.signOut();
        setError('You do not have tourist access. Please contact support.');
        setLoading(false);
        return;
      }

      const { data: touristData, error: touristError } = await supabase!
        .from('tourist_profiles')
        .select('id')
        .eq('user_id', authData.user.id)
        .single();

      if (touristError || !touristData) {
        await supabase!.auth.signOut();
        setError('Tourist profile not found. Please contact support.');
        setLoading(false);
        return;
      }

      router.push('/tourist/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg py-8 px-3 sm:px-6 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Choice Step */}
        {step === 'choice' && (
          <div className="text-center">
            {/* Hero Section */}
            <div className="mb-12">
              <div className="inline-block mb-4 p-4 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                <MapPin className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                Explore with Confidence
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto">
                Connect with verified local guides and discover authentic experiences
              </p>
            </div>

            {/* Option Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Create Account */}
              <Card className="border border-emerald-200 dark:border-emerald-800 p-8 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setStep('signup')}>
                <div className="text-center">
                  <div className="inline-block mb-4 p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                    <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    New to GuideVerify? Sign up now
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Get Started
                  </Button>
                </div>
              </Card>

              {/* Sign In */}
              <Card className="border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setStep('login')}>
                <div className="text-center">
                  <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text mb-2">Sign In</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Already have an account? Welcome back
                  </p>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Sign In
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Signup Step */}
        {step === 'signup' && !submitted && (
          <Card className="border border-emerald-200 dark:border-slate-700 p-8 bg-white dark:bg-dark-surface shadow-lg">
            <div className="mb-8">
              <button
                onClick={() => setStep('choice')}
                className="mb-4 inline-flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                ← Back
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-dark-text mb-2">
                Create Your Account
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Join GUIDO and start exploring with verified guides
              </p>
            </div>

            {error && (
              <Alert className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 5 characters"
                  className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Must be at least 5 characters
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="text-sm"
                  disabled={loading}
                />
              </div>

              {/* Location */}
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location
                </Label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={handleLocationSelect}
                  apiKey={process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || ''}
                />
              </div>

              {/* Profile Picture */}
              <div>
                <Label className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <UploadIcon className="w-4 h-4" /> Profile Picture
                </Label>
                <div className="flex gap-4">
                  {preview.profile && (
                    <div className="flex-shrink-0">
                      <img
                        src={preview.profile}
                        alt="Profile preview"
                        className="w-24 h-24 rounded-lg object-cover border-2 border-emerald-200 dark:border-emerald-800"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProfilePictureChange}
                      disabled={loading}
                      className="hidden"
                      id="profile-upload"
                    />
                    <label htmlFor="profile-upload">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full cursor-pointer"
                        disabled={loading}
                        onClick={() => document.getElementById('profile-upload')?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {files.profile_picture ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    </label>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPEG, PNG, or WebP • Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-base bg-emerald-600 hover:bg-emerald-700 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              {/* Already have account */}
              <div className="pt-6 border-t border-border text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Already have an account?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => setStep('login')}
                >
                  Sign In Instead
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Login Step */}
        {step === 'login' && !submitted && (
          <Card className="border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-800 shadow-lg">
            <div className="mb-8">
              <button
                onClick={() => setStep('choice')}
                className="mb-4 inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Welcome Back
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Sign in to explore verified guides
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={loginData.email}
                  onChange={handleLoginInputChange}
                  placeholder="your@email.com"
                  className="text-sm"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </Label>
                <Input
                  name="password"
                  type="password"
                  value={loginData.password}
                  onChange={handleLoginInputChange}
                  placeholder="Enter password"
                  className="text-sm"
                  disabled={loading}
                  autoComplete="current-password"
                />
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-base bg-slate-600 hover:bg-slate-700 mt-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Create account */}
              <div className="pt-6 border-t border-border text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                  Don't have an account?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-sm"
                  onClick={() => setStep('signup')}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Success Step */}
        {submitted && (
          <Card className="border border-emerald-200 dark:border-emerald-800 p-8 bg-white dark:bg-slate-800 shadow-lg">
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-600 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Account Created Successfully! ✓
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                Welcome to GuideVerify! Redirecting to your dashboard...
              </p>
              <Button onClick={() => router.push('/tourist/dashboard')} className="text-sm bg-emerald-600 hover:bg-emerald-700">
                Go to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function TouristSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 py-8 px-3 sm:px-6 flex flex-col justify-center items-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <TouristSignupContent />
    </Suspense>
  );
}
