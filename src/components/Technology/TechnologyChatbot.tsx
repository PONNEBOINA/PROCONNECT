import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, ExternalLink, Users, Loader2 } from 'lucide-react';

interface TechnologyChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  technology: string;
}

interface Question {
  id: number;
  question: string;
  answer: string | null;
  loading: boolean;
}

export function TechnologyChatbot({ isOpen, onClose, technology: initialTechnology }: TechnologyChatbotProps) {
  const navigate = useNavigate();
  const [technology, setTechnology] = useState(initialTechnology);
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, question: `What is ${technology}?`, answer: null, loading: false },
    { id: 2, question: `Why should I learn ${technology}?`, answer: null, loading: false },
    { id: 3, question: `What can I build with ${technology}?`, answer: null, loading: false },
    { id: 4, question: `How difficult is ${technology} to learn?`, answer: null, loading: false },
  ]);

  // Related technologies based on the selected tech
  const getRelatedTechs = (tech: string) => {
    const relatedMap: Record<string, string[]> = {
      'React': ['Next.js', 'Redux', 'TypeScript', 'Tailwind CSS'],
      'Node.js': ['Express', 'MongoDB', 'TypeScript', 'Socket.io'],
      'MongoDB': ['Mongoose', 'Node.js', 'Express', 'Redis'],
      'TypeScript': ['React', 'Node.js', 'Angular', 'Next.js'],
      'Python': ['Django', 'Flask', 'FastAPI', 'NumPy'],
      'Next.js': ['React', 'TypeScript', 'Vercel', 'Tailwind CSS'],
      'Vue': ['Nuxt.js', 'Vuex', 'TypeScript', 'Tailwind CSS'],
      'Angular': ['TypeScript', 'RxJS', 'NgRx', 'Material UI'],
      'Django': ['Python', 'PostgreSQL', 'REST', 'Celery'],
      'Express': ['Node.js', 'MongoDB', 'JWT', 'Passport'],
      'PostgreSQL': ['SQL', 'Node.js', 'Prisma', 'Redis'],
      'Docker': ['Kubernetes', 'Docker Compose', 'CI/CD', 'Linux'],
      'Tailwind CSS': ['React', 'Next.js', 'Vue', 'PostCSS'],
    };
    return relatedMap[tech] || ['React', 'Node.js', 'TypeScript', 'MongoDB'];
  };

  const generateAnswer = async (question: string, questionId?: number) => {
    // Simulate AI response with technology-specific answers
    const answers: Record<string, string> = {
      [`What is ${technology}?`]: `${technology} is a powerful technology used by developers worldwide. It provides a robust set of features for building modern applications with efficiency and scalability.`,
      [`Why should I learn ${technology}?`]: `Learning ${technology} opens up numerous opportunities in web development. It's widely adopted by companies, has a strong community, and offers excellent career prospects.`,
      [`What can I build with ${technology}?`]: `With ${technology}, you can build web applications, mobile apps, APIs, real-time applications, and much more. The possibilities are endless!`,
      [`How difficult is ${technology} to learn?`]: `${technology} has a moderate learning curve. With dedication and practice, most developers can become proficient within a few months. The community support is excellent!`,
    };

    return answers[question] || `${technology} is an excellent technology for modern development. It offers great features, strong community support, and is used by many successful companies worldwide.`;
  };

  const handleGenerateAnswer = async (questionId: number) => {
    setQuestions(prev =>
      prev.map(q => (q.id === questionId ? { ...q, loading: true } : q))
    );

    setTimeout(async () => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const answer = await generateAnswer(question.question, questionId);
        setQuestions(prev =>
          prev.map(q => (q.id === questionId ? { ...q, answer, loading: false } : q))
        );
      }
    }, 1000);
  };

  const handleGenerateCustomAnswer = async () => {
    if (!customQuestion.trim()) return;

    setCustomLoading(true);
    setTimeout(async () => {
      const answer = await generateAnswer(customQuestion);
      setCustomAnswer(answer);
      setCustomLoading(false);
    }, 1000);
  };

  const handleSwitchTechnology = (newTech: string) => {
    // Reset all states when switching technology
    setTechnology(newTech);
    setCustomQuestion('');
    setCustomAnswer(null);
    setCustomLoading(false);
    setQuestions([
      { id: 1, question: `What is ${newTech}?`, answer: null, loading: false },
      { id: 2, question: `Why should I learn ${newTech}?`, answer: null, loading: false },
      { id: 3, question: `What can I build with ${newTech}?`, answer: null, loading: false },
      { id: 4, question: `How difficult is ${newTech} to learn?`, answer: null, loading: false },
    ]);
  };

  const relatedTechs = getRelatedTechs(technology);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            Technology Explorer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Predefined Questions */}
          {questions.map((q) => (
            <Card key={q.id} className="p-4 border-2">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-sm flex-1">{q.question}</p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerateAnswer(q.id)}
                    disabled={q.loading || q.answer !== null}
                    className="shrink-0"
                  >
                    {q.loading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Sparkles size={16} />
                    )}
                    <span className="ml-1">AI</span>
                  </Button>
                </div>
                {q.answer && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">{q.answer}</p>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {/* Custom Question */}
          <Card className="p-4 border-2 border-accent/50">
            <div className="space-y-3">
              <p className="font-medium text-sm">Have any other doubts?</p>
              <Textarea
                placeholder="Ask your question here..."
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                size="sm"
                onClick={handleGenerateCustomAnswer}
                disabled={customLoading || !customQuestion.trim()}
                className="w-full"
              >
                {customLoading ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : (
                  <Sparkles className="mr-2" size={16} />
                )}
                Generate Answer
              </Button>
              {customAnswer && (
                <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">{customAnswer}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Related Technologies */}
          <Card className="p-4 border-2">
            <div className="flex items-center gap-2 mb-3">
              <Users className="text-primary" size={18} />
              <h3 className="font-semibold">Related Technologies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {relatedTechs.map((tech) => (
                <Badge
                  key={tech}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleSwitchTechnology(tech)}
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={() => {
                onClose();
                navigate(`/tech/${encodeURIComponent(technology)}`);
              }}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:shadow-lg"
            >
              <BookOpen className="mr-2" size={18} />
              Learn
            </Button>
            <Button
              onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(technology)}+documentation`, '_blank')}
              variant="outline"
              className="border-2"
            >
              <ExternalLink className="mr-2" size={18} />
              Official
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
