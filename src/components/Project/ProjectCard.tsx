import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, MoreVertical, Heart, MessageCircle, Send, Award, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project } from '@/contexts/ProjectContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { projectsAPI, certificatesAPI, contestAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ProjectCardProps {
  project: Project;
  onDelete?: (id: string) => void;
  onUpdate?: () => void;
}

export const ProjectCard = ({ project: initialProject, onDelete, onUpdate }: ProjectCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState(initialProject);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [certificateExists, setCertificateExists] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [challengesData, setChallengesData] = useState({
    faced: project.challenges?.faced || '',
    learned: project.challenges?.learned || '',
    explored: project.challenges?.explored || ''
  });
  const [savingChallenges, setSavingChallenges] = useState(false);
  const [contestRegistration, setContestRegistration] = useState<any>(null);
  const [registeringForContest, setRegisteringForContest] = useState(false);
  const [contestCertificateEligibility, setContestCertificateEligibility] = useState<any>(null);
  const [generatingContestCert, setGeneratingContestCert] = useState(false);
  
  const isOwner = user?.id === project.ownerId;

  useEffect(() => {
    if (isOwner) {
      checkCertificate();
      checkContestRegistration();
      checkContestCertificateEligibility();
    }
  }, [isOwner, project.id]);

  const checkContestRegistration = async () => {
    try {
      const data = await contestAPI.checkRegistration(project.id);
      setContestRegistration(data);
    } catch (error) {
      console.error('Failed to check contest registration:', error);
    }
  };

  const checkContestCertificateEligibility = async () => {
    try {
      const data = await contestAPI.checkCertificateEligibility(project.id);
      setContestCertificateEligibility(data);
    } catch (error) {
      console.error('Failed to check contest certificate eligibility:', error);
    }
  };

  const checkCertificate = async () => {
    try {
      const result = await certificatesAPI.checkCertificate(project.id);
      setCertificateExists(result.exists);
    } catch (error) {
      console.error('Failed to check certificate:', error);
    }
  };

  const handleGenerateCertificate = async () => {
    setGeneratingCertificate(true);
    try {
      const result = await certificatesAPI.generateCertificate(project.id);
      setCertificateExists(true);
      toast({
        title: 'Certificate Generated!',
        description: 'Your certificate has been created successfully'
      });
      
      // Open preview in new tab
      const previewUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${result.certificateUrl}`;
      window.open(previewUrl, '_blank');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate certificate',
        variant: 'destructive'
      });
    } finally {
      setGeneratingCertificate(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const result = await certificatesAPI.checkCertificate(project.id);
      if (result.exists && result.certificateId) {
        const blob = await certificatesAPI.downloadCertificate(result.certificateId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result.certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: 'Downloaded!',
          description: 'Certificate downloaded successfully'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to download certificate',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    try {
      const result = await projectsAPI.likeProject(project.id);
      setProject({
        ...project,
        isLiked: result.liked,
        likesCount: result.likesCount
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to like project',
        variant: 'destructive'
      });
    }
  };

  const handleSaveChallenges = async () => {
    setSavingChallenges(true);
    try {
      await projectsAPI.updateChallenges(project.id, challengesData);
      
      // Update local project state with new challenges
      setProject({
        ...project,
        challenges: challengesData
      });
      
      // Notify parent to refresh project list
      if (onUpdate) {
        onUpdate();
      }
      
      toast({
        title: 'Success!',
        description: 'Challenges saved successfully'
      });
      setShowChallenges(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save challenges',
        variant: 'destructive'
      });
    } finally {
      setSavingChallenges(false);
    }
  };

  const handleRegisterForContest = async () => {
    setRegisteringForContest(true);
    try {
      await contestAPI.registerProject(project.id);
      toast({
        title: 'Success!',
        description: 'Your project has been registered for Project of the Week contest!'
      });
      await checkContestRegistration();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to register for contest',
        variant: 'destructive'
      });
    } finally {
      setRegisteringForContest(false);
    }
  };

  const handleGenerateContestCertificate = async () => {
    if (!contestCertificateEligibility) return;
    
    setGeneratingContestCert(true);
    try {
      const data = await contestAPI.generateContestCertificate(
        project.id,
        contestCertificateEligibility.certificateType,
        contestCertificateEligibility.weekNumber,
        contestCertificateEligibility.year
      );
      
      toast({
        title: 'Success!',
        description: `${contestCertificateEligibility.certificateType === 'winner' ? 'Winner' : 'Participant'} certificate generated!`
      });
      
      // Download the certificate
      const link = document.createElement('a');
      link.href = `http://localhost:5000${data.certificateUrl}`;
      link.download = `${data.certificateId}.pdf`;
      link.click();
      
      await checkContestCertificateEligibility();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate certificate',
        variant: 'destructive'
      });
    } finally {
      setGeneratingContestCert(false);
    }
  };

  const loadComments = async () => {
    if (comments.length > 0) return; // Already loaded
    
    setLoadingComments(true);
    try {
      const fetchedComments = await projectsAPI.getComments(project.id);
      setComments(fetchedComments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load comments',
        variant: 'destructive'
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleToggleComments = () => {
    if (!showComments) {
      loadComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await projectsAPI.addComment(project.id, commentText);
      setComments([...comments, newComment]);
      setCommentText('');
      setProject({
        ...project,
        commentsCount: (project.commentsCount || 0) + 1
      });
      toast({
        title: 'Comment added!',
        description: 'Your comment has been posted'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card className="overflow-hidden group hover-lift animate-slide-up bg-gradient-to-b from-card to-card/50 backdrop-blur-sm border-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <Link to={`/user/${project.ownerId}`} className="flex items-center space-x-2 group/header">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all group-hover/header:ring-primary/40 group-hover/header:scale-105">
            <AvatarImage src={project.ownerAvatar} />
            <AvatarFallback>{project.ownerName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm group-hover/header:text-primary transition-colors">{project.ownerName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</p>
          </div>
        </Link>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuItem
                onClick={() => onDelete?.(project.id)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Image - Reduced height for compact view */}
      <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <a 
            href={project.githubUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110"
          >
            <Github size={14} className="text-foreground" />
          </a>
          <a 
            href={project.projectUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center hover:scale-110 transition-transform"
          >
            <ExternalLink size={14} className="text-white" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h3 className="text-base font-bold mb-1 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{project.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech, index) => (
            <Badge 
              key={tech} 
              variant="secondary" 
              className="text-xs font-medium hover:bg-primary/20 hover:text-primary transition-all cursor-default animate-fade-in hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Reactions */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <button
            onClick={handleLike}
            className="flex items-center gap-1.5 hover:text-red-500 transition-colors group"
          >
            <Heart
              size={18}
              className={`transition-all ${
                project.isLiked
                  ? 'fill-red-500 text-red-500'
                  : 'group-hover:scale-110'
              }`}
            />
            <span className="text-sm font-medium">{project.likesCount || 0}</span>
          </button>
          
          <button
            onClick={handleToggleComments}
            className="flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{project.commentsCount || 0}</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="pt-3 border-t space-y-3">
            {loadingComments ? (
              <p className="text-sm text-muted-foreground text-center">Loading comments...</p>
            ) : (
              <>
                {comments.length > 0 && (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatarUrl} />
                          <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-2">
                          <p className="text-sm font-semibold">{comment.user.name}</p>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={submittingComment}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!commentText.trim() || submittingComment}
                    className="bg-gradient-to-r from-primary to-accent"
                  >
                    <Send size={16} />
                  </Button>
                </form>
              </>
            )}
          </div>
        )}

        <div className="flex space-x-2 pt-1">
          <Button
            size="sm"
            className="flex-1 bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/50 transition-all group/btn text-xs h-8"
            asChild
          >
            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} className="mr-1.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              Live Demo
            </a>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group/btn text-xs h-8"
            onClick={() => setShowChallenges(true)}
          >
            <Award size={14} className="mr-1.5 transition-transform group-hover/btn:scale-110" />
            Challenges
          </Button>
        </div>


      </div>

      {/* Challenges Dialog */}
      <Dialog open={showChallenges} onOpenChange={setShowChallenges}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="text-primary" />
              {isOwner ? 'Edit Project Challenges' : 'Project Challenges'}
            </DialogTitle>
            <DialogDescription>
              {isOwner 
                ? 'Share the challenges you faced and what you learned while building this project'
                : `Challenges faced by ${project.ownerName} while building this project`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {isOwner ? (
              // Owner Edit Form
              <>
                <div className="space-y-2">
                  <Label htmlFor="faced">Challenges Faced</Label>
                  <Textarea
                    id="faced"
                    placeholder="What challenges did you face while building this project?"
                    value={challengesData.faced}
                    onChange={(e) => setChallengesData({ ...challengesData, faced: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learned">What I Learned</Label>
                  <Textarea
                    id="learned"
                    placeholder="What did you learn from this project?"
                    value={challengesData.learned}
                    onChange={(e) => setChallengesData({ ...challengesData, learned: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explored">New Things Explored</Label>
                  <Textarea
                    id="explored"
                    placeholder="What new technologies or concepts did you explore?"
                    value={challengesData.explored}
                    onChange={(e) => setChallengesData({ ...challengesData, explored: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleSaveChallenges}
                  disabled={savingChallenges}
                  className="w-full"
                >
                  {savingChallenges ? 'Saving...' : 'Save Challenges'}
                </Button>
              </>
            ) : (
              // Read-only View for Others
              <>
                {project.challenges?.faced || project.challenges?.learned || project.challenges?.explored ? (
                  <>
                    {project.challenges.faced && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="text-red-500">🔥</span> Challenges Faced
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {project.challenges.faced}
                        </p>
                      </div>
                    )}

                    {project.challenges.learned && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="text-green-500">💡</span> What I Learned
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {project.challenges.learned}
                        </p>
                      </div>
                    )}

                    {project.challenges.explored && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <span className="text-blue-500">🚀</span> New Things Explored
                        </h4>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {project.challenges.explored}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Award className="mx-auto mb-4 text-muted-foreground" size={48} />
                    <p className="text-muted-foreground">No challenges have been shared yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
