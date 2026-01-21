import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, ChevronUp } from 'lucide-react';
import { SentenceItem } from './SentenceItem';
import type { Project, Sentence } from '../types/translation';
import { TranslationService } from '../services/TranslationService';
import { ProjectService } from '../services/ProjectService';

interface TranslationInterfaceProps {
  project: Project;
  sentences: Sentence[];
  onBack: () => void;
  onUpdateSentences: (sentences: Sentence[]) => void;
}

const translationService = new TranslationService();
const projectService = new ProjectService();
export function TranslationInterface({
  project,
  sentences,
  onBack,
  onUpdateSentences,
}: TranslationInterfaceProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);



  useEffect(() => {
    projectService.getSentences(project.id).then(a => console.log(a))
  }, [])

  const handleUpdateSentence = (sentenceId: number, translation: string, isComplete?: boolean) => {
    const updatedSentences = sentences.map(sentence =>
      sentence.id === sentenceId
        ? { ...sentence, translation, isComplete: isComplete ?? sentence.isComplete }
        : sentence
    );

    onUpdateSentences(updatedSentences);
  };

  const completedSentences = sentences.filter(s => s.isComplete);
  const consolidatedText = completedSentences
    .map(s => s.translation)
    .filter(Boolean)
    .join(' ');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl">{project.name}</h1>
            <p className="text-sm text-gray-600">
              {project.sourceLanguage} → {project.destinationLanguage}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button className="p-2 border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors" title="Term Base">
              <BookOpen className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {sentences.map((sentence, index) => (
            <SentenceItem
              key={sentence.id}
              sentence={sentence}
              index={index + 1}
              onUpdateTranslation={(translation, isComplete) =>
                handleUpdateSentence(sentence.id, translation, isComplete)
              }
            />
          ))}
        </div>
      </div>

      {/* Bottom Drawer */}
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg transition-transform duration-300 z-20 ${isDrawerOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3rem)]'
          }`}
        style={{ maxHeight: '60vh' }}
      >
        <button
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className="w-full py-3 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Consolidated Translation</span>
            {completedSentences.length > 0 && (
              <span className="bg-[#29bafe] text-white text-xs px-2 py-1 rounded-full">
                {completedSentences.length} completed
              </span>
            )}
          </div>
          <ChevronUp
            className={`w-5 h-5 transition-transform ${isDrawerOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isDrawerOpen && (
          <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(60vh - 3rem)' }}>
            <textarea
              value={consolidatedText}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 min-h-[200px] resize-none"
              placeholder="Completed translations will appear here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
