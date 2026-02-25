'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Search, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocationSuggestion {
  place_id: string;
  formatted: string;
  city?: string;
  state?: string;
  country?: string;
  lon: number;
  lat: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  apiKey: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search for your location...',
  className,
  disabled = false,
  apiKey,
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch location suggestions from Geoapify API
  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!text || text.length < 2) {
        setSuggestions([]);
        setError(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&apiKey=${apiKey}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch suggestions');
        }

        const data = await response.json();
        
        if (data.features && Array.isArray(data.features)) {
          const formatted = data.features.map((feature: any) => {
            const props = feature.properties;
            return {
              place_id: props.place_id,
              formatted: props.formatted,
              city: props.city,
              state: props.state,
              country: props.country,
              lon: props.lon,
              lat: props.lat,
            };
          });
          setSuggestions(formatted);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching locations');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey]
  );

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce timer (300ms)
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle location selection
  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.formatted);
    onChange(suggestion.formatted);
    setIsOpen(false);
    setSuggestions([]);
    setError(null);
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Input Field */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-base text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && !isLoading && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border bg-popover shadow-md"
        >
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                onClick={() => handleSelectLocation(suggestion)}
                className={cn(
                  'w-full px-4 py-2 text-left hover:bg-accent transition-colors',
                  'flex items-start gap-3 border-b border-border last:border-b-0',
                  'focus:outline-none focus:bg-accent'
                )}
              >
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {suggestion.city || suggestion.state || suggestion.country}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {suggestion.formatted}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && inputValue.length >= 2 && suggestions.length === 0 && !isLoading && !error && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-md border border-border bg-popover shadow-md p-3 text-sm text-muted-foreground">
          No locations found. Try a different search.
        </div>
      )}
    </div>
  );
}
