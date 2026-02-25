'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/lib/supabase-client';
import { MapPin, Clock, FileText, AlertCircle, Plus, Trash2, Edit2, Upload, Loader2 } from 'lucide-react';
import type { GuideItinerary } from '@/lib/supabase-client';

interface GuideItineraryProps {
  guideId: string;
  userId: string;
}

export default function GuideItineraryManager({ guideId, userId }: GuideItineraryProps) {
  const [itineraries, setItineraries] = useState<GuideItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    number_of_days: '1',
    timings: '',
    description: '',
    places_to_visit: '',
    instructions: '',
    price: '100',
    price_type: 'per_day' as 'per_day' | 'per_trip',
  });

  const [images, setImages] = useState<{ image1: File | null; image2: File | null }>({
    image1: null,
    image2: null,
  });

  // Track existing images when editing
  const [existingImages, setExistingImages] = useState<{ image1: string | null; image2: string | null }>({
    image1: null,
    image2: null,
  });

  // Fetch itineraries
  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        if (!supabase) {
          setError('Supabase not initialized');
          setLoading(false);
          return;
        }
        const { data, error: fetchError } = await supabase!
          .from('guide_itineraries')
          .select('*')
          .eq('guide_id', guideId)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setItineraries(data || []);
      } catch (err) {
        console.error('Error fetching itineraries:', err);
        setError('Failed to load itineraries');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [guideId]);

  const handleImageUpload = async (file: File, bucket: string, path: string): Promise<string | null> => {
    try {
      if (!supabase) {
        throw new Error('Supabase not initialized');
      }
      const { data, error: uploadError } = await supabase!.storage
        .from(bucket)
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase!.storage.from(bucket).getPublicUrl(path);
      return urlData.publicUrl;
    } catch (err) {
      // Error uploading image
      throw err;
    }
  };

  const handleSaveItinerary = async () => {
    if (!supabase) {
      setError('Supabase not initialized');
      return;
    }
    // Trim and parse the number value robustly
    const trimmedDays = String(formData.number_of_days).trim();
    const daysNum = parseInt(trimmedDays, 10);
    if (isNaN(daysNum) || daysNum < 1 || !formData.timings || !formData.description || !formData.places_to_visit) {
      setError('Please fill in all required fields (Days must be a number >= 1)');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      let image1Url: string | null | undefined = undefined;
      let image2Url: string | null | undefined = undefined;

      // Handle Image 1: Upload if new, keep if existing and not deleted, set to null if existing was deleted
      if (images.image1) {
        // New image selected - upload it
        const timestamp = Date.now();
        const path1 = `${userId}/itinerary-1-${timestamp}`;
        image1Url = await handleImageUpload(images.image1, 'itinerary-images', path1);
      } else if (existingImages.image1) {
        // Existing image kept (no new image uploaded, no deletion)
        image1Url = existingImages.image1;
      } else {
        // Existing image deleted (explicitly set to null)
        image1Url = null;
      }

      // Handle Image 2: Upload if new, keep if existing and not deleted, set to null if existing was deleted
      if (images.image2) {
        // New image selected - upload it
        const timestamp = Date.now();
        const path2 = `${userId}/itinerary-2-${timestamp}`;
        image2Url = await handleImageUpload(images.image2, 'itinerary-images', path2);
      } else if (existingImages.image2) {
        // Existing image kept (no new image uploaded, no deletion)
        image2Url = existingImages.image2;
      } else {
        // Existing image deleted (explicitly set to null)
        image2Url = null;
      }

      const itineraryData: any = {
        guide_id: guideId,
        user_id: userId,
        number_of_days: daysNum,
        timings: formData.timings,
        description: formData.description,
        places_to_visit: formData.places_to_visit,
        instructions: formData.instructions || null,
        price: parseInt(formData.price) || 100,
        price_type: formData.price_type,
      };

      // Only include image fields if they have changed
      if (image1Url !== undefined) itineraryData.image_1_url = image1Url;
      if (image2Url !== undefined) itineraryData.image_2_url = image2Url;

      if (editingId) {
        // Update existing
        const { error: updateError } = await supabase!
          .from('guide_itineraries')
          .update(itineraryData)
          .eq('id', editingId);

        if (updateError) throw updateError;

        setItineraries(
          itineraries.map((it) =>
            it.id === editingId ? { ...it, ...itineraryData, updated_at: new Date().toISOString() } : it
          )
        );
        setSuccess('Itinerary updated successfully');
      } else {
        // Create new
        const { data, error: insertError } = await supabase!
          .from('guide_itineraries')
          .insert(itineraryData)
          .select()
          .single();

        if (insertError) throw insertError;

        setItineraries([data, ...itineraries]);
        setSuccess('Itinerary created successfully');
      }

      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save itinerary');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItinerary = async (id: string) => {
    if (!supabase || !confirm('Are you sure? This will delete the itinerary.')) return;

    setSaving(true);
    setError('');

    try {
      const { error: deleteError } = await supabase!.from('guide_itineraries').delete().eq('id', id);

      if (deleteError) throw deleteError;

      setItineraries(itineraries.filter((it) => it.id !== id));
      setSuccess('Itinerary deleted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete itinerary');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditItinerary = (itinerary: GuideItinerary) => {
    setEditingId(itinerary.id);
    setFormData({
      number_of_days: String(itinerary.number_of_days),
      timings: itinerary.timings,
      description: itinerary.description,
      places_to_visit: itinerary.places_to_visit,
      instructions: itinerary.instructions || '',
      price: String(itinerary.price),
      price_type: itinerary.price_type,
    });
    // Track existing images separately
    setExistingImages({
      image1: itinerary.image_1_url || null,
      image2: itinerary.image_2_url || null,
    });
    setImages({ image1: null, image2: null });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      number_of_days: '1',
      timings: '',
      description: '',
      places_to_visit: '',
      instructions: '',
      price: '100',
      price_type: 'per_day',
    });
    setImages({ image1: null, image2: null });
    setExistingImages({ image1: null, image2: null });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <Card className="border border-border p-6">
        <p className="text-muted-foreground text-center">Loading itineraries...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Itineraries
        </h3>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Itinerary
          </Button>
        )}
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}
      {success && <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 p-3 rounded-md text-sm">{success}</div>}

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border border-border p-6 bg-muted/50">
          <h4 className="font-semibold text-foreground mb-4">{editingId ? 'Edit' : 'Create New'} Itinerary</h4>
          
          <div className="space-y-4">
            {/* Number of Days */}
            <div>
              <label htmlFor="number-of-days" className="block text-sm font-medium text-foreground mb-2">Number of Days *</label>
              <input
                id="number-of-days"
                type="number"
                min="1"
                max="365"
                step="1"
                value={formData.number_of_days}
                onChange={(e) => {
                  const val = e.target.value.trim();
                  setFormData({ ...formData, number_of_days: val });
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Timings */}
            <div>
              <label htmlFor="timings" className="block text-sm font-medium text-foreground mb-2">Timings (e.g., 6:00 AM - 6:00 PM) *</label>
              <input
                id="timings"
                type="text"
                placeholder="e.g., 6:00 AM - 6:00 PM"
                value={formData.timings}
                onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">Description *</label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe your itinerary..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Places to Visit */}
            <div>
              <label htmlFor="places-to-visit" className="block text-sm font-medium text-foreground mb-2">Places to Visit *</label>
              <textarea
                id="places-to-visit"
                rows={3}
                placeholder="List places to visit (one per line recommended)..."
                value={formData.places_to_visit}
                onChange={(e) => setFormData({ ...formData, places_to_visit: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-foreground mb-2">Instructions (Optional)</label>
              <textarea
                id="instructions"
                rows={2}
                placeholder="Any special instructions for travelers..."
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>

            {/* Pricing Section */}
            <div className="border border-border rounded-lg p-4 bg-blue-50 dark:bg-blue-950/20 space-y-4">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                💰 Pricing
              </h4>

              {/* Price Input */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">Price (Rs) *</label>
                <input
                  id="price"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="Enter price (e.g., 150)..."
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              {/* Price Type Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">Price Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_type"
                      value="per_day"
                      checked={formData.price_type === 'per_day'}
                      onChange={(e) => setFormData({ ...formData, price_type: 'per_day' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Per Day</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price_type"
                      value="per_trip"
                      checked={formData.price_type === 'per_trip'}
                      onChange={(e) => setFormData({ ...formData, price_type: 'per_trip' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Per Trip</span>
                  </label>
                </div>
              </div>

              {/* Price Display */}
              <div className="pt-2 p-3 bg-white dark:bg-slate-900 rounded border border-border">
                <p className="text-xs text-muted-foreground mb-1">Total Price:</p>
                <p className="text-lg font-semibold text-foreground">
                  ₹{(parseInt(formData.price) || 0).toLocaleString('en-IN')}
                  {formData.price_type === 'per_day' ? ` / day` : ` / trip`}
                </p>
              </div>
            </div>

            {/* Image Uploads */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Itinerary Images (Optional)</label>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Image 1 */}
                <div className="border border-dashed border-border rounded-md p-4">
                  <label htmlFor="image-1" className="block text-xs font-medium text-foreground mb-2">Image 1</label>
                  
                  {/* Show existing image if present and not replaced */}
                  {existingImages.image1 && !images.image1 && (
                    <div className="mb-3">
                      <img
                        src={existingImages.image1}
                        alt="Existing Image 1"
                        className="w-full h-24 object-cover rounded-md border border-border mb-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setExistingImages({ ...existingImages, image1: null })}
                        className="w-full gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Image
                      </Button>
                    </div>
                  )}

                  {/* Show newly selected image */}
                  {images.image1 ? (
                    <div>
                      <p className="text-xs text-green-600 mb-2">✓ {images.image1.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImages({ ...images, image1: null })}
                        className="w-full"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  ) : (
                    <input
                      id="image-1"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImages({ ...images, image1: e.target.files?.[0] || null })}
                      className="block w-full text-sm text-muted-foreground"
                    />
                  )}
                </div>

                {/* Image 2 */}
                <div className="border border-dashed border-border rounded-md p-4">
                  <label htmlFor="image-2" className="block text-xs font-medium text-foreground mb-2">Image 2</label>
                  
                  {/* Show existing image if present and not replaced */}
                  {existingImages.image2 && !images.image2 && (
                    <div className="mb-3">
                      <img
                        src={existingImages.image2}
                        alt="Existing Image 2"
                        className="w-full h-24 object-cover rounded-md border border-border mb-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setExistingImages({ ...existingImages, image2: null })}
                        className="w-full gap-2"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete Image
                      </Button>
                    </div>
                  )}

                  {/* Show newly selected image */}
                  {images.image2 ? (
                    <div>
                      <p className="text-xs text-green-600 mb-2">✓ {images.image2.name}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImages({ ...images, image2: null })}
                        className="w-full"
                      >
                        Clear Selection
                      </Button>
                    </div>
                  ) : (
                    <input
                      id="image-2"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImages({ ...images, image2: e.target.files?.[0] || null })}
                      className="block w-full text-sm text-muted-foreground"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSaveItinerary}
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
                    <Upload className="w-4 h-4" />
                    {editingId ? 'Update' : 'Create'} Itinerary
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Itineraries List */}
      {itineraries.length === 0 ? (
        <Card className="border border-border p-6 text-center">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No itineraries yet. Create one to get started!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {itineraries.map((itinerary) => (
            <Card key={itinerary.id} className="border border-border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-foreground">{itinerary.number_of_days}-Day Itinerary</h4>
                  <p className="text-sm text-muted-foreground">{itinerary.timings}</p>
                  {/* Pricing Display */}
                  <div className="mt-2 inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">
                    ₹{itinerary.price.toLocaleString('en-IN')} {itinerary.price_type === 'per_day' ? '/ day' : '/ trip'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditItinerary(itinerary)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteItinerary(itinerary.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{itinerary.description}</p>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1">Places to Visit</p>
                  <p className="text-foreground whitespace-pre-wrap">{itinerary.places_to_visit}</p>
                </div>

                {itinerary.instructions && (
                  <div>
                    <p className="text-muted-foreground mb-1">Instructions</p>
                    <p className="text-foreground">{itinerary.instructions}</p>
                  </div>
                )}

                {(itinerary.image_1_url || itinerary.image_2_url) && (
                  <div>
                    <p className="text-muted-foreground mb-2">Images</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {itinerary.image_1_url && (
                        <img
                          src={itinerary.image_1_url}
                          alt="Itinerary 1"
                          className="w-full h-32 object-cover rounded-md border border-border"
                        />
                      )}
                      {itinerary.image_2_url && (
                        <img
                          src={itinerary.image_2_url}
                          alt="Itinerary 2"
                          className="w-full h-32 object-cover rounded-md border border-border"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
