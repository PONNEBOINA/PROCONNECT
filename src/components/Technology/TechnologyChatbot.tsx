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
    // Generate context-aware answers based on the technology and question
    const techInfo: Record<string, any> = {
      'React': {
        what: 'React is a JavaScript library for building user interfaces, developed by Facebook. It uses a component-based architecture and virtual DOM for efficient rendering.',
        why: 'React is in high demand with 40%+ of developers using it. It offers excellent job opportunities, has a massive ecosystem, and is backed by Meta. Companies like Netflix, Airbnb, and Instagram use React.',
        build: 'You can build single-page applications (SPAs), progressive web apps (PWAs), mobile apps with React Native, dashboards, e-commerce sites, social media platforms, and real-time applications.',
        difficulty: 'React has a moderate learning curve. If you know JavaScript, you can start building in 2-3 weeks. Mastering advanced concepts like hooks, context, and performance optimization takes 2-3 months of practice.'
      },
      'Node.js': {
        what: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on the server-side, enabling full-stack JavaScript development.',
        why: 'Node.js enables JavaScript developers to work on both frontend and backend. It\'s fast, scalable, and used by Netflix, LinkedIn, Uber, and PayPal. The npm ecosystem has over 1 million packages.',
        build: 'You can build REST APIs, GraphQL servers, real-time chat applications, streaming services, microservices, IoT applications, command-line tools, and backend services.',
        difficulty: 'If you know JavaScript, Node.js basics can be learned in 1-2 weeks. Building production-ready applications with Express, databases, and authentication takes 1-2 months of practice.'
      },
      'Python': {
        what: 'Python is a high-level, interpreted programming language known for its simplicity and readability. It\'s versatile and used in web development, data science, AI, and automation.',
        why: 'Python is the #1 language for beginners and professionals. It\'s used in AI/ML, data science, web development, and automation. Companies like Google, NASA, and Spotify use Python extensively.',
        build: 'You can build web applications with Django/Flask, data analysis tools, machine learning models, automation scripts, web scrapers, APIs, desktop applications, and scientific computing tools.',
        difficulty: 'Python is one of the easiest languages to learn. Basics can be learned in 1-2 weeks. Becoming proficient in frameworks and libraries takes 2-3 months of consistent practice.'
      },
      'MongoDB': {
        what: 'MongoDB is a NoSQL document database that stores data in flexible, JSON-like documents. It\'s designed for scalability and developer productivity.',
        why: 'MongoDB is perfect for modern applications with flexible schemas. It scales horizontally, handles big data well, and integrates seamlessly with Node.js. Used by eBay, Adobe, and Forbes.',
        build: 'You can build content management systems, real-time analytics platforms, mobile app backends, IoT data storage, e-commerce platforms, and social networks.',
        difficulty: 'MongoDB basics can be learned in 1 week if you know databases. Understanding indexing, aggregation, and replication takes 2-3 weeks of practice.'
      },
      'TypeScript': {
        what: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static typing, interfaces, and advanced features to JavaScript.',
        why: 'TypeScript catches errors before runtime, improves code quality, and enhances IDE support. It\'s used by Microsoft, Google, Airbnb, and Slack. 78% of developers prefer it over JavaScript.',
        build: 'You can build large-scale applications, enterprise software, React/Angular/Vue apps, Node.js backends, and any JavaScript project with better type safety.',
        difficulty: 'If you know JavaScript, TypeScript basics take 1-2 weeks. Understanding advanced types, generics, and decorators takes 1-2 months of practice.'
      }
    };

    const tech = techInfo[technology] || {
      what: `${technology} is a modern technology used in software development. It provides tools and features for building efficient applications.`,
      why: `${technology} is widely adopted in the industry with strong community support. Learning it opens up career opportunities and helps you build better applications.`,
      build: `With ${technology}, you can build various types of applications including web apps, mobile apps, and backend services depending on its use case.`,
      difficulty: `${technology} has a learning curve that varies based on your background. With consistent practice and good resources, most developers can become proficient in 2-3 months.`
    };

    // Match question type and return appropriate answer
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('what\'s')) {
      return tech.what;
    } else if (lowerQuestion.includes('why') || lowerQuestion.includes('should i learn')) {
      return tech.why;
    } else if (lowerQuestion.includes('build') || lowerQuestion.includes('create') || lowerQuestion.includes('make')) {
      return tech.build;
    } else if (lowerQuestion.includes('difficult') || lowerQuestion.includes('hard') || lowerQuestion.includes('easy') || lowerQuestion.includes('learn')) {
      return tech.difficulty;
    } else if (lowerQuestion.includes('salary') || lowerQuestion.includes('job') || lowerQuestion.includes('career')) {
      return `${technology} developers are in high demand. Entry-level positions typically start at $60-80k, mid-level at $90-120k, and senior positions can reach $150k+ depending on location and experience.`;
    } else if (lowerQuestion.includes('resource') || lowerQuestion.includes('tutorial') || lowerQuestion.includes('course')) {
      return `Great resources for learning ${technology} include official documentation, freeCodeCamp, Udemy courses, YouTube tutorials, and hands-on projects. Start with the official docs and build small projects to practice.`;
    } else if (lowerQuestion.includes('alternative') || lowerQuestion.includes('vs') || lowerQuestion.includes('compare')) {
      return `${technology} has its strengths and use cases. The best choice depends on your project requirements, team expertise, and specific needs. Research and compare based on performance, ecosystem, and community support.`;
    } else {
      // Generic answer for custom questions
      return `${technology} is a valuable technology to learn. ${tech.why} It's used by many companies and has a strong community. I recommend starting with the official documentation and building small projects to gain hands-on experience.`;
    }
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
