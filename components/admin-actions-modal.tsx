'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deactivateGuide, activateGuide, deleteGuideUserCompletely } from '@/lib/user-management';
import type { Guide } from '@/lib/supabase-client';

interface AdminActionsModalProps {
  guide: Guide | null;
  action: 'deactivate' | 'activate' | 'delete' | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminActionsModal({
  guide,
  action,
  open,
  onClose,
  onSuccess,
}: AdminActionsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const handleClose = () => {
    setError('');
    setDeactivationReason('');
    setDeleteConfirmation('');
    onClose();
  };

  const handleDeactivate = async () => {
    if (!guide || !deactivationReason.trim()) {
      setError('Please enter a reason for deactivation');
      return;
    }

    setLoading(true);
    setError('');

    const result = await deactivateGuide(guide.id, deactivationReason);
    
    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || 'Failed to deactivate guide');
    }

    setLoading(false);
  };

  const handleActivate = async () => {
    if (!guide) return;

    setLoading(true);
    setError('');

    const result = await activateGuide(guide.id);

    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || 'Failed to activate guide');
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!guide || deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm deletion');
      return;
    }

    setLoading(true);
    setError('');

    const result = await deleteGuideUserCompletely(guide.id, guide.user_id);

    if (result.success) {
      onSuccess();
      handleClose();
    } else {
      setError(result.error || 'Failed to delete guide');
    }

    setLoading(false);
  };

  if (!guide) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        {action === 'deactivate' && (
          <>
            <DialogHeader>
              <DialogTitle>Deactivate Guide Account</DialogTitle>
              <DialogDescription>
                Deactivated guides cannot log in. Provide a reason for this action.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Deactivation</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Poor service quality, Policy violation, etc."
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  rows={4}
                  disabled={loading}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                <strong>{guide.name}</strong> will see this message when they try to log in.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeactivate}
                disabled={loading || !deactivationReason.trim()}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Deactivate
              </Button>
            </DialogFooter>
          </>
        )}

        {action === 'activate' && (
          <>
            <DialogHeader>
              <DialogTitle>Activate Guide Account</DialogTitle>
              <DialogDescription>
                This deactivated account will be reactivated and the guide can log in normally.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Activating <strong>{guide.name}</strong>'s account. They will be able to access their dashboard after logging in.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleActivate} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Activate Account
              </Button>
            </DialogFooter>
          </>
        )}

        {action === 'delete' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-destructive">Delete Guide Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. All data will be permanently deleted.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Warning:</strong> Deleting this account will:
                  <ul className="list-disc list-inside mt-2 ml-2">
                    <li>Remove all guide information and profile</li>
                    <li>Delete all profile pictures and documents from storage</li>
                    <li>Delete itinerary data and images</li>
                    <li>Remove availability records</li>
                    <li>Delete the auth user - they won't be able to log in</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirm">Type "DELETE" to confirm</Label>
                <Input
                  id="confirm"
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  disabled={loading}
                  className="font-mono"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Account to delete: <strong>{guide.name}</strong> ({guide.email})
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading || deleteConfirmation !== 'DELETE'}
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Delete Permanently
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
