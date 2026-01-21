import { useState } from 'react';
import { NewProjectDialog } from './NewProjectDialog';
import { FileText, FolderOpen } from 'lucide-react';
import type { NewProjectPayload, Project } from '../types/translation';

interface HomeProps {
  onCreateProject: (project: NewProjectPayload) => Promise<void>;
  onViewAllProjects: () => void;
  projects: Project[];
  isCreatingProject: boolean;
}

export function Home({
  onCreateProject,
  onViewAllProjects,
  projects,
  isCreatingProject,
}: HomeProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-6xl mb-2">Fanee</h1>
        <p className="text-gray-600">Computer Assisted Translation Tool utilizing a Search-Based Approach with LLMs
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center justify-center gap-3 bg-[#29bafe] text-white px-8 py-4 rounded-lg hover:bg-[#1da8ee] transition-colors shadow-lg"
        >
          <FileText className="w-5 h-5" />
          New Project
        </button>

        <button
          onClick={onViewAllProjects}
          className="flex items-center justify-center gap-3 bg-white text-gray-700 px-8 py-4 rounded-lg border-2 border-gray-300 hover:border-[#29bafe] hover:text-[#29bafe] transition-colors shadow-md"
        >
          <FolderOpen className="w-5 h-5" />
          All Projects
          {projects.length > 0 && (
            <span className="bg-gray-200 px-2 py-1 rounded-full text-sm">
              {projects.length}
            </span>
          )}
        </button>

      </div>

      <NewProjectDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateProject={onCreateProject}
        existingProjects={projects}
        isSubmitting={isCreatingProject}
      />
    </div>
  );
}
