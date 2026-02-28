'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { Loader2, AlertCircle, MapPin, Mail, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TouristLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Supabase not initialized');
      setLoading(false);
      return;
    }
    setError('');
    setLoading(true);

    try {
      if (!formData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!formData.password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabase!.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
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
        await supabase.auth.signOut();
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
        await supabase.auth.signOut();
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
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg py-6 sm:py-8 px-3 sm:px-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Back Button */}
        <div className="mb-6 sm:mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border border-emerald-200 dark:border-slate-700 p-6 sm:p-8 bg-white dark:bg-dark-surface shadow-lg">
          <div className="mb-2 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text">Tourist Login</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Sign in to explore verified guides and book experiences
          </p>

          {error && (
            <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                disabled={loading}
                autoComplete="email"
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
                placeholder="••••••••"
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative py-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-100 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">New to GUIDO?</span>
            </div>
          </div>

          {/* Signup Link */}
          <Link href="/tourist/signup?mode=signup">
            <Button variant="outline" className="w-full h-10 sm:h-11 text-sm font-medium border-emerald-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800">
              Create Tourist Account
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
