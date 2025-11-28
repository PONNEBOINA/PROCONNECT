import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(name, email, password, section, isAdmin ? 'admin' : undefined);
      
      // Redirect based on role
      if (isAdmin) {
        toast({ title: 'Admin account created!', description: 'Redirecting to dashboard...' });
        navigate('/admin');
      } else {
        toast({ title: 'Account created!', description: 'Welcome to ProConnect.' });
        navigate('/feed');
      }
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'User already exists or invalid data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <Card className="w-full max-w-md animate-bounce-in relative hover-lift bg-card/80 backdrop-blur-xl border-2">
        <CardHeader className="space-y-1 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/30 animate-pulse-glow">
            <span className="text-white font-bold text-3xl">P</span>
          </div>
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-base">Join ProConnect to showcase your projects</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 bg-background/50 border-2 focus:border-accent/50 transition-all"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-background/50 border-2 focus:border-accent/50 transition-all"
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
                className="h-11 bg-background/50 border-2 focus:border-accent/50 transition-all"
              />
            </div>
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: '250ms' }}>
              <Label htmlFor="section" className="text-sm font-medium">Section</Label>
              <Input
                id="section"
                placeholder="CS-A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                required
                className="h-11 bg-background/50 border-2 focus:border-accent/50 transition-all"
              />
            </div>
            <div className="flex items-center space-x-2 animate-slide-up" style={{ animationDelay: '275ms' }}>
              <input
                type="checkbox"
                id="admin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-2 rounded focus:ring-2 focus:ring-primary cursor-pointer"
              />
              <Label htmlFor="admin" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                Register as Admin
                <span className="text-xs text-muted-foreground">(Only one admin allowed)</span>
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-accent via-accent to-primary hover:shadow-xl hover:shadow-accent/50 transition-all hover:scale-[1.02] animate-slide-up font-semibold text-base"
              style={{ animationDelay: '300ms' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2">⏳</span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm animate-fade-in" style={{ animationDelay: '400ms' }}>
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary font-semibold hover:underline hover:text-accent transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
