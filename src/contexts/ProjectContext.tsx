import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
}

interface ProjectContextType {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'createdAt'>) => void;
  deleteProject: (id: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  getFeedProjects: () => Project[];
  getUserProjects: (userId: string) => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    ownerId: '2',
    ownerName: 'Sarah Chen',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'AI Task Manager',
    description: 'A smart task management app with AI-powered prioritization',
    techStack: ['React', 'TypeScript', 'OpenAI', 'Tailwind'],
    githubUrl: 'https://github.com/example/ai-task-manager',
    projectUrl: 'https://ai-tasks.example.com',
    imageUrl: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800',
    visibility: 'public',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    ownerId: '3',
    ownerName: 'Mike Rodriguez',
    ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    title: 'ML Image Classifier',
    description: 'Deep learning model for image classification with 95% accuracy',
    techStack: ['Python', 'TensorFlow', 'Flask', 'React'],
    githubUrl: 'https://github.com/example/ml-classifier',
    projectUrl: 'https://ml-classifier.example.com',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    visibility: 'friends',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  useEffect(() => {
    const stored = localStorage.getItem('projectgram_projects');
    if (stored) {
      setProjects(JSON.parse(stored));
    }
  }, []);

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem('projectgram_projects', JSON.stringify(newProjects));
  };

  const addProject = (projectData: Omit<Project, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'createdAt'>) => {
    if (!user) return;

    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      ownerId: user.id,
      ownerName: user.name,
      ownerAvatar: user.avatarUrl,
      createdAt: new Date().toISOString()
    };

    saveProjects([newProject, ...projects]);
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    saveProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const getFeedProjects = () => {
    if (!user) return [];
    
    return projects.filter(p => {
      if (p.visibility === 'public') return true;
      if (p.ownerId === user.id) return true;
      if (p.visibility === 'friends' && user.friends.includes(p.ownerId)) return true;
      return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      getUserProjects
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
