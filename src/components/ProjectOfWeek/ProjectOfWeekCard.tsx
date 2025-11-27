import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, ExternalLink, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';

export const ProjectOfWeekCard = () => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const [projectOfWeek, setProjectOfWeek] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjectOfWeek = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
          .from('project_of_the_week')
          .select('*')
          .lte('week_start', today)
          .gte('week_end', today)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching project of week:', error);
          return;
        }

        if (data) {
          // Find the project from local storage
          const project = projects.find(p => p.id === data.project_id);
          setProjectOfWeek({ ...data, project });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectOfWeek();
  }, [projects]);

  if (loading || !projectOfWeek?.project) {
    return null;
  }

  const isWinner = user?.id === projectOfWeek.project.ownerId;

  return (
    <Card className={`animate-slide-up border-2 ${isWinner ? 'bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-orange-500/10 border-yellow-500/50' : 'bg-gradient-to-br from-primary/10 via-card to-accent/5 border-primary/30'}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Trophy className={`w-6 h-6 ${isWinner ? 'text-yellow-500 animate-pulse' : 'text-primary'}`} />
          <div className="flex-1">
            <CardTitle className="text-2xl">
              {isWinner ? '🎉 Congratulations! Your project was selected as Project of the Week!' : 'Project of the Week 🎉'}
            </CardTitle>
            <CardDescription className="mt-1">
              {isWinner ? projectOfWeek.message_for_winner : 'Check out this week\'s featured project'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-primary/50 text-primary">
            Top Project
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative group">
          <img
            src={projectOfWeek.project.imageUrl}
            alt={projectOfWeek.project.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>

        <div>
          <h3 className="text-xl font-bold mb-2">{projectOfWeek.project.title}</h3>
          <p className="text-muted-foreground mb-3">{projectOfWeek.project.description}</p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {projectOfWeek.project.techStack.map((tech: string) => (
              <Badge key={tech} variant="secondary">{tech}</Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(projectOfWeek.project.githubUrl, '_blank')}
            >
              <Github className="w-4 h-4" />
              Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(projectOfWeek.project.projectUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              Live Demo
            </Button>
          </div>
        </div>

        {!isWinner && (
          <div className="pt-3 border-t flex items-center gap-2">
            <span className="text-sm text-muted-foreground">By:</span>
            <span className="text-sm font-medium">{projectOfWeek.project.ownerName}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
