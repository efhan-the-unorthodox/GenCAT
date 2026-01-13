import { useState } from 'react';
import { ArrowLeft, FolderOpen } from 'lucide-react';

const PROJECTS_FOLDER_KEY = 'fanee.settings.projectsFolderName';
const SENTENCES_FOLDER_KEY = 'fanee.settings.sentencesFolderName';

interface SettingsProps {
  onBack: () => void;
}

const getStoredName = (key: string) => {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(key) ?? '';
};

export function Settings({ onBack }: SettingsProps) {
  const [projectsFolderName, setProjectsFolderName] = useState(() => getStoredName(PROJECTS_FOLDER_KEY));
  const [sentencesFolderName, setSentencesFolderName] = useState(() => getStoredName(SENTENCES_FOLDER_KEY));
  const supportsDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  const handlePickFolder = async (
    label: string,
    setter: (value: string) => void,
    storageKey: string,
  ) => {
    if (!supportsDirectoryPicker) {
      window.alert('Your browser does not support selecting folders yet.');
      return;
    }

    try {
      const handle = await window.showDirectoryPicker();
      const folderName = handle.name || label;
      setter(folderName);
      window.localStorage.setItem(storageKey, folderName);
    } catch {
      // Ignore cancellation.
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <h2 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-500 mb-8">
          Choose where Fanee should store your projects list and sentence data files.
        </p>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Projects list location</h3>
            <p className="text-sm text-gray-500 mb-4">
              This folder will hold the projects.json file that tracks all of your projects.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-700">
                {projectsFolderName ? `Selected: ${projectsFolderName}` : 'No folder selected'}
              </span>
              <button
                onClick={() =>
                  handlePickFolder('Projects folder', setProjectsFolderName, PROJECTS_FOLDER_KEY)
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#29bafe] text-white hover:bg-[#1da8ee] transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Select folder
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sentence data location</h3>
            <p className="text-sm text-gray-500 mb-4">
              This folder will store the sentence data JSON files for each project.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-gray-700">
                {sentencesFolderName ? `Selected: ${sentencesFolderName}` : 'No folder selected'}
              </span>
              <button
                onClick={() =>
                  handlePickFolder('Sentence data folder', setSentencesFolderName, SENTENCES_FOLDER_KEY)
                }
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#29bafe] text-white hover:bg-[#1da8ee] transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Select folder
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
