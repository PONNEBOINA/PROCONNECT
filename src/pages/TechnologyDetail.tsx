import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  BookOpen, 
  TrendingUp, 
  Users, 
  ExternalLink,
  Sparkles,
  Target,
  Zap,
  BarChart3
} from 'lucide-react';
import { technologiesAPI } from '@/services/api';

interface TechDetails {
  name: string;
  summary: string;
  why: string;
  difficulty: string;
  related: string[];
  docsUrl: string;
  stats: {
    totalProjects: number;
    monthlyProjects: number;
  };
  projects: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    owner: {
      _id: string;
      name: string;
      profilePicture?: string;
    };
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  }>;
}

const difficultyColors: Record<string, string> = {
  'Beginner': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Intermediate': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Advanced': 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function TechnologyDetail() {
  const { techName } = useParams<{ techName: string }>();
  const navigate = useNavigate();
  const [techDetails, setTechDetails] = useState<TechDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (techName) {
      loadTechDetails();
    }
  }, [techName]);

  const loadTechDetails = async () => {
    try {
      setLoading(true);
      const data = await technologiesAPI.getTechnologyDetails(techName!);
      setTechDetails(data);
    } catch (error) {
      console.error('Failed to load technology details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!techDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 pt-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Technology Not Found</h1>
          <Button onClick={() => navigate('/feed')}>
            <ArrowLeft className="mr-2" size={16} />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-16 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/feed')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to Feed
          </Button>
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Sparkles className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-bold text-white">{techDetails.name}</h1>
          </div>
          <p className="text-white/90 text-xl max-w-3xl">{techDetails.summary}</p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{techDetails.stats.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Used This Month</p>
                  <p className="text-2xl font-bold">{techDetails.stats.monthlyProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Target className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <Badge className={`${difficultyColors[techDetails.difficulty]} text-sm font-semibold mt-1`}>
                    {techDetails.difficulty}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Why Use This Technology */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Zap className="text-primary" size={24} />
              <CardTitle>Why Developers Use {techDetails.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground leading-relaxed">{techDetails.why}</p>
          </CardContent>
        </Card>

        {/* Related Technologies */}
        {techDetails.related.length > 0 && (
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="text-primary" size={24} />
                <CardTitle>Related Technologies</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {techDetails.related.map(relatedTech => (
                  <Badge
                    key={relatedTech}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 hover:scale-105 transition-all px-4 py-2 text-sm border-2"
                    onClick={() => navigate(`/tech/${encodeURIComponent(relatedTech)}`)}
                  >
                    {relatedTech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            size="lg"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => window.open(techDetails.docsUrl, '_blank')}
          >
            <BookOpen className="mr-2" size={20} />
            Learn This Technology
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="flex-1 border-2 hover:bg-primary/5"
            onClick={() => window.open(techDetails.docsUrl, '_blank')}
          >
            <ExternalLink className="mr-2" size={20} />
            Official Docs
          </Button>
        </div>

        {/* Projects Using This Technology */}
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="text-primary" size={24} />
                <CardTitle>Projects Using {techDetails.name}</CardTitle>
              </div>
              <Badge variant="secondary" className="text-sm">
                {techDetails.projects.length} {techDetails.projects.length === 1 ? 'project' : 'projects'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {techDetails.projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects using this technology yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Be the first to create one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {techDetails.projects.map(project => (
                  <Card 
                    key={project.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
                    onClick={() => navigate(`/user/${project.owner._id}`)}
                  >
                    {project.imageUrl && (
                      <div className="h-48 overflow-hidden rounded-t-lg">
                        <img 
                          src={project.imageUrl} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={project.owner.profilePicture} />
                            <AvatarFallback>{project.owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{project.owner.name}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <span>❤️ {project.likesCount}</span>
                          <span>💬 {project.commentsCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
