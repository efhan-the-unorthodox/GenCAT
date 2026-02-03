import { ArrowLeft, FileText, Clock, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import type { Project } from '../types/translation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { Button } from './ui/button';

interface AllProjectsProps {
  projects: Project[];
  onBack: () => void;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function AllProjects({ projects, onBack, onSelectProject, onDeleteProject, isLoading, error, onRetry }: AllProjectsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hour${Math.floor(diffInHours) === 1 ? '' : 's'} ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} day${Math.floor(diffInDays) === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl">All Projects</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-[#29bafe] animate-spin mb-4" />
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-gray-700 text-lg mb-4">{error}</p>
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-[#29bafe] text-white rounded-lg hover:bg-[#1da8e9] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-2">No projects yet</p>
            <p className="text-gray-400 text-sm">Create your first translation project to get started</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {

              return (
                <button
                  key={project.id}
                  onClick={() => onSelectProject(project)}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-[#29bafe] transition-all p-6 text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl mb-2 group-hover:text-[#29bafe] transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">{project.sourceLanguage}</span>
                          <span>→</span>
                          <span className="font-medium">{project.destinationLanguage}</span>
                        </span>
                        {project.documentName && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {project.documentName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Last edited {formatDate(project.lastEdit)}</span>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 h-auto transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{project.name}"? This action cannot be undone and will permanently remove all project files and translations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => onDeleteProject(project.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                  {/* <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-[#29bafe] h-full transition-all"
                        style={{ 
                          width: `${progressPercent}%` 
                        }}
                      />
                    </div>
                  </div> */}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
