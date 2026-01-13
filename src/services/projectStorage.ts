import type { Project, Sentence } from '../types/translation';
import projectsSeed from '../projects/projects.json';

const PROJECTS_STORAGE_KEY = 'fanee.projects';
const SEGMENTS_STORAGE_PREFIX = 'fanee.segments.';

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const getSegmentsFileName = (project: Project) => {
  const timestamp = Number.isNaN(Date.parse(project.dateCreated))
    ? Date.now()
    : Date.parse(project.dateCreated);
  return `${project.name}_${timestamp}.json`;
};

export const loadProjects = (): Project[] => {
  if (hasStorage()) {
    const stored = window.localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as Project[];
      } catch {
        return projectsSeed as Project[];
      }
    }
  }

  return projectsSeed as Project[];
};

export const saveProjects = (projects: Project[]) => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
};

export const loadSegments = (project: Project): Sentence[] => {
  if (!hasStorage()) {
    return [];
  }

  const stored = window.localStorage.getItem(`${SEGMENTS_STORAGE_PREFIX}${getSegmentsFileName(project)}`);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Sentence[];
  } catch {
    return [];
  }
};

export const saveSegments = (project: Project, sentences: Sentence[]) => {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(
    `${SEGMENTS_STORAGE_PREFIX}${getSegmentsFileName(project)}`,
    JSON.stringify(sentences),
  );
};
