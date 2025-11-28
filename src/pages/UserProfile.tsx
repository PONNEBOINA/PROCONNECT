import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { useProjects } from '@/contexts/ProjectContext';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { FriendRequestButton } from '@/components/FriendRequestButton';
import { usersAPI, projectsAPI } from '@/services/api';

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [viewedUser, setViewedUser] = useState<any>(null);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [user, projects] = await Promise.all([
        usersAPI.getUserProfile(userId!),
        projectsAPI.getUserProjects(userId!)
      ]);
      setViewedUser(user);
      setUserProjects(projects);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-20">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </Card>
        </main>
      </div>
    );
  }

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{viewedUser.name}</h1>
                  <p className="text-muted-foreground">{viewedUser.section}</p>
                </div>
                <div className="mt-3 md:mt-0">
                  <FriendRequestButton userId={viewedUser.id} />
                </div>
              </div>
              {viewedUser.bio && <p className="text-sm mb-4">{viewedUser.bio}</p>}

              <div className="flex justify-center md:justify-start space-x-8">
                <div>
                  <p className="text-2xl font-bold">{userProjects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{viewedUser.friendsCount || 0}</p>
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
