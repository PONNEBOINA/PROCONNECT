import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Settings, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useSocial } from '@/contexts/SocialContext';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { AvatarUpload } from '@/components/Profile/AvatarUpload';
import { useState } from 'react';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { getUserProjects, deleteProject } = useProjects();
  const { getFriendsList } = useSocial();
  const navigate = useNavigate();
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatarUrl || '');

  const userProjects = user ? getUserProjects(user.id) : [];
  const friends = getFriendsList();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-20">
        <Card className="p-6 mb-8 animate-slide-up hover-lift bg-gradient-to-br from-card via-card to-primary/5 border-2">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <AvatarUpload 
              userId={user.id}
              avatarUrl={currentAvatar}
              name={user.name}
              onAvatarUpdate={(newAvatarUrl) => {
                setCurrentAvatar(newAvatarUrl);
                // Update the user context with the new avatar URL
                updateProfile({ avatarUrl: newAvatarUrl });
              }}
            />

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {user.name}
              </h1>
              <p className="text-muted-foreground mb-3 font-medium">{user.section}</p>
              {user.bio && (
                <p className="text-sm mb-4 px-4 py-2 bg-muted/50 rounded-lg inline-block">
                  {user.bio}
                </p>
              )}

              <div className="flex justify-center md:justify-start space-x-8 mb-6">
                <div className="text-center group cursor-default">
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                    {userProjects.length}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">Projects</p>
                </div>
                <Link to="/friends">
                  <div className="text-center group cursor-pointer">
                    <p className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">
                      {friends.length}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
                      Friends
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Link to="/settings">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group"
                  >
                    <Settings size={16} className="mr-2 transition-transform group-hover:rotate-90" />
                    Edit Profile
                  </Button>
                </Link>
                <Link to="/friends">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group"
                  >
                    <Users size={16} className="mr-2 transition-transform group-hover:scale-110" />
                    Friends
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all group"
                >
                  <LogOut size={16} className="mr-2 transition-transform group-hover:translate-x-0.5" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            My Projects
          </h2>
          {userProjects.length > 0 && (
            <div className="text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {userProjects.length} {userProjects.length === 1 ? 'project' : 'projects'}
            </div>
          )}
        </div>

        <div className="grid gap-8">
          {userProjects.length === 0 ? (
            <Card className="p-12 text-center animate-bounce-in bg-gradient-to-br from-card to-muted/30">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center animate-float">
                <Settings className="text-primary" size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">
                Start showcasing your amazing work to the world!
              </p>
              <Link to="/upload">
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all hover:scale-105">
                  <Settings size={16} className="mr-2" />
                  Upload Your First Project
                </Button>
              </Link>
            </Card>
          ) : (
            userProjects.map((project, index) => (
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
    </div>
  );
}
