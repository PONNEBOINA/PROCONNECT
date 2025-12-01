import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2, Copy, Check, Instagram, Linkedin, MessageCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function ShareHelper() {
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'linkedin' | 'whatsapp'>('instagram');
  const [generatedPost, setGeneratedPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleGenerate = async () => {
    if (!projectTitle.trim() || !projectDescription.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please provide project title and description',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setGeneratedPost('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/social-media/generate`,
        {
          projectTitle,
          projectDescription,
          projectUrl,
          techStack,
          platform
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data?.post) {
        setGeneratedPost(response.data.post);
        toast({
          title: 'Success!',
          description: 'Social media post generated successfully',
        });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Failed to generate post. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const platformInfo = {
    instagram: {
      icon: Instagram,
      name: 'Instagram',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/30'
    },
    linkedin: {
      icon: Linkedin,
      name: 'LinkedIn',
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      borderColor: 'border-blue-600/30'
    },
    whatsapp: {
      icon: MessageCircle,
      name: 'WhatsApp',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/upload')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Upload
          </Button>
        </div>

        <Card className="animate-slide-up hover-lift border-2 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Social Media Post Generator
              </CardTitle>
            </div>
            <CardDescription className="text-base">
              Generate engaging posts for Instagram, LinkedIn, and WhatsApp using AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Platform</Label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(platformInfo) as Array<keyof typeof platformInfo>).map((p) => {
                  const info = platformInfo[p];
                  const Icon = info.icon;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlatform(p)}
                      className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                        platform === p
                          ? `${info.bgColor} ${info.borderColor} ${info.color}`
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${platform === p ? info.color : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-medium ${platform === p ? info.color : 'text-muted-foreground'}`}>
                        {info.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="projectTitle" className="text-sm font-medium">Project Title</Label>
              <Input
                id="projectTitle"
                placeholder="My Awesome Project"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="text-sm font-medium">Project Description</Label>
              <Textarea
                id="projectDescription"
                placeholder="Describe what your project does and what makes it special..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={4}
                className="bg-background/50 border-2 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Project URL */}
            <div className="space-y-2">
              <Label htmlFor="projectUrl" className="text-sm font-medium">Project URL</Label>
              <Input
                id="projectUrl"
                type="url"
                placeholder="https://myproject.com or https://myproject.vercel.app"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Tech Stack */}
            <div className="space-y-2">
              <Label htmlFor="techStack" className="text-sm font-medium">Tech Stack (Optional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="techStack"
                  placeholder="React, Node.js, etc."
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

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-[1.02] font-semibold text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Post
                </>
              )}
            </Button>

            {/* Generated Post */}
            {generatedPost && (
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 animate-bounce-in">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="text-primary h-5 w-5" />
                    <p className="text-sm font-medium text-primary">Generated Post</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border">
                  <p className="text-sm whitespace-pre-wrap">{generatedPost}</p>
                </div>
              </Card>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
