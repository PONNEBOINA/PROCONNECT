import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';
import { technologiesAPI } from '@/services/api';

interface TrendingTech {
  name: string;
  count: number;
}

const techColors = [
  'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
  'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
  'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20',
  'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20',
  'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-pink-500/20',
  'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-500/20',
  'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20',
  'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20',
  'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20',
  'bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20',
];

// Default technologies to always show (even with 0 projects)
const defaultTechnologies = [
  'React', 'Node.js', 'TypeScript', 'MongoDB', 'Python',
  'Next.js', 'Tailwind CSS', 'Express', 'PostgreSQL', 'Docker'
];

export function TrendingTechnologies() {
  const [trending, setTrending] = useState<TrendingTech[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const data = await technologiesAPI.getTrending();
      
      // Create a map of real technologies with their counts
      const techMap = new Map(data.map(tech => [tech.name, tech.count]));
      
      // Separate new technologies (not in default list) and default technologies
      const newTechs = data.filter(tech => !defaultTechnologies.includes(tech.name));
      const defaultTechs = defaultTechnologies.map(name => ({
        name,
        count: techMap.get(name) || 0
      }));
      
      // Merge: new technologies first (sorted by count), then default technologies
      const merged = [...newTechs.sort((a, b) => b.count - a.count), ...defaultTechs];
      
      setTrending(merged.slice(0, 10)); // Show top 10
    } catch (error) {
      console.error('Failed to load trending technologies:', error);
      // On error, show default technologies with 0 count
      setTrending(defaultTechnologies.map(name => ({ name, count: 0 })));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-8 animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 bg-muted rounded-full"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-2 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
            <TrendingUp className="text-primary" size={20} />
          </div>
          <CardTitle className="text-xl flex items-center gap-2">
            Trending Technologies This Week
            <Sparkles className="text-accent animate-pulse" size={18} />
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Explore what's hot in the community right now
        </p>
      </CardHeader>
      <CardContent>
        {trending.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No trending technologies yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload projects with tech stacks to see them here!
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trending.map((tech, index) => (
              <Badge
                key={tech.name}
                variant="outline"
                className={`${techColors[index % techColors.length]} cursor-pointer transition-all hover:scale-105 px-4 py-2 text-sm font-medium border-2`}
                onClick={() => navigate(`/tech/${encodeURIComponent(tech.name)}`)}
              >
                {tech.name}
                <span className="ml-2 opacity-70 text-xs">({tech.count})</span>
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
