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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-6 sm:py-8 px-3 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-4 sm:mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs sm:text-sm">← Back to Home</Button>
          </Link>
        </div>

        <Card className="border border-border p-5 sm:p-7 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">Guide Login</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-5 sm:mb-7">
            Access your dashboard
          </p>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {statusType === 'pending' && (
            <Alert className="mb-4 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-xs sm:text-sm">
                {statusMessage}
              </AlertDescription>
            </Alert>
          )}

          {statusType === 'rejected' && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm mb-2">{statusMessage}</AlertDescription>
              <Link href="/guide/signup">
                <Button variant="outline" size="sm" className="mt-2 text-xs sm:text-sm">
                  Resubmit Application
                </Button>
              </Link>
            </Alert>
          )}

          {statusType === 'deactivated' && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4 flex-shrink-0" />
              <AlertDescription className="text-xs sm:text-sm">{statusMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                className="text-sm"
              />
            </div>

            <Button type="submit" className="w-full text-xs sm:text-sm" disabled={loading} size="sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <p className="text-center text-muted-foreground text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link href="/guide/signup" className="text-primary hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
