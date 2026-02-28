'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { Loader2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function GuideLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'pending' | 'rejected' | 'deactivated' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setStatusType(null);
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        setError('Invalid email or password');
        setLoading(false);
        return;
      }

      // Check guide status
      const { data: guideData, error: guideError } = await supabase
        .from('guides')
        .select('id, status, rejection_reason, is_deactivated, deactivation_reason')
        .eq('user_id', authData.user.id)
        .single();

      if (guideError) {
        setError('Guide profile not found. Please register first.');
        // Sign out the user
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check guide status
      if (guideData.status === 'pending') {
        setStatusType('pending');
        setStatusMessage(
          'Your registration is pending verification by our admin team. You will receive an email or message at ' +
          email +
          ' or contact 9550574212'
        );
        // Sign out the user as they cannot access yet
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (guideData.status === 'rejected') {
        setStatusType('rejected');
        setStatusMessage(
          guideData.rejection_reason ||
          'Your registration has been rejected. Please review the reason and resubmit your application.'
        );
        // Sign out the user
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (guideData.status === 'approved') {
        // Check if account is deactivated
        if (guideData.is_deactivated) {
          setStatusType('deactivated');
          setStatusMessage(
            `Account is deactivated for: ${guideData.deactivation_reason || 'Policy violation'}. Contact 9550574212 for assistance.`
          );
          // Sign out the user
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Store guide ID and redirect to dashboard
        localStorage.setItem('guide_id', guideData.id);
        router.push('/guide/dashboard');
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-dark-bg flex items-center justify-center py-6 sm:py-8 px-3 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 sm:mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400">
              ← Back to Home
            </Button>
          </Link>
        </div>

        <Card className="border border-emerald-200 dark:border-slate-700 p-6 sm:p-8 bg-white dark:bg-dark-surface shadow-lg">
          <div className="mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 flex-shrink-0">
              <span className="text-white font-bold text-lg">G</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">Guide Login</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Access your guide dashboard
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {statusType === 'pending' && (
            <Alert className="mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <AlertDescription className="text-amber-700 dark:text-amber-300 text-xs sm:text-sm">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {statusType === 'rejected' && (
            <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm mb-3">{statusMessage}</AlertDescription>
              <Link href="/guide/signup">
                <Button variant="outline" size="sm" className="mt-2 text-xs sm:text-sm h-9 border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50">
                  Resubmit Application
                </Button>
              </Link>
            </Alert>
          )}

          {statusType === 'deactivated' && (
            <Alert className="mb-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <AlertDescription className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{statusMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="h-10 sm:h-11 text-sm border-emerald-200 dark:border-slate-600 bg-cream-50 dark:bg-slate-800 text-gray-900 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 focus:border-emerald-500 dark:focus:border-emerald-400"
              />
            </div>

            <Button type="submit" className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-100 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white dark:bg-dark-surface text-gray-500 dark:text-gray-400">New to GUIDO?</span>
              </div>
            </div>

            <Link href="/guide/signup" className="block">
              <Button type="button" variant="outline" className="w-full h-10 sm:h-11 text-sm font-medium border-emerald-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800">
                Create Your Guide Account
              </Button>
            </Link>
          </form>
        </Card>
      </div>
    </div>
  );
}
