import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { projectsAPI } from '../services/api';

export interface Project {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  projectUrl: string;
  imageUrl: string;
  visibility: 'public' | 'friends';
  createdAt: string;
  likes?: string[];
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  challenges?: {
    faced: string;
    learned: string;
    explored: string;
  };
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'createdAt'>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  getFeedProjects: () => Project[];
  getUserProjects: (userId: string) => Project[];
  loadFeedProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (user) {
      loadFeedProjects();
    }
  }, [user]);

  const loadFeedProjects = async () => {
    try {
      const feedProjects = await projectsAPI.getFeedProjects();
      setProjects(feedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'createdAt'>) => {
    if (!user) return;

    try {
      const newProject = await projectsAPI.createProject(projectData);
      setProjects([newProject, ...projects]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsAPI.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectsAPI.updateProject(id, updates);
      setProjects(projects.map(p => p.id === id ? updatedProject : p));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const getFeedProjects = () => {
    return projects;
  };

  const getUserProjects = (userId: string) => {
    return projects.filter(p => p.ownerId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      addProject,
      deleteProject,
      updateProject,
      getFeedProjects,
      getUserProjects,
      loadFeedProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectProvider');
  }
  return context;
};
