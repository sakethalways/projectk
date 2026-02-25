'use client';

import { useState, useRef, useEffect } from 'react';
import { SORTED_LANGUAGES } from '@/lib/languages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, X } from 'lucide-react';

interface MultiLanguageSelectProps {
  value: string[];
  onChange: (languages: string[]) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function MultiLanguageSelect({
  value = [],
  onChange,
  disabled = false,
  required = false,
}: MultiLanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<string[]>(SORTED_LANGUAGES);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter languages based on search term (case-insensitive)
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredLanguages(SORTED_LANGUAGES);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = SORTED_LANGUAGES.filter(
        (lang) => lang.toLowerCase().includes(searchLower) && !value.includes(lang)
      );
      setFilteredLanguages(filtered);
    }
  }, [searchTerm, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectLanguage = (language: string) => {
    if (!value.includes(language)) {
      onChange([...value, language]);
      setSearchTerm('');
    }
  };

  const handleRemoveLanguage = (language: string) => {
    onChange(value.filter((l) => l !== language));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Label className="block mb-2">
        Languages {required && <span className="text-destructive">*</span>}
        <span className="text-xs text-muted-foreground ml-1">
          (Select primary, secondary, and optional additional languages)
        </span>
      </Label>

      <div
        className="relative border border-input rounded-md bg-background cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between px-3 py-2 min-h-12">
          <div className="flex-1 flex flex-wrap items-center gap-2">
            {value.length > 0 ? (
              value.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLanguage(lang);
                  }}
                >
                  {lang}
                  <X className="w-3 h-3 cursor-pointer hover:opacity-70" />
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">Select languages...</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {value.length > 0 && !disabled && (
              <button
                onClick={handleClearAll}
                title="Clear all selections"
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 border border-input rounded-md bg-background shadow-lg z-50">
          {/* Search Input */}
          <div className="p-2 border-b border-input sticky top-0 bg-background">
            <Input
              type="text"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={disabled}
              className="h-9"
              autoFocus
            />
          </div>

          {/* Language List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((language) => (
                <div
                  key={language}
                  onClick={() => handleSelectLanguage(language)}
                  className="px-3 py-2 cursor-pointer hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(language)}
                    readOnly
                    className="w-4 h-4"
                  />
                  <span>{language}</span>
                </div>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                {value.length >= SORTED_LANGUAGES.length
                  ? 'All languages selected'
                  : 'No languages found'}
              </div>
            )}
          </div>

          {/* Selected Count */}
          {value.length > 0 && (
            <div className="p-2 border-t border-input bg-muted/30 text-xs text-muted-foreground">
              {value.length} language{value.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
