import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useProjects } from '@/contexts/ProjectContext';
import { useToast } from '@/hooks/use-toast';
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
        visibility
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
      <main className="max-w-2xl mx-auto px-4 pt-20">
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
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
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
