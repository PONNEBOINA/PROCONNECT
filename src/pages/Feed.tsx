import { Navbar } from '@/components/Layout/Navbar';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Feed() {
  const { getFeedProjects, deleteProject } = useProjects();
  const { user } = useAuth();
  const feedProjects = getFeedProjects();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Your Feed</h1>
          <p className="text-muted-foreground">Discover amazing student projects</p>
        </div>

        <div className="space-y-6">
          {feedProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <p className="text-sm text-muted-foreground">
                Upload your first project or connect with other students
              </p>
            </div>
          ) : (
            feedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
