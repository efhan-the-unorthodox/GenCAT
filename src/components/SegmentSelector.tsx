import { useState, useEffect, Fragment } from 'react';
import { Loader2, AlertCircle, PlusCircle, Brain, SplitSquareHorizontal } from 'lucide-react';
import { TranslationService } from '../services/TranslationService';
import type { Segment } from '../types/translation';

interface SegmentSelectorProps {
  translation: string;
  onUpdateTranslation: (translation: string) => void;
  destinationLanguage: string;
  chunkKey: number;
}

export function SegmentSelector({
  translation,
  onUpdateTranslation,
  destinationLanguage,
  chunkKey,
}: SegmentSelectorProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [originalSegments, setOriginalSegments] = useState<Segment[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translationService = new TranslationService();

  useEffect(() => {
    const fetchSegments = async () => {
      setIsInitialLoading(true);
      setError(null);

      try {
        const fetchedSegments = await translationService.chunkSentence(
          translation,
          destinationLanguage
        );
        setSegments(fetchedSegments);
        setOriginalSegments(fetchedSegments); // Store originals for split
      } catch (err) {
        console.error('Failed to chunk sentence:', err);
        setError('Failed to break down the sentence. Please try again.');
        setSegments([]);
        setOriginalSegments([]);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSegments();
  }, [chunkKey]);

  // Merge two adjacent segments
  const mergeSegments = (index: number) => {
    if (index >= segments.length - 1) return;

    const segment1 = segments[index];
    const segment2 = segments[index + 1];

    const mergedSegment: Segment = {
      id: `merged-${segment1.id}-${segment2.id}`,
      text: `${segment1.text} ${segment2.text}`,
      originalTokenIds: [
        ...(segment1.originalTokenIds || [segment1.id]),
        ...(segment2.originalTokenIds || [segment2.id]),
      ],
    };

    const newSegments = [
      ...segments.slice(0, index),
      mergedSegment,
      ...segments.slice(index + 2),
    ];

    setSegments(newSegments);
    updateTranslation(newSegments);
  };

  // Split a merged segment back to original tokens
  const splitSegment = (segmentId: string) => {
    const segmentIndex = segments.findIndex(s => s.id === segmentId);
    if (segmentIndex === -1) return;

    const segment = segments[segmentIndex];

    if (!segment.originalTokenIds || segment.originalTokenIds.length <= 1) {
      return; // Already atomic, can't split
    }

    // Find original segments by ID
    const restoredSegments: Segment[] = [];
    for (const originalId of segment.originalTokenIds) {
      const original = originalSegments.find(s => s.id === originalId);
      if (original) {
        restoredSegments.push({ ...original });
      }
    }

    // Fallback: if we can't find originals, split by spaces
    if (restoredSegments.length === 0) {
      const tokens = segment.text.split(' ');
      tokens.forEach((token, idx) => {
        restoredSegments.push({
          id: `${segment.id}-split-${idx}`,
          text: token,
        });
      });
    }

    const newSegments = [
      ...segments.slice(0, segmentIndex),
      ...restoredSegments,
      ...segments.slice(segmentIndex + 1),
    ];

    setSegments(newSegments);
    updateTranslation(newSegments);
  };

  // Generate AI alternatives for a segment
  const generateAlternatives = async (segmentId: string, position: number) => {
    const segment = segments.find(s => s.id === segmentId);
    if (!segment) return;

    // Update loading state
    setSegments(prev =>
      prev.map(s =>
        s.id === segmentId
          ? { ...s, isLoadingAlternatives: true }
          : s
      )
    );

    try {
      const fullSentence = segments.map(s => s.text).join(' ');
      const alternatives = await translationService.generateSegmentAlternatives(
        segment.text,
        fullSentence,
        position,
        destinationLanguage
      );

      setSegments(prev =>
        prev.map(s =>
          s.id === segmentId
            ? {
                ...s,
                alternatives,
                showAlternatives: true,
                isLoadingAlternatives: false,
              }
            : s
        )
      );
    } catch (err) {
      console.error('Failed to generate alternatives:', err);
      setSegments(prev =>
        prev.map(s =>
          s.id === segmentId
            ? { ...s, isLoadingAlternatives: false }
            : s
        )
      );
    }
  };

  // Select an alternative and update segment text
  const selectAlternative = (segmentId: string, alternativeText: string) => {
    const newSegments = segments.map(s =>
      s.id === segmentId
        ? { ...s, text: alternativeText, showAlternatives: false }
        : s
    );

    setSegments(newSegments);
    updateTranslation(newSegments);
  };

  // Toggle alternatives dropdown
  const toggleAlternatives = (segmentId: string) => {
    setSegments(prev =>
      prev.map(s =>
        s.id === segmentId
          ? { ...s, showAlternatives: !s.showAlternatives }
          : s
      )
    );
  };

  // Update parent translation when segments change
  const updateTranslation = (newSegments: Segment[]) => {
    const newTranslation = newSegments.map(s => s.text).join(' ');
    onUpdateTranslation(newTranslation);
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-8 h-8 text-[#29bafe] animate-spin mb-3" />
        <p className="text-sm text-gray-500">Breaking down sentence into segments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (segments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">No segments found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-500">
        Click ⊕ to merge segments, use buttons to split or generate alternatives:
      </div>

      <div className="flex flex-wrap items-start gap-2">
        {segments.map((segment, index) => (
          <Fragment key={segment.id}>
            {/* Segment Box */}
            <div className="relative">
              {/* Main segment with buttons */}
              <div className="flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white hover:border-gray-400 transition-colors">
                <span className="text-sm">{segment.text}</span>

                {/* Split button (if merged) */}
                {segment.originalTokenIds && segment.originalTokenIds.length > 1 && (
                  <button
                    onClick={() => splitSegment(segment.id)}
                    className="p-1 text-[#29bafe] hover:bg-gray-100 rounded transition-colors"
                    title="Split segment"
                  >
                    <SplitSquareHorizontal className="w-4 h-4" />
                  </button>
                )}

                {/* Generate alternatives button */}
                <button
                  onClick={() => {
                    if (segment.alternatives && segment.alternatives.length > 0) {
                      toggleAlternatives(segment.id);
                    } else {
                      generateAlternatives(segment.id, index);
                    }
                  }}
                  disabled={segment.isLoadingAlternatives}
                  className={`p-1 rounded transition-colors ${
                    segment.isLoadingAlternatives
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-[#29bafe] hover:bg-gray-100'
                  }`}
                  title="Generate alternative phrasings"
                >
                  {segment.isLoadingAlternatives ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Alternatives dropdown */}
              {segment.showAlternatives && segment.alternatives && segment.alternatives.length > 0 && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-full max-w-xs">
                  {segment.alternatives.map((alt, altIndex) => (
                    <button
                      key={altIndex}
                      onClick={() => selectAlternative(segment.id, alt)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors border-b last:border-b-0 text-sm"
                    >
                      {alt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Plus button (between segments, not after last) */}
            {index < segments.length - 1 && (
              <button
                onClick={() => mergeSegments(index)}
                className="text-gray-400 hover:text-[#29bafe] transition-colors"
                title="Merge with next segment"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
