import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { ProjectOfWeekCard } from '@/components/ProjectOfWeek/ProjectOfWeekCard';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSocial } from '@/contexts/SocialContext';
import { Plus, Sparkles, TrendingUp, Bell, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Feed() {
  const { getFeedProjects, deleteProject } = useProjects();
  const { user, users } = useAuth();
  const { notifications } = useSocial();
  const navigate = useNavigate();
  const feedProjects = getFeedProjects();
  
  const recentNotifications = notifications.slice(0, 3);
  const suggestedUsers = users.filter(u => u.id !== user?.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-12 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <Sparkles className="text-white animate-pulse" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Welcome to ProjectGram
            </h1>
            <Sparkles className="text-white animate-pulse" size={32} />
          </div>
          <p className="text-white/90 text-lg">Discover, share, and celebrate amazing student projects</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Main Feed */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0 w-full">
            {/* Project of the Week Card */}
            <div className="mb-6">
              <ProjectOfWeekCard />
            </div>

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
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 w-full space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            
            {/* User Profile Card */}
            <Card className="hover-lift overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-primary/10 to-accent/10 pb-12">
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg mb-3">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-bold text-lg">{user?.name}</h3>
                  {user?.section && (
                    <Badge variant="secondary" className="mt-1">
                      {user.section}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="w-full py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all hover:scale-[1.02]"
                >
                  View Profile
                </button>
              </CardContent>
            </Card>

            {/* Notifications Preview */}
            {recentNotifications.length > 0 && (
              <Card className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="text-primary" size={20} />
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </div>
                    <button 
                      onClick={() => navigate('/notifications')}
                      className="text-xs text-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentNotifications.map((notif) => (
                    <div key={notif.id} className="flex items-start space-x-2 text-sm">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notif.isRead ? 'bg-muted' : 'bg-primary animate-pulse'}`} />
                      <p className="text-muted-foreground line-clamp-2">{notif.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Suggested Users */}
            {suggestedUsers.length > 0 && (
              <Card className="hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="text-primary" size={20} />
                      <CardTitle className="text-lg">Discover Students</CardTitle>
                    </div>
                    <button 
                      onClick={() => navigate('/users')}
                      className="text-xs text-primary hover:underline"
                    >
                      View All
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {suggestedUsers.map((suggestedUser) => (
                    <div 
                      key={suggestedUser.id}
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => navigate(`/profile/${suggestedUser.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 group-hover:ring-2 group-hover:ring-primary transition-all">
                          <AvatarImage src={suggestedUser.avatarUrl} alt={suggestedUser.name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                            {suggestedUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">
                            {suggestedUser.name}
                          </p>
                          {suggestedUser.section && (
                            <p className="text-xs text-muted-foreground">{suggestedUser.section}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </main>

      <FloatingActionButton onClick={() => navigate('/upload')}>
        <Plus size={28} />
      </FloatingActionButton>
    </div>
  );
}
