import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2, Share2 } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends'>('public');
  const [loading, setLoading] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [suggestedDescription, setSuggestedDescription] = useState('');
  const [challengesFaced, setChallengesFaced] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [thingsExplored, setThingsExplored] = useState('');

  const { addProject } = useProjects();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };

  const handleGenerateDescription = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a project title first',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingDescription(true);
    setSuggestedDescription('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { title, techStack }
      });

      if (error) throw error;

      if (data?.suggestedDescription) {
        setSuggestedDescription(data.suggestedDescription);
        toast({
          title: 'Success!',
          description: 'AI-generated description is ready',
        });
      }
    } catch (error: any) {
      console.error('Description generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Failed to generate description. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleUseSuggestion = () => {
    setDescription(suggestedDescription);
    setSuggestedDescription('');
    toast({
      title: 'Description Applied',
      description: 'The AI-generated description has been added',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      addProject({
        title,
        description,
        techStack,
        githubUrl,
        projectUrl,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        visibility,
        challenges: {
          faced: challengesFaced,
          learned: whatLearned,
          explored: thingsExplored
        }
      });

      toast({ title: 'Success!', description: 'Project uploaded successfully.' });
      navigate('/feed');
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24 space-y-6">
        {/* Share Helper Section */}
        <Card className="animate-slide-up hover-lift border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary animate-pulse" />
              <CardTitle className="text-xl">📤 Share Helper</CardTitle>
            </div>
            <CardDescription>
              Generate a perfect description to share your project on Instagram, LinkedIn, WhatsApp and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 h-11 border-2 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30"
                    onClick={() => window.location.href = '/share-helper'}
                  >
                    <Share2 className="w-4 h-4" />
                    Generate Social Media Post
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs text-center">
                  <p>Generate AI-powered description for sharing on social media</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>

        {/* Upload Form */}
        <Card className="animate-slide-up hover-lift border-2 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Upload New Project
            </CardTitle>
            <CardDescription className="text-base">Share your amazing work with the community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '50ms' }}>
                <Label htmlFor="title" className="text-sm font-medium">Project Title</Label>
                <Input
                  id="title"
                  placeholder="AI Task Manager"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={generatingDescription || !title.trim()}
                    className="group hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                  >
                    {generatingDescription ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                
                {suggestedDescription && (
                  <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 animate-bounce-in">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="text-primary h-4 w-4" />
                        <p className="text-sm font-medium text-primary">AI Suggestion</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSuggestedDescription('')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-foreground mb-3">{suggestedDescription}</p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleUseSuggestion}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30"
                    >
                      Use This Description
                    </Button>
                  </Card>
                )}

                <Textarea
                  id="description"
                  placeholder="A smart task management app with AI-powered prioritization..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="bg-background/50 border-2 focus:border-primary/50 transition-all resize-none"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
                <Label htmlFor="techStack" className="text-sm font-medium">Tech Stack</Label>
                <div className="flex space-x-2">
                  <Input
                    id="techStack"
                    placeholder="React, TypeScript, etc."
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAddTech} 
                    variant="outline"
                    className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {techStack.map((tech, index) => (
                    <Badge 
                      key={tech} 
                      variant="secondary" 
                      className="pl-3 pr-2 py-1.5 hover:bg-primary/20 hover:text-primary transition-all cursor-default animate-bounce-in group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-2 hover:text-destructive transition-colors"
                      >
                        <X size={14} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
                <Label htmlFor="githubUrl" className="text-sm font-medium">GitHub URL</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '250ms' }}>
                <Label htmlFor="projectUrl" className="text-sm font-medium">Live Project URL</Label>
                <Input
                  id="projectUrl"
                  type="url"
                  placeholder="https://myproject.com"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  required
                  className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <Label htmlFor="imageUrl" className="text-sm font-medium">Project Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2 animate-slide-up" style={{ animationDelay: '350ms' }}>
                <Label htmlFor="visibility" className="text-sm font-medium">Visibility</Label>
                <Select value={visibility} onValueChange={(v) => setVisibility(v as any)}>
                  <SelectTrigger className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="animate-scale-in">
                    <SelectItem value="public">Public (Everyone can see)</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Challenges Section */}
              <div className="space-y-4 pt-4 border-t animate-slide-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-primary" size={20} />
                  <h3 className="text-lg font-semibold">Project Challenges (Optional)</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Share your journey! What challenges did you face and what did you learn?
                </p>

                <div className="space-y-2">
                  <Label htmlFor="challengesFaced" className="text-sm font-medium">Challenges Faced</Label>
                  <Textarea
                    id="challengesFaced"
                    placeholder="What challenges did you face while building this project?"
                    value={challengesFaced}
                    onChange={(e) => setChallengesFaced(e.target.value)}
                    className="min-h-[80px] bg-background/50 border-2 focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatLearned" className="text-sm font-medium">What I Learned</Label>
                  <Textarea
                    id="whatLearned"
                    placeholder="What did you learn from this project?"
                    value={whatLearned}
                    onChange={(e) => setWhatLearned(e.target.value)}
                    className="min-h-[80px] bg-background/50 border-2 focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thingsExplored" className="text-sm font-medium">New Things Explored</Label>
                  <Textarea
                    id="thingsExplored"
                    placeholder="What new technologies or concepts did you explore?"
                    value={thingsExplored}
                    onChange={(e) => setThingsExplored(e.target.value)}
                    className="min-h-[80px] bg-background/50 border-2 focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-[1.02] animate-slide-up font-semibold text-base"
                style={{ animationDelay: '400ms' }}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⏳</span>
                    Uploading...
                  </span>
                ) : (
                  'Upload Project'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
