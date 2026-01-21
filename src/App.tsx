import { useCallback, useEffect, useState } from 'react';
import { Home } from './components/Home';
import { TranslationInterface } from './components/TranslationInterface';
import { AllProjects } from './components/AllProjects';
import { TranslationService } from './services/TranslationService';
import { ProjectService } from './services/ProjectService';
import type { NewProjectPayload, Project, Sentence } from './types/translation';

const translationService = new TranslationService();
const projectService = new ProjectService();

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'translation' | 'allProjects'>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSentences, setCurrentSentences] = useState<Sentence[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // map of project id to stored sentences for that project
  const [segmentsByProjectId, setSegmentsByProjectId] = useState<Record<string, Sentence[]>>({});

  const fetchProjects = useCallback(async () => {
    setIsLoadingProjects(true);
    setProjectsError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setProjectsError('Failed to load projects');
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'allProjects') {
      fetchProjects();
    }
  }, [currentView, fetchProjects]);

  const handleCreateProject = async (payload: NewProjectPayload) => {
    setIsCreatingProject(true);
    try {
      const now = new Date();
      const newProject: Project = {
        id: Date.now().toString(),
        name: payload.name.trim(),
        dateCreated: now.toISOString(),
        sourceLanguage: payload.sourceLanguage,
        destinationLanguage: payload.destinationLanguage,
        documentName: payload.document.name,
        termBaseName: payload.termBase?.name,
        lastEdit: now.toISOString(),
      };
      const sentences = await translationService.textPreprocessing({
        document: payload.document,
        project: newProject
      });

      setCurrentProject(newProject);
      setCurrentSentences(sentences);
      setCurrentView('translation');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleUpdateSentences = (sentences: Sentence[]) => {
    if (!currentProject) {
      return;
    }

    setCurrentSentences(sentences);
    setSegmentsByProjectId((prev) => ({ ...prev, [currentProject.id]: sentences }));
  };

  const handleSelectProject = (project: Project) => {
    const storedSentences = segmentsByProjectId[project.id] ?? [];
    setCurrentProject(project);
    setCurrentSentences(storedSentences);
    setCurrentView('translation');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentProject(null);
    setCurrentSentences([]);
  };

  const handleViewAllProjects = () => {
    setCurrentView('allProjects');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {currentView === 'home' && (
        <Home
          onCreateProject={handleCreateProject}
          onViewAllProjects={handleViewAllProjects}
          projects={projects}
          isCreatingProject={isCreatingProject}
        />
      )}
      {currentView === 'allProjects' && (
        <AllProjects
          projects={projects}
          onBack={handleBackToHome}
          onSelectProject={handleSelectProject}
          isLoading={isLoadingProjects}
          error={projectsError}
          onRetry={fetchProjects}
        />
      )}
      {currentView === 'translation' && currentProject && (
        <TranslationInterface
          project={currentProject}
          sentences={currentSentences}
          onBack={handleBackToHome}
          onUpdateSentences={handleUpdateSentences}
        />
      )}
    </div>
  );
}
