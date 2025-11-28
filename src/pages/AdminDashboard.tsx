import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContestManagement } from '@/components/Admin/ContestManagement';
import { 
  Users, FolderKanban, Award, TrendingUp, Activity, 
  Sparkles, Eye, Heart, MessageCircle,
  BarChart3, Calendar, Shield, AlertTriangle, Trophy,
  CheckCircle, XCircle, AlertCircle, Ban, ExternalLink, Github
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [powHistory, setPowHistory] = useState<any[]>([]);
  const [userAwards, setUserAwards] = useState<any[]>([]);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [currentPOW, setCurrentPOW] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [suggesting, setSuggesting] = useState(false);
  const [growthData, setGrowthData] = useState({ userGrowth: 0, projectGrowth: 0, engagementRate: 0 });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Admin access required',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [stats, projectsData, powData, reportsData, historyData, awardsData] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getAllProjects(),
        adminAPI.getCurrentProjectOfWeek(),
        adminAPI.getReports(),
        adminAPI.getPOWHistory(),
        adminAPI.getUserAwards()
      ]);
      
      setDashboardStats(stats);
      setProjects(projectsData);
      setCurrentPOW(powData.active ? powData : null);
      setReports(reportsData);
      setPowHistory(historyData);
      setUserAwards(awardsData);
      
      // Calculate growth data
      const totalLikes = projectsData.reduce((sum: number, p: any) => sum + p.likesCount, 0);
      const totalComments = projectsData.reduce((sum: number, p: any) => sum + p.commentsCount, 0);
      const engagementRate = projectsData.length > 0 
        ? parseFloat(((totalLikes + totalComments) / projectsData.length).toFixed(1))
        : 0;
      
      setGrowthData({
        userGrowth: 12.5, // Mock data - can be enhanced
        projectGrowth: 8.3, // Mock data - can be enhanced
        engagementRate
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggest = async () => {
    try {
      setSuggesting(true);
      const result = await adminAPI.suggestProjectOfWeek();
      setSuggestion(result);
      toast({ title: 'AI suggestion generated!' });
    } catch (error: any) {
      toast({ 
        title: 'Failed to generate suggestion', 
        description: error.response?.data?.message || 'No projects available',
        variant: 'destructive' 
      });
    } finally {
      setSuggesting(false);
    }
  };

  const handleApprove = async () => {
    if (!suggestion) return;
    
    try {
      await adminAPI.approveProjectOfWeek(suggestion.projectId, suggestion.reason, suggestion.score);
      toast({ title: 'Project of the Week approved!', description: 'Shared with all users' });
      setSuggestion(null);
      loadData();
    } catch (error) {
      toast({ title: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await adminAPI.resolveReport(reportId, action);
      toast({ title: 'Report resolved', description: `Action: ${action}` });
      loadData();
    } catch (error) {
      toast({ title: 'Failed to resolve report', variant: 'destructive' });
    }
  };

  if (loading || !dashboardStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Admin Dashboard</h1>
              <p className="text-white/60 text-sm">Welcome back, {user?.name}</p>
            </div>
          </div>
          <Button 
            onClick={logout}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
          >
            Logout
          </Button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users size={20} />
              </div>
              <p className="text-2xl font-bold">{dashboardStats.totalUsers}</p>
              <p className="text-xs text-white/80">Total Users</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Ban size={20} />
              </div>
              <p className="text-2xl font-bold">{dashboardStats.suspendedUsers}</p>
              <p className="text-xs text-white/80">Suspended</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FolderKanban size={20} />
              </div>
              <p className="text-2xl font-bold">{dashboardStats.totalProjects}</p>
              <p className="text-xs text-white/80">Total Projects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle size={20} />
              </div>
              <p className="text-2xl font-bold">{dashboardStats.pendingReports}</p>
              <p className="text-xs text-white/80">Pending Reports</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-0 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Trophy size={20} />
              </div>
              <p className="text-2xl font-bold">{dashboardStats.totalAwards}</p>
              <p className="text-xs text-white/80">POW Awards</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Users */}
        {dashboardStats.topUsers.length > 0 && (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Trophy size={20} className="text-amber-400" />
                Top Performing Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                {dashboardStats.topUsers.map((user: any, index: number) => (
                  <div key={user._id} className="flex-1 bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                    <p className="text-white font-semibold">{user.name}</p>
                    <p className="text-white/60 text-sm">{user.wins} wins</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">Overview</TabsTrigger>
            <TabsTrigger value="contest" className="data-[state=active]:bg-white/20">
              <Trophy size={16} className="mr-1" />
              Contest
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-white/20">
              Reports {reports.length > 0 && `(${reports.length})`}
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white/20">POW History</TabsTrigger>
            <TabsTrigger value="awards" className="data-[state=active]:bg-white/20">User Awards</TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-white/20">AI Picker</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Feed - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FolderKanban size={20} />
                  All Projects Feed
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Project Preview */}
                        <div className="w-32 h-32 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          {project.imageUrl ? (
                            <img 
                              src={project.imageUrl} 
                              alt={project.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Eye className="text-white/40" size={32} />
                          )}
                        </div>
                        
                        {/* Project Details */}
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{project.title}</h3>
                          <p className="text-white/60 text-sm mb-2 line-clamp-2">{project.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            {project.techStack.slice(0, 3).map((tech: string) => (
                              <span key={tech} className="px-2 py-1 bg-purple-500/20 text-purple-200 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {project.owner.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {project.likesCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle size={14} />
                              {project.commentsCount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(project.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {project.projectUrl && (
                              <a 
                                href={project.projectUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-xs rounded-lg transition-all"
                              >
                                <ExternalLink size={14} />
                                Live Demo
                              </a>
                            )}
                            {project.githubUrl && (
                              <a 
                                href={project.githubUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg transition-all border border-white/20"
                              >
                                <Github size={14} />
                                GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Current POW */}
            {currentPOW && (
              <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award size={20} className="text-amber-400" />
                    Current POW
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white font-bold mb-1">{currentPOW.project.title}</p>
                  <p className="text-white/60 text-sm mb-2">By: {currentPOW.project.owner.name}</p>
                  <p className="text-white/80 text-xs">
                    Expires: {new Date(currentPOW.expiresAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* AI Suggestion */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles size={20} />
                  AI Project Picker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSuggest} 
                  disabled={suggesting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 mb-4"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {suggesting ? 'Analyzing...' : 'Generate AI Suggestion'}
                </Button>

                {suggestion && (
                  <div className="space-y-4">
                    {/* Preview */}
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      {suggestion.imageUrl ? (
                        <img 
                          src={suggestion.imageUrl} 
                          alt={suggestion.title}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded mb-3 flex items-center justify-center">
                          <Eye className="text-white/40" size={32} />
                        </div>
                      )}
                      
                      <p className="text-white font-bold mb-1">{suggestion.title}</p>
                      <p className="text-white/60 text-sm mb-2">By: {suggestion.ownerName}</p>
                      
                      <div className="bg-black/20 rounded p-2 mb-3">
                        <p className="text-xs text-white/80 font-semibold mb-1">AI Score: {suggestion.score}</p>
                        <div className="text-xs text-white/60 space-y-0.5">
                          <p>• Likes: {suggestion.breakdown.likes}</p>
                          <p>• Comments: {suggestion.breakdown.comments}</p>
                          <p>• Recency: {suggestion.breakdown.recency}</p>
                          <p>• Tech: {suggestion.breakdown.techStack}</p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-white/70 mb-3">{suggestion.reason}</p>
                      
                      <Button 
                        onClick={handleApprove} 
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0"
                      >
                        <Award className="mr-2 h-4 w-4" />
                        Approve & Share
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity size={20} />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">User Growth</span>
                    <span className="text-green-400">+{growthData.userGrowth}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: `${growthData.userGrowth * 5}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">Project Activity</span>
                    <span className="text-blue-400">+{growthData.projectGrowth}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: `${growthData.projectGrowth * 5}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">Engagement Rate</span>
                    <span className="text-purple-400">{growthData.engagementRate}/project</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
          </TabsContent>

          {/* Contest Management Tab */}
          <TabsContent value="contest">
            <ContestManagement />
          </TabsContent>

        </Tabs>
      </main>
    </div>
  );
}
