import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Layout/Navbar';
import { useProjects } from '@/contexts/ProjectContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Sparkles, Loader2, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [message, setMessage] = useState('Congratulations on your amazing project!');
  const [loading, setLoading] = useState(false);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin access.",
        variant: "destructive"
      });
      navigate('/feed');
    }
  }, [isAdmin, adminLoading, navigate, toast]);

  const handleAiRecommend = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-recommend-project', {
        body: { projects }
      });

      if (error) throw error;

      setAiRecommendation(data);
      setSelectedProject(data.recommendedProjectId);
      toast({
        title: "AI Recommendation Ready",
        description: "Check the highlighted project below"
      });
    } catch (error) {
      console.error('Error getting AI recommendation:', error);
      toast({
        title: "Error",
        description: "Failed to get AI recommendation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWinner = async () => {
    if (!selectedProject) {
      toast({
        title: "No Project Selected",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }

    setSelecting(true);
    try {
      const { error } = await supabase.functions.invoke('select-project-winner', {
        body: {
          projectId: selectedProject,
          messageForWinner: message
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Project of the Week has been selected"
      });
      
      setSelectedProject(null);
      setAiRecommendation(null);
      setMessage('Congratulations on your amazing project!');
    } catch (error) {
      console.error('Error selecting winner:', error);
      toast({
        title: "Error",
        description: "Failed to select winner",
        variant: "destructive"
      });
    } finally {
      setSelecting(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 pt-20 space-y-6">
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
                <CardDescription>Select Project of the Week</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Button
                onClick={handleAiRecommend}
                disabled={loading || projects.length === 0}
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Recommend Using AI
              </Button>
            </div>

            {aiRecommendation && (
              <Card className="bg-accent/30 border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{aiRecommendation.explanation}</p>
                </CardContent>
              </Card>
            )}

            {selectedProject && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Message for Winner</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a congratulatory message..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleSelectWinner}
                  disabled={selecting}
                  className="gap-2"
                >
                  {selecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4" />
                  )}
                  Select as Project of the Week
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Projects</h2>
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card
                key={project.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedProject === project.id
                    ? 'border-2 border-primary bg-primary/5'
                    : 'border hover:border-primary/50'
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">By: {project.ownerName}</p>
                        </div>
                        {selectedProject === project.id && (
                          <Badge className="bg-primary">Selected</Badge>
                        )}
                      </div>
                      <p className="text-sm">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.techStack.map((tech) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
