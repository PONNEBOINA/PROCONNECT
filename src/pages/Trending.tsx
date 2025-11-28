import { Navbar } from '@/components/Layout/Navbar';
import { TrendingTechnologiesSidebar } from '@/components/Technology/TrendingTechnologiesSidebar';
import { Sparkles, TrendingUp } from 'lucide-react';

export default function Trending() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-12 animate-slide-down mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <TrendingUp className="text-white animate-pulse" size={32} />
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Trending Technologies
            </h1>
            <Sparkles className="text-white animate-pulse" size={32} />
          </div>
          <p className="text-white/90 text-lg">Discover what's hot in the developer community</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <p className="text-muted-foreground text-center">
            Click any technology to explore with our AI guide and discover projects using it
          </p>
        </div>

        {/* Full-width Trending Technologies */}
        <TrendingTechnologiesSidebar />
      </main>
    </div>
  );
}
