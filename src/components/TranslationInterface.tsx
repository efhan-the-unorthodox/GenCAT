import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, BookOpen, ChevronUp, Loader2 } from 'lucide-react';
import { SentenceItem } from './SentenceItem';
import type { Project, Sentence } from '../types/translation';
import { ProjectService } from '../services/ProjectService';

interface TranslationInterfaceProps {
  project: Project;
  onBack: () => void;
}

const projectService = new ProjectService();
export function TranslationInterface({
  project,
  onBack,
}: TranslationInterfaceProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSentences = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await projectService.loadProject(project.id);
      setSentences(data.sentences);
    } catch (err) {
      setError('Failed to load project');
      setSentences([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSentences();
  }, [project.id]);

  const handleUpdateSentence = (sentenceId: number, translation: string, isComplete?: boolean) => {
    const updatedSentences = sentences.map(sentence =>
      sentence.id === sentenceId
        ? { ...sentence, translation, isComplete: isComplete ?? sentence.isComplete }
        : sentence
    );

    setSentences(updatedSentences);
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
          {/* <div className="ml-auto flex items-center gap-3">
            <button className="p-2 border border-gray-300 rounded-lg hover:border-[#29bafe] hover:text-[#29bafe] transition-colors" title="Term Base">
              <BookOpen className="w-5 h-5" />
            </button>
          </div> */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-[#29bafe] animate-spin mb-4" />
            <p className="text-gray-500">Loading sentences...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-gray-700 text-lg mb-4">{error}</p>
            <button
              onClick={fetchSentences}
              className="px-4 py-2 bg-[#29bafe] text-white rounded-lg hover:bg-[#1da8e9] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sentences.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-2">No sentences yet</p>
            <p className="text-gray-400 text-sm">Sentences will appear here once they are available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sentences.map((sentence, index) => (
              <SentenceItem
                key={sentence.id}
                sentence={sentence}
                index={index + 1}
                onUpdateTranslation={(translation, isComplete) =>
                  handleUpdateSentence(sentence.id, translation, isComplete)
                }
                projectId={project.id}
                allSentences={sentences}
                destinationLanguage={project.destinationLanguage}
              />
            ))}
          </div>
        )}
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
