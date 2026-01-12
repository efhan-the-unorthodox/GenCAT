import { useState, useRef } from 'react';
import { X, Upload } from 'lucide-react';
import type { Project } from '../App';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Project) => void;
}

export function NewProjectDialog({ isOpen, onClose, onCreateProject }: NewProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [destinationLanguage, setDestinationLanguage] = useState('Chinese (Simplified)');
  const [document, setDocument] = useState<File | null>(null);
  const [termBase, setTermBase] = useState<File | null>(null);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const termBaseInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mock sentences for demo purposes
    const mockSentences = [
      { id: '1', sourceText: 'Systematic reviews indicate that several weeks of mindfulness meditation interventions can significantly improve sleep quality.' },
      { id: '2', sourceText: 'The research demonstrates consistent benefits across different populations.' },
      { id: '3', sourceText: 'Participants who practiced mindfulness meditation showed improved sleep patterns.' },
      { id: '4', sourceText: 'These findings suggest that mindfulness meditation could be an effective non-pharmaceutical intervention.' },
      { id: '5', sourceText: 'Future studies should explore the long-term effects of sustained meditation practice.' },
    ];

    const newProject: Project = {
      id: Date.now().toString(),
      name: projectName,
      sourceLanguage,
      destinationLanguage,
      documentName: document?.name,
      termBaseName: termBase?.name,
      lastEdit: new Date().toISOString(),
      sentences: mockSentences,
    };

    onCreateProject(newProject);
    
    // Reset form
    setProjectName('');
    setSourceLanguage('English');
    setDestinationLanguage('Chinese (Simplified)');
    setDocument(null);
    setTermBase(null);
  };

  const handleDocumentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx'))) {
      setDocument(file);
    }
  };

  const handleTermBaseDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setTermBase(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl">New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm mb-2">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29bafe] focus:border-[#29bafe] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">
                Source Language <span className="text-red-500">*</span>
              </label>
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29bafe] focus:border-[#29bafe] outline-none"
              >
                <option value="English">English</option>
                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-2">
                Destination Language <span className="text-red-500">*</span>
              </label>
              <select
                value={destinationLanguage}
                onChange={(e) => setDestinationLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#29bafe] focus:border-[#29bafe] outline-none"
              >
                <option value="English">English</option>
                <option value="Chinese (Simplified)">Chinese (Simplified)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">
              Attach Document <span className="text-red-500">*</span>
            </label>
            <div
              onDrop={handleDocumentDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => documentInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              {document ? (
                <p className="text-sm text-gray-700">{document.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-1">
                    Drop your document here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .txt, .pdf, .docx
                  </p>
                </>
              )}
              <input
                ref={documentInputRef}
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                className="hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">
              Upload Term Base <span className="text-gray-500">(Optional)</span>
            </label>
            <div
              onDrop={handleTermBaseDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => termBaseInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
              {termBase ? (
                <p className="text-sm text-gray-700">{termBase.name}</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-1">
                    Drop your term base here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported format: .csv
                  </p>
                </>
              )}
              <input
                ref={termBaseInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => setTermBase(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#29bafe] text-white rounded-lg hover:bg-[#1da8ee] transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}