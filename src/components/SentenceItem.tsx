import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Check, Sparkles, RefreshCw, Loader2, X } from 'lucide-react';
import { SegmentSelector } from './SegmentSelector';
import { TranslationService } from '../services/TranslationService';
import type { Sentence } from '../types/translation';

interface SentenceItemProps {
  sentence: Sentence;
  index: number;
  onUpdateTranslation: (translation: string, isComplete?: boolean) => void;
  projectId: string;
  allSentences: Sentence[];
  destinationLanguage: string;
}

interface Suggestion {
  id: string;
  text: string;
}

export function SentenceItem({ sentence, index, onUpdateTranslation, projectId, allSentences, destinationLanguage }: SentenceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translation, setTranslation] = useState(sentence.translation || '');
  const [showSegmentSelector, setShowSegmentSelector] = useState(false);
  const [segmentChunkKey, setSegmentChunkKey] = useState(0);
  const [showSentenceSuggestions, setShowSentenceSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const translationService = new TranslationService();

  // Check if there are pending changes (confirmed sentence with local edits)
  const hasPendingChanges = sentence.isComplete && translation !== (sentence.translation || '');

  // Get previous sentence for context
  const getPreviousSentence = (): string | undefined => {
    const currentIdx = allSentences.findIndex(s => s.id === sentence.id);
    return currentIdx > 0 ? allSentences[currentIdx - 1].sourceText : undefined;
  };

  // Get next sentence for context
  const getNextSentence = (): string | undefined => {
    const currentIdx = allSentences.findIndex(s => s.id === sentence.id);
    return currentIdx < allSentences.length - 1
      ? allSentences[currentIdx + 1].sourceText
      : undefined;
  };

  // Generate AI translation suggestions
  const generateInitialSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError(null);

    try {
      const suggestions = await translationService.generateTransSugg(
        projectId,
        sentence.sourceText,
        getPreviousSentence(),
        getNextSentence()
      );
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      setError('Failed to generate translation suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const generateSentenceSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setError(null);

    try {
      const suggestions = await translationService.generateTransSugg(
        projectId,
        sentence.sourceText,
        getPreviousSentence(),
        getNextSentence()
      );
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      setError('Failed to generate translation suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
    
    setShowSentenceSuggestions(true);
    setShowSegmentSelector(false);
  };

  const handleSelectSuggestion = (suggestionText: string) => {
    setTranslation(suggestionText);
    // Only sync to parent if not already complete
    // If complete, keep original in consolidated until re-confirmed
    if (!sentence.isComplete) {
      onUpdateTranslation(suggestionText, false);
    }
    setSuggestions([]);
    setShowSentenceSuggestions(false);
  };

  const handleTranslationChange = (newTranslation: string) => {
    setTranslation(newTranslation);
    // Only sync to parent if not already complete
    // If complete, keep original in consolidated until re-confirmed
    if (!sentence.isComplete) {
      onUpdateTranslation(newTranslation, false);
    }
  };

  const handleMarkComplete = () => {
    onUpdateTranslation(translation, true);
  };

  const handleSourceTextSelect = () => {
    const textarea = sourceTextAreaRef.current;
    const container = containerRef.current;
    if (!textarea || !container) return;

    const selected = textarea.value.substring(
      textarea.selectionStart,
      textarea.selectionEnd
    );

    if (selected.length > 0) {
      setSelectedText(selected);

      // Get positions relative to the container
      const containerRect = container.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();

      // Calculate approximate position based on selection
      const charsBeforeSelection = textarea.selectionStart;
      const lineHeight = 24; // approximate line height
      const charWidth = 8; // approximate char width
      const charsPerLine = Math.floor(textareaRect.width / charWidth);
      const lineNumber = Math.floor(charsBeforeSelection / charsPerLine);

      setSelectionPosition({
        x: textareaRect.left - containerRect.left + 50,
        y: textareaRect.top - containerRect.top + (lineNumber * lineHeight) - 40
      });
    } else {
      setSelectedText('');
      setSelectionPosition(null);
    }
  };

  // const handleAddToTermBase = () => {
  //   // Mock adding to term base
  //   alert(`Added "${selectedText}" to term base`);
  //   setSelectedText('');
  //   setSelectionPosition(null);
  // };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm" ref={containerRef}>
      <div className="p-4 relative">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-500 mb-2">Sentence {index} (Source)</div>
            <div className="relative">
              <textarea
                ref={sourceTextAreaRef}
                value={sentence.sourceText}
                readOnly
                onMouseUp={handleSourceTextSelect}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none overflow-y-auto max-h-[40vh]"
                style={{
                  minHeight: '3rem',
                  height: 'auto'
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
              />

              {/* {selectionPosition && selectedText && (
                <div 
                  className="absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-2"
                  style={{ 
                    top: selectionPosition.y, 
                    left: selectionPosition.x 
                  }}
                >
                  <button
                    onClick={handleAddToTermBase}
                    className="px-3 py-2 text-sm bg-[#29bafe] text-white rounded hover:bg-[#1da8ee] transition-colors whitespace-nowrap"
                  >
                    Add to Term Base
                  </button>
                </div>
              )} */}
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-1 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Sentence {index} (Translated)</div>
                {!translation && (
                  <button
                    onClick={generateInitialSuggestions}
                    disabled={isLoadingSuggestions}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white transition-colors ${isLoadingSuggestions
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-[#29bafe] hover:bg-[#1da8ee]'
                      }`}
                  >
                    {isLoadingSuggestions ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Suggestions
                      </>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <textarea
                  value={translation}
                  onChange={(e) => handleTranslationChange(e.target.value)}
                  placeholder="Enter translation here..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29bafe] focus:border-[#29bafe] outline-none min-h-[100px] resize-y"
                />
                <button
                  onClick={handleMarkComplete}
                  disabled={!translation}
                  className={`p-3 rounded-lg transition-colors ${
                    !translation
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : hasPendingChanges
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  title={hasPendingChanges ? "Confirm updated translation" : "Mark as complete"}
                >
                  <Check className="w-5 h-5" />
                </button>
              </div>

              {translation && (
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={generateSentenceSuggestions}
                    className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors group relative"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-xs">Suggest Translations</span>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Generate alternative sentence translations
                    </span>
                  </button>

                  {!showSegmentSelector ? (
                    <button
                      onClick={() => {
                        setShowSegmentSelector(true);
                        setSegmentChunkKey(prev => prev + 1);
                        setShowSentenceSuggestions(false);
                        setSuggestions([]);
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors group relative"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs">Sentence Chunking</span>
                      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Generate alternative segments
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setSegmentChunkKey(prev => prev + 1)}
                        className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors"
                        title="Reset segments to individual tokens"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span className="text-xs">Reset</span>
                      </button>
                      <button
                        onClick={() => setShowSegmentSelector(false)}
                        className="flex items-center gap-1 px-2 py-1 text-sm border border-gray-300 rounded-lg hover:border-red-400 hover:text-red-400 transition-colors"
                        title="Close segment editor"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {suggestions.length > 0 && showSentenceSuggestions && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Select a translation suggestion:</div>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#29bafe] transition-colors group"
                  >
                    <p className="flex-1 text-sm">{suggestion.text}</p>
                    <button
                      onClick={() => handleSelectSuggestion(suggestion.text)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Select this suggestion"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {suggestions.length > 0 && !showSentenceSuggestions && !translation && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500">Select a suggestion:</div>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-[#29bafe] transition-colors group"
                  >
                    <p className="flex-1 text-sm">{suggestion.text}</p>
                    <button
                      onClick={() => handleSelectSuggestion(suggestion.text)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Select this suggestion"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showSegmentSelector && translation && (
              <SegmentSelector
                translation={translation}
                onUpdateTranslation={handleTranslationChange}
                destinationLanguage={destinationLanguage}
                chunkKey={segmentChunkKey}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
