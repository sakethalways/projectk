'use client';

import { useState, useRef, useEffect } from 'react';
import { SORTED_LANGUAGES } from '@/lib/languages';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, X } from 'lucide-react';

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export default function LanguageSelect({
  value,
  onChange,
  disabled = false,
  required = false,
}: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<string[]>(SORTED_LANGUAGES);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter languages based on search term (case-insensitive)
  useEffect(() => {
    if (searchTerm === '') {
      setFilteredLanguages(SORTED_LANGUAGES);
    } else {
      // Case-insensitive filtering
      const searchLower = searchTerm.toLowerCase();
      const filtered = SORTED_LANGUAGES.filter((lang) =>
        lang.toLowerCase().includes(searchLower)
      );
      setFilteredLanguages(filtered);
    }
  }, [searchTerm]);

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

  const handleSelect = (language: string) => {
    onChange(language);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Label className="block mb-2">
        Language {required && <span className="text-destructive">*</span>}
      </Label>

      <div
        className="relative border border-input rounded-md bg-background cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between px-3 py-2 min-h-10">
          <div className="flex-1 flex items-center gap-2">
            {value ? (
              <>
                <span className="text-foreground">{value}</span>
                {!disabled && (
                  <button
                    onClick={handleClear}
                    className="ml-auto p-1 hover:bg-muted rounded"
                    title="Clear selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Select or type a language...</span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
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
                  onClick={() => handleSelect(language)}
                  className={`px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${
                    value === language ? 'bg-primary text-primary-foreground' : ''
                  }`}
                >
                  {language}
                </div>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
