import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Feed() {
  const { getFeedProjects, deleteProject } = useProjects();
  const { user } = useAuth();
  const navigate = useNavigate();
  const feedProjects = getFeedProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Your Feed
            </h1>
            <Sparkles className="text-primary animate-pulse" size={24} />
          </div>
          <p className="text-muted-foreground">Discover amazing student projects from your community</p>
        </div>

        <div className="space-y-8">
          {feedProjects.length === 0 ? (
            <Card className="text-center py-16 px-6 animate-bounce-in bg-gradient-to-br from-card to-muted/30">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-float">
                <Sparkles className="text-primary" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your amazing work!
              </p>
              <button 
                onClick={() => navigate('/upload')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105"
              >
                Upload Your First Project
              </button>
            </Card>
          ) : (
            feedProjects.map((project, index) => (
              <div 
                key={project.id}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard
                  project={project}
                  onDelete={deleteProject}
                />
              </div>
            ))
          )}
        </div>
      </main>

      <FloatingActionButton onClick={() => navigate('/upload')}>
        <Plus size={28} />
      </FloatingActionButton>
    </div>
  );
}
