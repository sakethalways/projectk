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

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        setError(authError?.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
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

      const { data: touristData, error: touristError } = await supabase
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 py-8 px-3 sm:px-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
              ← Back to Home
            </Button>
          </Link>
        </div>

        {/* Login Card */}
        <Card className="border border-emerald-200 dark:border-emerald-800 p-8 bg-white dark:bg-slate-800 shadow-lg">
          <div className="text-center mb-8">
            <div className="inline-block mb-3 p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full">
              <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
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

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
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
                value={formData.password}
                onChange={handleInputChange}
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
              className="w-full text-base bg-emerald-600 hover:bg-emerald-700 mt-8"
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

          {/* Signup Link */}
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Don't have an account?
            </p>
            <Link href="/tourist/signup?mode=signup">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
          </div>
        </Card>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
