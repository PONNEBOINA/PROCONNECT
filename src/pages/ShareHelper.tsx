import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Loader2, Copy, Check, Instagram, Linkedin, MessageCircle, ArrowLeft, Facebook, Twitter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GEMINI_API_KEY = 'AIzaSyA6Y5J2OF7ZVSiXcfF9E4hwdmDEOiIPquY';

interface GeneratedPost {
  platform: string;
  content: string;
}

export default function ShareHelper() {
  const [rawText, setRawText] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const extractJSON = (text: string): GeneratedPost[] => {
    if (!text) return [];
    
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    try {
      return JSON.parse(text);
    } catch (err) {
      console.log("JSON parse failed:", err);
      return [];
    }
  };

  const handleGenerate = async () => {
    if (!rawText.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your project',
        variant: 'destructive'
      });
      return;
    }

    if (platforms.length === 0) {
      toast({
        title: 'No Platforms Selected',
        description: 'Please select at least one platform',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setPosts([]);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert social media content writer.
Your task is to generate UNIQUE posts for each platform requested by the user.

User Input:
${rawText}

Platforms selected: ${platforms.join(", ")}

Follow these STRICT platform rules:

1. LinkedIn:
   - Professional tone
   - 5–8 lines
   - Insightful + value-driven
   - 2–4 hashtags at end

2. Twitter:
   - Max 280 characters
   - Short, punchy, bold
   - 1–2 relevant hashtags
   - No long sentences

3. Instagram:
   - Casual, friendly, emoji-rich
   - Short 2–3 lines caption
   - Add 4–8 trending hashtags

4. Facebook:
   - Conversational & community-focused
   - Easy language
   - 2–3 emojis max

RETURN STRICT JSON ONLY.
NO markdown, NO code blocks, NO explanation.

JSON FORMAT:
[
  { "platform":"LinkedIn", "content":"..." },
  { "platform":"Twitter", "content":"..." }
]

Generate ONLY for the platforms selected by the user.`
                  }
                ]
              }
            ]
          })
        }
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = extractJSON(text);
      
      setPosts(parsed);
      
      if (parsed.length > 0) {
        toast({
          title: 'Success!',
          description: `Generated ${parsed.length} post${parsed.length > 1 ? 's' : ''}`,
        });
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate posts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (content: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platform);
      toast({
        title: 'Copied!',
        description: `${platform} post copied to clipboard`,
      });
      setTimeout(() => setCopiedPlatform(null), 1400);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const fillSample = () => {
    setRawText('Name: ProConnect\nTech: React, Node.js, MongoDB, Express\nFeatures: Project sharing, social networking, AI chatbot, contests\nLink: https://proconnect.vercel.app');
  };

  const platformInfo: Record<string, { icon: any; name: string; color: string; bgColor: string; borderColor: string }> = {
    linkedin: {
      icon: Linkedin,
      name: 'LinkedIn',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-600'
    },
    twitter: {
      icon: Twitter,
      name: 'Twitter',
      color: 'text-sky-500',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-500'
    },
    instagram: {
      icon: Instagram,
      name: 'Instagram',
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-500'
    },
    facebook: {
      icon: Facebook,
      name: 'Facebook',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 pt-24">
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

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AI Social Post Generator
            </h1>
          </div>
          <p className="text-muted-foreground">Generate engaging posts for LinkedIn, Twitter, Instagram, and Facebook using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Input */}
          <Card className="animate-slide-up border-2">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>Describe your project and select platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Textarea */}
              <div className="space-y-2">
                <Label htmlFor="rawText" className="text-sm font-medium">Describe your project</Label>
                <Textarea
                  id="rawText"
                  placeholder="Name: My Project&#10;Tech: React, Node.js&#10;Features: Feature 1, Feature 2&#10;Link: https://myproject.com"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={8}
                  className="bg-background/50 border-2 focus:border-primary/50 transition-all resize-none font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fillSample}
                    className="text-xs"
                  >
                    Fill Sample
                  </Button>
                  <span className="text-xs text-muted-foreground">{platforms.length} platform{platforms.length !== 1 ? 's' : ''} selected</span>
                </div>
              </div>

              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Platforms</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(platformInfo) as Array<keyof typeof platformInfo>).map((p) => {
                    const info = platformInfo[p];
                    const Icon = info.icon;
                    const isSelected = platforms.includes(p);
                    return (
                      <label
                        key={p}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:scale-[1.02] ${
                          isSelected
                            ? `${info.bgColor} ${info.borderColor}`
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          value={p}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPlatforms([...platforms, p]);
                            } else {
                              setPlatforms(platforms.filter((x) => x !== p));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <Icon className={`w-5 h-5 ${isSelected ? info.color : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${isSelected ? info.color : 'text-muted-foreground'}`}>
                          {info.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={loading || !rawText.trim() || platforms.length === 0}
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
                    Generate with Gemini AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Preview */}
          <Card className="animate-slide-up border-2" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Generated posts will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {posts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No generated posts yet</p>
                    <p className="text-sm">Select platforms and click generate</p>
                  </div>
                ) : (
                  posts.map((post, index) => {
                    const platformKey = post.platform.toLowerCase();
                    const info = platformInfo[platformKey] || platformInfo.linkedin;
                    const Icon = info.icon;
                    return (
                      <Card
                        key={index}
                        className={`${info.bgColor} border-2 ${info.borderColor} animate-bounce-in`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-5 h-5 ${info.color}`} />
                              <CardTitle className={`text-lg ${info.color}`}>
                                {post.platform}
                              </CardTitle>
                              <span className="text-xs text-muted-foreground">
                                • {post.platform === 'Twitter' ? '280 char' : 'Post'}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="bg-background/50 rounded-lg p-3 border">
                            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopy(post.content, post.platform)}
                              className="gap-2"
                            >
                              {copiedPlatform === post.platform ? (
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
                            {copiedPlatform === post.platform && (
                              <span className="text-xs text-green-500">✓ Copied to clipboard</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
