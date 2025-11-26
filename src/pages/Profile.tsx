import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Settings, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useSocial } from '@/contexts/SocialContext';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getUserProjects, deleteProject } = useProjects();
  const { getFriendsList } = useSocial();
  const navigate = useNavigate();

  const userProjects = user ? getUserProjects(user.id) : [];
  const friends = getFriendsList();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-20">
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
              <p className="text-muted-foreground mb-3">{user.section}</p>
              {user.bio && <p className="text-sm mb-4">{user.bio}</p>}

              <div className="flex justify-center md:justify-start space-x-8 mb-4">
                <div>
                  <p className="text-2xl font-bold">{userProjects.length}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <Link to="/friends">
                  <div className="cursor-pointer hover:opacity-80">
                    <p className="text-2xl font-bold">{friends.length}</p>
                    <p className="text-xs text-muted-foreground">Friends</p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Link to="/settings">
                  <Button variant="outline" size="sm">
                    <Settings size={16} className="mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/friends">
                  <Button variant="outline" size="sm">
                    <Users size={16} className="mr-2" />
                    Friends
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-4">
          <h2 className="text-xl font-bold">My Projects</h2>
        </div>

        <div className="grid gap-6">
          {userProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No projects yet</p>
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  Upload Your First Project
                </Button>
              </Link>
            </Card>
          ) : (
            userProjects.map((project) => (
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
