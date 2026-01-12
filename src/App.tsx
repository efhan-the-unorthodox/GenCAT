import { useState } from 'react';
import { Home } from './components/Home';
import { TranslationInterface } from './components/TranslationInterface';
import { AllProjects } from './components/AllProjects';

export interface Project {
  id: string;
  name: string;
  sourceLanguage: string;
  destinationLanguage: string;
  documentName?: string;
  termBaseName?: string;
  lastEdit: string;
  sentences: Array<{
    id: string;
    sourceText: string;
    translation?: string;
    isComplete?: boolean;
  }>;
}

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'translation' | 'allProjects'>('home');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const handleCreateProject = (project: Project) => {
    setProjects([...projects, project]);
    setCurrentProject(project);
    setCurrentView('translation');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCurrentProject(null);
  };

  const handleViewAllProjects = () => {
    setCurrentView('allProjects');
  };

  const handleSelectProject = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('translation');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50">
      {currentView === 'home' && (
        <Home 
          onCreateProject={handleCreateProject}
          onViewAllProjects={handleViewAllProjects}
          projects={projects}
        />
      )}
      {currentView === 'allProjects' && (
        <AllProjects
          projects={projects}
          onBack={handleBackToHome}
          onSelectProject={handleSelectProject}
        />
      )}
      {currentView === 'translation' && currentProject && (
        <TranslationInterface 
          project={currentProject}
          onBack={handleBackToHome}
          onUpdateProject={(updatedProject) => {
            setCurrentProject(updatedProject);
            setProjects(projects.map(p => 
              p.id === updatedProject.id ? updatedProject : p
            ));
          }}
        />
      )}
    </div>
  );
}