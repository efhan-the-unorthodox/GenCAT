import { useEffect, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { LANGUAGE_OPTIONS, type NewProjectPayload, type Project } from '../types/translation';

interface NewProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: NewProjectPayload) => Promise<void>;
  existingProjects: Project[];
  isSubmitting: boolean;
}

export function NewProjectDialog({
  isOpen,
  onClose,
  onCreateProject,
  existingProjects,
  isSubmitting,
}: NewProjectDialogProps) {
  const [projectName, setProjectName] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [destinationLanguage, setDestinationLanguage] = useState('zh-CN');
  const [document, setDocument] = useState<File | null>(null);
  const [termBase, setTermBase] = useState<File | null>(null);

  const documentInputRef = useRef<HTMLInputElement>(null);
  const termBaseInputRef = useRef<HTMLInputElement>(null);

  const [submissionError, setSubmissionError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSubmissionError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const normalizedName = projectName.trim();
  const isDuplicateName = existingProjects.some(
    (project) => project.name.trim().toLowerCase() === normalizedName.toLowerCase(),
  );
  const isSameLanguage = sourceLanguage === destinationLanguage;

  const isFormValid = Boolean(
    normalizedName
    && sourceLanguage
    && destinationLanguage
    && document
    && !isSameLanguage
    && !isDuplicateName,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError('');

    if (!isFormValid) {
      return;
    }
    if (!document) {
      return;
    }

    try {
      await onCreateProject({
        name: normalizedName,
        sourceLanguage,
        destinationLanguage,
        document,
        termBase,
      });
      
      console.log(normalizedName)

      // Reset form
      setProjectName('');
      setSourceLanguage('en');
      setDestinationLanguage('zh-CN');
      setDocument(null);
      setTermBase(null);
      onClose();
    } catch (error) {
      setSubmissionError('Failed to create project. Please try again.');
      // eslint-disable-next-line no-console
      console.error('Failed to create project', error);
    }
  };

  const isValidDocument = (file: File) =>
    file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx');

  const handleDocumentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidDocument(file)) {
      setDocument(file);
    }
  };

  const handleDocumentChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setDocument(null);
      return;
    }

    const file = files[0];
    if (isValidDocument(file)) {
      setDocument(file);
    } else {
      setDocument(null);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
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
            {isDuplicateName && (
              <p className="mt-2 text-sm text-red-500">
                A project with this name already exists. Please choose a different name.
              </p>
            )}
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
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
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
                {LANGUAGE_OPTIONS.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSameLanguage && (
            <p className="text-sm text-red-500">
              Source and destination languages must be different.
            </p>
          )}

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
                onChange={(e) => handleDocumentChange(e.target.files)}
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
              className="px-6 py-2 bg-[#29bafe] text-white rounded-lg hover:bg-[#1da8ee] transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
          {submissionError && (
            <p className="text-sm text-red-500">{submissionError}</p>
          )}
        </form>
      </div>
    </div>
  );
}
