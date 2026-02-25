'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';
import { Calendar, ToggleLeft, ToggleRight, X, Plus, Loader2 } from 'lucide-react';
import type { GuideAvailability } from '@/lib/supabase-client';

interface GuideAvailabilityProps {
  guideId: string;
  userId: string;
}

export default function GuideAvailabilityManager({ guideId, userId }: GuideAvailabilityProps) {
  const [availability, setAvailability] = useState<GuideAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch availability
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        if (!supabase) {
          setError('Supabase not initialized');
          setLoading(false);
          return;
        }
        // Use .limit(1) instead of .single() to avoid 406 error when no data exists
        const { data, error: fetchError } = await supabase!
          .from('guide_availability')
          .select('*')
          .eq('guide_id', guideId)
          .order('created_at', { ascending: false })
          .limit(1);

        // data will be an array, get first item
        if (!fetchError && data && data.length > 0) {
          const availData = data[0];
          setAvailability(availData);
          setStartDate(availData.start_date);
          setEndDate(availData.end_date);
          setIsAvailable(availData.is_available);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [guideId]);

  const handleToggleStatus = async () => {
    if (!supabase || !availability) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: updateError } = await supabase!
        .from('guide_availability')
        .update({ is_available: !isAvailable })
        .eq('id', availability.id);

      if (updateError) throw updateError;

      setIsAvailable(!isAvailable);
      setAvailability({ ...availability, is_available: !isAvailable });
      setSuccess(`Status updated to ${!isAvailable ? 'On Leave' : 'Available'}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update status');

    } finally {
      setSaving(false);
    }
  };

  const handleSaveAvailability = async () => {
    if (!supabase) {
      setError('Supabase not initialized');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date must be before end date');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (availability) {
        // Update existing
        const { error: updateError } = await supabase!
          .from('guide_availability')
          .update({
            start_date: startDate,
            end_date: endDate,
            is_available: isAvailable,
            updated_at: new Date().toISOString(),
          })
          .eq('id', availability.id);

        if (updateError) throw updateError;

        setAvailability({
          ...availability,
          start_date: startDate,
          end_date: endDate,
          is_available: isAvailable,
        });
        setSuccess('Availability updated successfully');
      } else {
        // Create new
        const { data, error: insertError } = await supabase!
          .from('guide_availability')
          .insert({
            guide_id: guideId,
            user_id: userId,
            start_date: startDate,
            end_date: endDate,
            is_available: isAvailable,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setAvailability(data);
        setSuccess('Availability created successfully');
      }

      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save availability');

    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = async () => {
    if (!supabase || !availability || !confirm('Are you sure? This will delete your availability record.')) return;

    setSaving(true);
    setError('');

    try {
      const { error: deleteError } = await supabase!
        .from('guide_availability')
        .delete()
        .eq('id', availability.id);

      if (deleteError) throw deleteError;

      setAvailability(null);
      setStartDate('');
      setEndDate('');
      setShowForm(false);
      setSuccess('Availability deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete availability');

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-border p-6">
        <p className="text-muted-foreground text-center">Loading availability...</p>
      </Card>
    );
  }

  return (
    <Card className="border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Availability
        </h3>
        {availability && (
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {isAvailable ? '✓ Available' : '🚫 On Leave'}
          </Badge>
        )}
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-4">{error}</div>}
      {success && <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-3 rounded-md text-sm mb-4">{success}</div>}

      {availability && !showForm ? (
        <div className="space-y-4">
          {/* Availability Info */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Available from</p>
            <p className="text-foreground font-medium">
              {new Date(availability.start_date).toLocaleDateString()} to{' '}
              {new Date(availability.end_date).toLocaleDateString()}
            </p>
          </div>

          {/* Toggle Status */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium text-foreground">Availability Status</span>
            <button
              onClick={handleToggleStatus}
              disabled={saving}
              className="focus:outline-none"
              title={isAvailable ? 'Click to mark as on leave' : 'Click to mark as available'}
            >
              {isAvailable ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowForm(true);
                setStartDate(availability.start_date);
                setEndDate(availability.end_date);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="px-4"
              onClick={handleDeleteAvailability}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Date Inputs */}
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-foreground mb-2">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
          </div>

          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-foreground mb-2">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
            />
          </div>

          {/* Status Toggle in Form */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="text-sm font-medium text-foreground">Mark as Available</span>
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className="focus:outline-none"
            >
              {isAvailable ? (
                <ToggleRight className="w-6 h-6 text-green-500" />
              ) : (
                <ToggleLeft className="w-6 h-6 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSaveAvailability}
              disabled={saving}
              className="flex-1 gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {availability ? 'Update' : 'Create'} Availability
                </>
              )}
            </Button>
            {availability && (
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
