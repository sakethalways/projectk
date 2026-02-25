'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, BookOpen } from 'lucide-react';
import type { Guide } from '@/lib/supabase-client';
import ItineraryModal from './itinerary-modal';

interface GuideCardProps {
  guide: Guide;
}

export default function GuideCard({ guide }: GuideCardProps) {
  const [showItinerary, setShowItinerary] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col border border-border">
        {/* Profile Picture */}
        <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
          {guide.profile_picture_url ? (
            <Image
              src={guide.profile_picture_url}
              alt={guide.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              priority={false}
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <div className="text-5xl mb-2">👤</div>
              <p className="text-sm">No Photo</p>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{guide.name}</h3>

          {/* Location */}
          <div className="flex items-start gap-2 mb-3 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{guide.location}</span>
          </div>

          {/* Languages */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {guide.languages && Array.isArray(guide.languages) && guide.languages.length > 0 ? (
                <>
                  {guide.languages.slice(0, 2).map((lang, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {lang}
                    </Badge>
                  ))}
                  {guide.languages.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{guide.languages.length - 2}
                    </Badge>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">No languages listed</span>
              )}
            </div>
          </div>

          {/* View Itinerary Button */}
          <Button
            onClick={() => setShowItinerary(true)}
            variant="default"
            size="sm"
            className="w-full mt-auto"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            View Itinerary
          </Button>
        </div>
      </Card>

      {/* Itinerary Modal */}
      <ItineraryModal
        guideId={guide.id}
        guideName={guide.name}
        open={showItinerary}
        onOpenChange={setShowItinerary}
      />
    </>
  );
}
