import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      
      // Check if user is admin and redirect accordingly
      if (userData?.role === 'admin') {
        toast({ title: 'Welcome back, Admin!', description: 'Redirecting to dashboard...' });
        navigate('/admin');
      } else {
        toast({ title: 'Welcome back!', description: 'Successfully logged in.' });
        navigate('/feed');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Invalid email or password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <Card className="w-full max-w-md animate-bounce-in relative hover-lift bg-card/80 backdrop-blur-xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30 animate-pulse-glow">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">Sign in to continue to ProConnect</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-background/50 border-2 focus:border-primary/50 transition-all"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-primary via-primary to-accent hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-[1.02] animate-slide-up font-semibold text-base"
              style={{ animationDelay: '300ms' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/register" className="text-primary font-semibold hover:underline hover:text-accent transition-colors">
              Sign up
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-muted/50 to-primary/5 rounded-xl text-xs text-muted-foreground border border-border/50 animate-fade-in" style={{ animationDelay: '500ms' }}>
            <p className="font-semibold mb-2 text-foreground">✨ Demo credentials:</p>
            <p className="font-mono">alex@example.com / any password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
