import type { ShadowProject, KanbanCard } from './types';

const STORAGE_KEY = 'dreampath_projects';

export function getAllProjects(): ShadowProject[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getProjectById(id: string): ShadowProject | null {
  const projects = getAllProjects();
  return projects.find((p) => p.id === id) || null;
}

export function saveProject(project: ShadowProject): void {
  if (typeof window === 'undefined') return;
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.id === project.id);
  
  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function deleteProject(id: string): void {
  if (typeof window === 'undefined') return;
  const projects = getAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateKanbanCards(projectId: string, cards: KanbanCard[]): void {
  const project = getProjectById(projectId);
  if (!project) return;
  
  project.kanbanCards = cards;
  saveProject(project);
}

export function updateProjectStage(
  projectId: string,
  stage: 'planning' | 'design' | 'development' | 'deployment'
): void {
  const project = getProjectById(projectId);
  if (!project) return;
  
  project.stage = stage;
  saveProject(project);
}
