import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { contestAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, Sparkles, ExternalLink, Trash2, Award, 
  TrendingUp, Heart, MessageCircle, Calendar 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const ContestManagement = () => {
  const { toast } = useToast();
  const [contestants, setContestants] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  useEffect(() => {
    loadContestants();
  }, []);

  const loadContestants = async () => {
    setLoading(true);
    try {
      const data = await contestAPI.getContestants();
      setContestants(data.contestants);
    } catch (error: any) {
      console.error('Failed to load contestants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveContestant = async (contestantId: string) => {
    try {
      await contestAPI.removeContestant(contestantId);
      toast({
        title: 'Success',
        description: 'Contestant removed from contest'
      });
      loadContestants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove contestant',
        variant: 'destructive'
      });
    }
  };

  const handleAIPick = async () => {
    setSuggesting(true);
    try {
      const data = await contestAPI.aiPick();
      setAiSuggestion(data.suggestion);
      setShowApprovalDialog(true);
      toast({
        title: 'AI Selection Complete',
        description: `Selected "${data.suggestion.title}" with score ${data.suggestion.score}`
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to get AI suggestion',
        variant: 'destructive'
      });
    } finally {
      setSuggesting(false);
    }
  };

  const handleApprove = async () => {
    if (!aiSuggestion) return;
    
    setApproving(true);
    try {
      await contestAPI.approveWinner(
        aiSuggestion.projectId,
        aiSuggestion.reason,
        aiSuggestion.score
      );
      toast({
        title: 'Success!',
        description: 'Project of the Week has been announced!'
      });
      setShowApprovalDialog(false);
      setAiSuggestion(null);
      loadContestants();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to approve winner',
        variant: 'destructive'
      });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-yellow-500" />
                Contest Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage weekly contest and select Project of the Week
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadContestants}
                variant="outline"
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                onClick={handleAIPick}
                disabled={suggesting || contestants.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="mr-2" size={16} />
                {suggesting ? 'Analyzing...' : 'AI Pick Winner'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading contestants...
            </div>
          ) : contestants.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto text-muted-foreground mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">No Contestants Yet</h3>
              <p className="text-muted-foreground">
                Students can register their projects on Sundays
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  {contestants.length} project{contestants.length !== 1 ? 's' : ''} competing this week
                </p>
              </div>
              
              {contestants.map((contestant) => (
                <Card key={contestant.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {contestant.project.imageUrl && (
                        <img
                          src={contestant.project.imageUrl}
                          alt={contestant.project.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-lg">{contestant.project.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              by {contestant.project.owner.name}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveContestant(contestant.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        
                        <p className="text-sm mb-3 line-clamp-2">
                          {contestant.project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {contestant.project.techStack?.slice(0, 4).map((tech: string) => (
                            <Badge key={tech} variant="secondary">{tech}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart size={14} />
                            {contestant.project.likesCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={14} />
                            {contestant.project.commentsCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(contestant.registeredAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="text-purple-500" />
              AI Recommendation
            </DialogTitle>
            <DialogDescription>
              Review and approve the AI-selected Project of the Week
            </DialogDescription>
          </DialogHeader>
          
          {aiSuggestion && (
            <div className="space-y-4">
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="text-yellow-500" size={32} />
                    <div>
                      <h3 className="text-2xl font-bold">{aiSuggestion.title}</h3>
                      <p className="text-muted-foreground">by {aiSuggestion.ownerName}</p>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-4">
                    <p className="font-semibold mb-2">AI Reasoning:</p>
                    <p className="text-sm">{aiSuggestion.reason}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Score Breakdown:</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Likes:</span>
                          <span className="font-medium">{aiSuggestion.breakdown.likes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Comments:</span>
                          <span className="font-medium">{aiSuggestion.breakdown.comments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tech Stack:</span>
                          <span className="font-medium">{aiSuggestion.breakdown.techStack}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Description:</span>
                          <span className="font-medium">{aiSuggestion.breakdown.description}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1 font-bold">
                          <span>Total:</span>
                          <span>{aiSuggestion.score}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Tech Stack:</p>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestion.techStack?.slice(0, 6).map((tech: string) => (
                          <Badge key={tech} variant="secondary">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={approving}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Award className="mr-2" size={16} />
                      {approving ? 'Approving...' : 'Approve as Project of the Week'}
                    </Button>
                    <Button
                      onClick={() => setShowApprovalDialog(false)}
                      variant="outline"
                      disabled={approving}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
