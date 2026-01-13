import { useEffect, useRef, useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { NewProjectPayload, Project } from '../types/translation';

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
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [destinationLanguage, setDestinationLanguage] = useState('Chinese (Simplified)');
  const [document, setDocument] = useState<File | null>(null);
  const [termBase, setTermBase] = useState<File | null>(null);
  const [projectLocation, setProjectLocation] = useState<FileList | null>(null);
  const [projectFolderName, setProjectFolderName] = useState('');

  const documentInputRef = useRef<HTMLInputElement>(null);
  const termBaseInputRef = useRef<HTMLInputElement>(null);
  const projectLocationInputRef = useRef<HTMLInputElement>(null);

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

  const isFormValid = Boolean(
    normalizedName
      && sourceLanguage
      && destinationLanguage
      && document
      && projectLocation
      && projectFolderName
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

      // Reset form
      setProjectName('');
      setSourceLanguage('English');
      setDestinationLanguage('Chinese (Simplified)');
      setDocument(null);
      setTermBase(null);
      setProjectLocation(null);
      setProjectFolderName('');
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

  const handleProjectLocationChange = (files: FileList | null) => {
    if (!files || files.length === 0) {
      setProjectLocation(null);
      setProjectFolderName('');
      return;
    }

    const relativePath = files[0].webkitRelativePath;
    const folderName = relativePath ? relativePath.split('/')[0] : '';
    setProjectLocation(files);
    setProjectFolderName(folderName);
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
                onChange={(e) => handleDocumentChange(e.target.files)}
                className="hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">
              Project Location <span className="text-red-500">*</span>
            </label>
            <div
              className="border border-gray-300 rounded-lg px-4 py-2 flex items-center justify-between gap-4"
            >
              <span className={projectFolderName ? 'text-sm text-gray-800' : 'text-sm text-gray-400'}>
                {projectFolderName || 'Select a folder to save your project'}
              </span>
              <button
                type="button"
                onClick={() => projectLocationInputRef.current?.click()}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Browse
              </button>
              <input
                ref={projectLocationInputRef}
                type="file"
                onChange={(e) => handleProjectLocationChange(e.target.files)}
                className="hidden"
                // @ts-expect-error -- non-standard attributes for folder selection
                webkitdirectory="true"
                directory="true"
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Choose a folder where your translation work and data will be stored.
            </p>
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
