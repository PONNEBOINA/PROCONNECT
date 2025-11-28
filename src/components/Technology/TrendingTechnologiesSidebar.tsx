import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Sparkles } from 'lucide-react';
import { technologiesAPI } from '@/services/api';
import { TechnologyChatbot } from './TechnologyChatbot';

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
  'Next.js', 'Tailwind CSS', 'Express', 'PostgreSQL', 'Docker',
  'Vue', 'Django', 'Firebase', 'GraphQL', 'Redis'
];

export function TrendingTechnologiesSidebar() {
  const [trending, setTrending] = useState<TrendingTech[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const data = await technologiesAPI.getAllTechnologies();
      
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
      
      setTrending(merged.slice(0, 15)); // Show top 15
    } catch (error) {
      console.error('Failed to load trending technologies:', error);
      // On error, show default technologies with 0 count
      setTrending(defaultTechnologies.map(name => ({ name, count: 0 })));
    } finally {
      setLoading(false);
    }
  };

  const handleTechClick = (techName: string) => {
    setSelectedTech(techName);
    setChatbotOpen(true);
  };

  if (loading) {
    return (
      <Card className="h-full border-2 shadow-lg animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 bg-muted rounded w-3/4"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full border-2 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
              <TrendingUp className="text-primary" size={20} />
            </div>
            <CardTitle className="text-lg">Trending Technologies</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Click to explore with AI guide
          </p>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
          {trending.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="mx-auto text-muted-foreground mb-3" size={32} />
              <p className="text-sm text-muted-foreground">No technologies yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload projects to see trending tech!
              </p>
            </div>
          ) : (
            trending.map((tech, index) => (
              <Badge
                key={tech.name}
                variant="outline"
                className={`${
                  techColors[index % techColors.length]
                } w-full justify-between cursor-pointer transition-all hover:scale-[1.02] px-4 py-3 text-sm font-medium border-2`}
                onClick={() => handleTechClick(tech.name)}
              >
                <span className="truncate">{tech.name}</span>
                <span className="ml-2 opacity-70 text-xs shrink-0">
                  {tech.count} {tech.count === 1 ? 'project' : 'projects'}
                </span>
              </Badge>
            ))
          )}
        </CardContent>
      </Card>

      {selectedTech && (
        <TechnologyChatbot
          isOpen={chatbotOpen}
          onClose={() => {
            setChatbotOpen(false);
            setSelectedTech(null);
          }}
          technology={selectedTech}
        />
      )}
    </>
  );
}
