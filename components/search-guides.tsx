'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, X } from 'lucide-react';
import GuideCard from '@/components/guide-card';
import type { Guide } from '@/lib/supabase-client';

interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

export default function SearchGuides() {
  const [filters, setFilters] = useState({
    name: '',
    language: '',
    location: '',
    availabilityDate: '',
  });

  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const [languages, setLanguages] = useState<string[]>([]);
  const [languageSuggestions, setLanguageSuggestions] = useState<string[]>([]);
  const [showLanguageSuggestions, setShowLanguageSuggestions] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/get-languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data.languages || []);
        }
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };
    fetchLanguages();
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    if (field === 'language') {
      if (value.trim()) {
        const filtered = languages.filter(lang => lang.toLowerCase().includes(value.toLowerCase()));
        setLanguageSuggestions(filtered);
        setShowLanguageSuggestions(true);
      } else {
        setShowLanguageSuggestions(false);
      }
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
      const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}`);
      if (response.ok) {
        const data = await response.json();
        const suggestions: LocationSuggestion[] = (data.features || []).slice(0, 5).map((feature: any) => ({
          name: feature.properties.formatted,
          lat: feature.properties.lat,
          lon: feature.properties.lon,
        }));
        setLocationSuggestions(suggestions);
        setShowLocationSuggestions(true);
      }
    } catch (err) {
      console.error('Error fetching location suggestions:', err);
    }
  };

  const handleLocationChange = (value: string) => {
    setFilters(prev => ({ ...prev, location: value }));
    fetchLocationSuggestions(value);
  };

  const selectLanguage = (lang: string) => {
    setFilters(prev => ({ ...prev, language: lang }));
    setShowLanguageSuggestions(false);
  };

  const selectLocation = (location: string) => {
    setFilters(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.language) params.append('language', filters.language);
      if (filters.location) params.append('location', filters.location);
      if (filters.availabilityDate) params.append('availabilityDate', filters.availabilityDate);

      const response = await fetch(`/api/search-guides?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to search guides');
      }

      const data = await response.json();
      setGuides(data.guides || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      name: '',
      language: '',
      location: '',
      availabilityDate: '',
    });
    setGuides([]);
    setSearched(false);
    setError('');
    setShowLanguageSuggestions(false);
    setShowLocationSuggestions(false);
  };

  const hasActiveFilters = filters.name || filters.language || filters.location || filters.availabilityDate;

  return (
    <div className="space-y-8">
      {/* Search and Filter Card */}
      <Card className="border border-border p-8 bg-white dark:bg-slate-800">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold text-foreground flex items-center gap-2 mb-2">
            <Search className="w-6 h-6 text-primary" />
            Search & Filter Guides
          </h3>
          <p className="text-muted-foreground">
            Use one or more filters to find guides that match your preferences. All filters are case-insensitive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Name Filter */}
          <div suppressHydrationWarning>
            <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
              Guide Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Saketh"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              className="w-full"
              suppressHydrationWarning
            />
          </div>

          {/* Language Filter with Autocomplete */}
          <div className="relative" suppressHydrationWarning>
            <Label htmlFor="language" className="text-sm font-medium text-foreground mb-2 block">
              Language
            </Label>
            <Input
              id="language"
              type="text"
              placeholder="e.g., English"
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full"
              suppressHydrationWarning
            />
            {showLanguageSuggestions && languageSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-border rounded-md shadow-lg z-10">
                {languageSuggestions.map(lang => (
                  <button key={lang} onClick={() => selectLanguage(lang)} className="w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-slate-600 text-foreground text-sm">
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Location Filter with Geoapify Autocomplete */}
          <div className="relative" suppressHydrationWarning>
            <Label htmlFor="location" className="text-sm font-medium text-foreground mb-2 block">
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Paris"
              value={filters.location}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full"
              suppressHydrationWarning
            />
            {showLocationSuggestions && locationSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-700 border border-border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                {locationSuggestions.map((location, idx) => (
                  <button key={idx} onClick={() => selectLocation(location.name)} className="w-full text-left px-3 py-2 hover:bg-muted dark:hover:bg-slate-600 text-foreground text-sm">
                    {location.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Availability Date Filter */}
          <div suppressHydrationWarning>
            <Label htmlFor="availabilityDate" className="text-sm font-medium text-foreground mb-2 block">
              Available Date
            </Label>
            <Input
              id="availabilityDate"
              type="date"
              value={filters.availabilityDate}
              onChange={(e) => handleFilterChange('availabilityDate', e.target.value)}
              className="w-full"
              suppressHydrationWarning
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3" suppressHydrationWarning>
          <Button
            onClick={handleSearch}
            disabled={loading || !hasActiveFilters}
            className="gap-2 flex-1 md:flex-none"
            suppressHydrationWarning
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              className="gap-2"
              suppressHydrationWarning
            >
              <X className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      )}

      {/* Results */}
      {searched && !loading && (
        <div>
          {guides.length === 0 ? (
            <Card className="border border-border p-12 text-center bg-muted/50">
              <p className="text-muted-foreground text-lg">
                {hasActiveFilters ? 'No guides found matching your filters.' : 'No filters applied.'}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {hasActiveFilters ? 'Try adjusting your search criteria.' : 'Add at least one filter to search.'}
              </p>
            </Card>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  Found {guides.length} guide{guides.length !== 1 ? 's' : ''}
                </h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {guides.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
