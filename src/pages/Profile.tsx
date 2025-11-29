import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, LogOut, Users, Award, Download, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { useSocial } from '@/contexts/SocialContext';
import { ProjectCard } from '@/components/Project/ProjectCard';
import { useNavigate } from 'react-router-dom';
import { AvatarUpload } from '@/components/Profile/AvatarUpload';
import { AvatarPreviewModal } from '@/components/Profile/AvatarPreviewModal';
import { useState, useEffect } from 'react';
import { certificatesAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import Insights from './Insights';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { getUserProjects, deleteProject, loadFeedProjects } = useProjects();
  const { getFriendsList } = useSocial();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAvatar, setCurrentAvatar] = useState(user?.avatarUrl || '');
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

  const userProjects = user ? getUserProjects(user.id) : [];
  const friendsCount = user?.friendsCount || 0;

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    setLoadingCertificates(true);
    try {
      const certs = await certificatesAPI.getMyCertificates();
      setCertificates(certs);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    } finally {
      setLoadingCertificates(false);
    }
  };

  const handleDownloadCertificate = async (certificateId: string) => {
    try {
      const blob = await certificatesAPI.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Downloaded!',
        description: 'Certificate downloaded successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 pt-24">
        <Card className="p-6 mb-8 animate-slide-up hover-lift bg-gradient-to-br from-card via-card to-primary/5 border-2">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="relative group/avatar">
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
              {currentAvatar && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAvatarPreviewOpen(true);
                  }}
                  className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-110 z-10"
                  aria-label="View profile picture"
                  title="View full size"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              )}
            </div>

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
                      {friendsCount}
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

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="friends">Friends</TabsTrigger>
            <TabsTrigger value="insights">
              <BarChart3 size={16} className="mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="certificates">
              <Award size={16} className="mr-2" />
              Certificates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects">
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
                      onUpdate={loadFeedProjects}
                    />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <Card className="p-8 text-center">
              <Users className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-xl font-bold mb-2">Friends List</h3>
              <p className="text-muted-foreground mb-4">
                You have {friendsCount} friend{friendsCount !== 1 ? 's' : ''}
              </p>
              <Link to="/friends">
                <Button>View All Friends</Button>
              </Link>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Insights userId={user.id} />
          </TabsContent>

          <TabsContent value="certificates">
            <div className="grid gap-4">
              {loadingCertificates ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Loading certificates...</p>
                </Card>
              ) : certificates.length === 0 ? (
                <Card className="p-12 text-center animate-bounce-in bg-gradient-to-br from-card to-muted/30">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl flex items-center justify-center animate-float">
                    <Award className="text-amber-500" size={40} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No certificates yet</h3>
                  <p className="text-muted-foreground">
                    Generate certificates for your projects to showcase your achievements!
                  </p>
                </Card>
              ) : (
                certificates.map((cert) => (
                  <Card key={cert.id} className="p-4 hover-lift">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                        <Award className="text-amber-500" size={32} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{cert.projectTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          Certificate ID: {cert.certificateId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Generated: {new Date(cert.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDownloadCertificate(cert.certificateId)}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Avatar Preview Modal */}
      <AvatarPreviewModal
        isOpen={isAvatarPreviewOpen}
        onClose={() => setIsAvatarPreviewOpen(false)}
        avatarUrl={currentAvatar}
        userName={user.name}
      />
    </div>
  );
}
