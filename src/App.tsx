import { useEffect, useMemo, useState } from 'react';
import { Home } from './components/Home';
import { TranslationInterface } from './components/TranslationInterface';
import { AllProjects } from './components/AllProjects';
import { Settings } from './components/Settings';
import { TranslationService } from './services/TranslationService';
import { loadProjects, loadSegments, saveProjects, saveSegments } from './services/projectStorage';
import type { NewProjectPayload, Project, Sentence } from './types/translation';

const translationService = new TranslationService();

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'translation' | 'allProjects' | 'settings'>(
    'home',
  );
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentSentences, setCurrentSentences] = useState<Sentence[]>([]);
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [segmentsByProjectId, setSegmentsByProjectId] = useState<Record<string, Sentence[]>>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  useEffect(() => {
    setSegmentsByProjectId((prev) => {
      const next = { ...prev };
      projects.forEach((project) => {
        if (!next[project.id]) {
          next[project.id] = loadSegments(project);
        }
      });
      return next;
    });
  }, [projects]);

  const projectStats = useMemo(() => {
    return projects.reduce<Record<string, { total: number; translated: number }>>((acc, project) => {
      const sentences = segmentsByProjectId[project.id] ?? [];
      const translated = sentences.filter((sentence) => sentence.translation).length;
      acc[project.id] = { total: sentences.length, translated };
      return acc;
    }, {});
  }, [projects, segmentsByProjectId]);

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

      const sentences = await translationService.requestTranslation({
        document: payload.document,
        sourceLanguage: payload.sourceLanguage,
        destinationLanguage: payload.destinationLanguage,
        termBase: payload.termBase,
      });

      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      saveSegments(newProject, sentences);
      setSegmentsByProjectId((prev) => ({ ...prev, [newProject.id]: sentences }));
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

    const updatedProject = {
      ...currentProject,
      lastEdit: new Date().toISOString(),
    };

    const updatedProjects = projects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project,
    );

    setCurrentProject(updatedProject);
    setProjects(updatedProjects);
    saveProjects(updatedProjects);

    setCurrentSentences(sentences);
    setSegmentsByProjectId((prev) => ({ ...prev, [updatedProject.id]: sentences }));
    saveSegments(updatedProject, sentences);
  };

  const handleSelectProject = (project: Project) => {
    const storedSentences = segmentsByProjectId[project.id] ?? loadSegments(project);
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

  const handleViewSettings = () => {
    setCurrentView('settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {currentView === 'home' && (
        <Home 
          onCreateProject={handleCreateProject}
          onViewAllProjects={handleViewAllProjects}
          onViewSettings={handleViewSettings}
          projects={projects}
          isCreatingProject={isCreatingProject}
        />
      )}
      {currentView === 'allProjects' && (
        <AllProjects
          projects={projects}
          projectStats={projectStats}
          onBack={handleBackToHome}
          onSelectProject={handleSelectProject}
        />
      )}
      {currentView === 'settings' && (
        <Settings onBack={handleBackToHome} />
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
