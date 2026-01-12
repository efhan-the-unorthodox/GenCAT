import { useState, useRef } from 'react';
import { ChevronDown, ChevronRight, Check, Sparkles, RefreshCw } from 'lucide-react';
import { SegmentSelector } from './SegmentSelector';

interface Sentence {
  id: string;
  sourceText: string;
  translation?: string;
  isComplete?: boolean;
}

interface SentenceItemProps {
  sentence: Sentence;
  index: number;
  onUpdateTranslation: (translation: string, isComplete?: boolean) => void;
}

interface Suggestion {
  id: string;
  text: string;
}

export function SentenceItem({ sentence, index, onUpdateTranslation }: SentenceItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translation, setTranslation] = useState(sentence.translation || '');
  const [showSegmentSelector, setShowSegmentSelector] = useState(false);
  const [showSentenceSuggestions, setShowSentenceSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [selectionPosition, setSelectionPosition] = useState<{ x: number; y: number } | null>(null);
  const sourceTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mock AI suggestions for initial generation
  const generateInitialSuggestions = () => {
    const mockSuggestions: Suggestion[] = [
      { id: '1', text: '系统性评估表明，数周的正念冥想干预可以显著改善睡眠质量。' },
      { id: '2', text: '系统性审查显示，进行几周的正念冥想干预能够明显提升睡眠品质。' },
      { id: '3', text: '根据系统性评估，持续数周的正念冥想干预能够有效改善睡眠质量。' },
    ];
    setSuggestions(mockSuggestions);
  };

  // Mock AI suggestions for sentence alternatives (when there's already translation)
  const generateSentenceSuggestions = () => {
    const mockSuggestions: Suggestion[] = [
      { id: '1', text: '系统性评审指出，数周的正念冥想介入措施可以大幅改善睡眠品质。' },
      { id: '2', text: '系统化评估证明，持续几周的静心冥想干预能够显著提高睡眠质量。' },
      { id: '3', text: '根据系统性审查，若干周的正念练习干预能明显增强睡眠水平。' },
    ];
    setSuggestions(mockSuggestions);
    setShowSentenceSuggestions(true);
    setShowSegmentSelector(false);
  };

  const handleSelectSuggestion = (suggestionText: string) => {
    setTranslation(suggestionText);
    onUpdateTranslation(suggestionText);
    setSuggestions([]);
    setShowSentenceSuggestions(false);
  };

  const handleTranslationChange = (newTranslation: string) => {
    setTranslation(newTranslation);
    onUpdateTranslation(newTranslation);
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

  const handleAddToTermBase = () => {
    // Mock adding to term base
    alert(`Added "${selectedText}" to term base`);
    setSelectedText('');
    setSelectionPosition(null);
  };

  const handleShowAlternativePhrasings = () => {
    setShowSegmentSelector(!showSegmentSelector);
    setShowSentenceSuggestions(false);
    setSuggestions([]);
  };

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 resize-none overflow-hidden"
                style={{ 
                  minHeight: '3rem',
                  height: 'auto'
                }}
                onInput={(e) => {
                  e.currentTarget.style.height = 'auto';
                  e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                }}
              />
              
              {selectionPosition && selectedText && (
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
              )}
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
                    className="flex items-center gap-2 px-4 py-2 bg-[#29bafe] text-white rounded-lg hover:bg-[#1da8ee] transition-colors text-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Suggestions
                  </button>
                )}
              </div>
              
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
                    translation
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Mark as complete"
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
                  
                  <button
                    onClick={handleShowAlternativePhrasings}
                    className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors group relative"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs">Alternative Phrasings</span>
                    <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      Generate alternative segments
                    </span>
                  </button>
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
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}