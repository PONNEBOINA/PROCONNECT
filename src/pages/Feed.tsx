import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { ProjectOfWeekCard } from '@/components/ProjectOfWeek/ProjectOfWeekCard';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useProjects } from '@/contexts/ProjectContext';
import { Plus, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Feed() {
  const { getFeedProjects, deleteProject, loadFeedProjects } = useProjects();
  const navigate = useNavigate();
  const feedProjects = getFeedProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-12 animate-slide-down mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Sparkles className="text-white animate-pulse" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Welcome to ProConnect
            </h1>
            <Sparkles className="text-white animate-pulse" size={32} />
          </div>
          <p className="text-white/90 text-lg">Discover, share, and celebrate amazing student projects</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 pt-8">
        {/* Project of the Week */}
        <div className="mb-8">
          <ProjectOfWeekCard />
        </div>

        {/* Latest Projects Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="text-primary" size={24} />
            <h2 className="text-2xl font-bold">Latest Projects</h2>
          </div>
          <p className="text-muted-foreground">Fresh work from your community</p>
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
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard
                  project={project}
                  onDelete={deleteProject}
                  onUpdate={loadFeedProjects}
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
