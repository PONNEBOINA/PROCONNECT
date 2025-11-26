import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useProjects } from '@/contexts/ProjectContext';
import { ProjectCard } from '@/components/Project/ProjectCard';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { getUserProjects } = useProjects();

  const allUsers = JSON.parse(localStorage.getItem('projectgram_all_users') || '[]');
  const viewedUser = allUsers.find((u: any) => u.id === userId);
  const userProjects = userId ? getUserProjects(userId) : [];

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-20">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">User not found</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-20">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={viewedUser.avatarUrl} />
              <AvatarFallback className="text-2xl">{viewedUser.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">{viewedUser.name}</h1>
              <p className="text-muted-foreground mb-3">{viewedUser.section}</p>
              {viewedUser.bio && <p className="text-sm mb-4">{viewedUser.bio}</p>}

              <div className="flex justify-center md:justify-start space-x-8">
                <div>
                  <p className="text-2xl font-bold">{userProjects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{viewedUser.friends?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Friends</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-4">
          <h2 className="text-xl font-bold">Projects</h2>
        </div>

        <div className="grid gap-6">
          {userProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No projects yet</p>
            </Card>
          ) : (
            userProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
