import { useEffect, useState } from 'react';
import { insightsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Heart, MessageCircle, Users, Code, Trophy } from 'lucide-react';

interface InsightsData {
  totalProjects: number;
  totalLikes: number;
  totalComments: number;
  friendsCount: number;
  distinctTechStack: string[];
  mostUsedTech: string | null;
  topProject: {
    title: string;
    likes: number;
    comments: number;
  } | null;
}

interface InsightsProps {
  userId: string;
}

export default function Insights({ userId }: InsightsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userId]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await insightsAPI.getUserInsights(userId);
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading insights...</div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Failed to load insights</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects Posted</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalLikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friends</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.friendsCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Technologies Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.distinctTechStack.length > 0 ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {insights.distinctTechStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                {insights.mostUsedTech && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Most Used:</p>
                    <p className="text-lg font-semibold">{insights.mostUsedTech}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No technologies used yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.topProject ? (
              <div className="space-y-2">
                <p className="text-lg font-semibold">{insights.topProject.title}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {insights.topProject.likes} likes
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {insights.topProject.comments} comments
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No projects yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
