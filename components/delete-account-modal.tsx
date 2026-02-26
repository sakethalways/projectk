'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

interface DeleteAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [understood, setUnderstood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    if (!understood) {
      setError('Please confirm you understand the consequences');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!supabase) {
        setError('Database connection failed. Please try again.');
        setLoading(false);
        return;
      }
      // Get session
      const { data: { session }, error: sessionError } = await supabase!.auth.getSession();

      if (sessionError || !session) {
        setError('Authentication failed. Please log in again.');
        setLoading(false);
        return;
      }

      // Call delete account API
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete account');
        setLoading(false);
        return;
      }

      // Success: Sign out and redirect
      toast.success('Account Deleted - Your account and all associated data have been permanently deleted.');

      // Clear session
      if (supabase) {
        await supabase.auth.signOut();
      }

      // Clear local storage
      localStorage.clear();

      // Redirect to home page
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      console.error('Error deleting account:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setPassword('');
      setUnderstood(false);
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please proceed with caution.
          </DialogDescription>
        </DialogHeader>

        {/* Warning Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Warning:</strong> Deleting your account will permanently remove:
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Your profile and personal information</li>
              <li>All bookings and booking history</li>
              <li>All ratings and reviews you created</li>
              <li>All saved guides (tourists)</li>
              <li>All itineraries and trips (guides)</li>
              <li>All account data from our system</li>
            </ul>
            <p className="mt-3 font-semibold">This action is irreversible.</p>
          </AlertDescription>
        </Alert>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Password Input */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground">
            Enter your password to confirm
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="border-destructive/50 focus:ring-destructive"
          />
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="understand"
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked as boolean)}
            disabled={loading}
          />
          <Label
            htmlFor="understand"
            className="text-sm font-normal text-muted-foreground cursor-pointer"
          >
            I understand that my account and all associated data will be permanently deleted
            and cannot be recovered
          </Label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            disabled={!password || !understood || loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Deleting Account...' : 'Delete My Account'}
          </Button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-muted-foreground text-center">
          You will be logged out and redirected to login after deletion.
        </p>
      </DialogContent>
    </Dialog>
  );
}
