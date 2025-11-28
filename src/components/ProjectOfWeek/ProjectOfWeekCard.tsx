import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { projectOfWeekAPI, contestAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Award, ExternalLink, Github, Clock, Heart, MessageCircle, Download, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectOfWeekCard() {
  const { user } = useAuth();
  const [powData, setPowData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const [certificateEligibility, setCertificateEligibility] = useState<any>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  useEffect(() => {
    loadProjectOfWeek();
  }, []);

  useEffect(() => {
    if (powData?.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const expiry = new Date(powData.expiresAt).getTime();
        const distance = expiry - now;

        if (distance < 0) {
          setTimeLeft('Expired');
          clearInterval(timer);
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [powData]);

  useEffect(() => {
    if (powData?.active && powData?.project?.id && user) {
      checkCertificateEligibility();
    }
  }, [powData, user]);

  const loadProjectOfWeek = async () => {
    try {
      setLoading(true);
      const data = await projectOfWeekAPI.getCurrent();
      setPowData(data);
    } catch (error) {
      console.error('Failed to load Project of the Week:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCertificateEligibility = async () => {
    try {
      const eligibility = await contestAPI.checkCertificateEligibility(powData.project.id);
      setCertificateEligibility(eligibility);
    } catch (error) {
      console.error('Failed to check certificate eligibility:', error);
    }
  };

  const handlePreviewCertificate = async () => {
    if (!powData?.project?.id) return;

    try {
      setDownloadingCert(true);
      const weekNumber = getWeekNumber();
      const year = new Date().getFullYear();
      
      const response = await contestAPI.generateContestCertificate(
        powData.project.id,
        'winner',
        weekNumber,
        year
      );

      // Open certificate in new tab
      // Remove /api from the URL since certificateUrl is a full path
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const previewUrl = `${baseUrl}${response.certificateUrl}`;
      window.open(previewUrl, '_blank');
    } catch (error: any) {
      console.error('Failed to preview certificate:', error);
      alert(error.response?.data?.message || 'Failed to preview certificate');
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!powData?.project?.id) return;

    try {
      setDownloadingCert(true);
      const weekNumber = getWeekNumber();
      const year = new Date().getFullYear();
      
      const response = await contestAPI.generateContestCertificate(
        powData.project.id,
        'winner',
        weekNumber,
        year
      );

      // Download the certificate
      // Remove /api from the URL since certificateUrl is a full path
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
      const link = document.createElement('a');
      link.href = `${baseUrl}${response.certificateUrl}`;
      link.download = `${response.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      console.error('Failed to download certificate:', error);
      alert(error.response?.data?.message || 'Failed to download certificate');
    } finally {
      setDownloadingCert(false);
    }
  };

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-96 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // Case A: No active project - show countdown
  if (!powData?.active) {
    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(23, 59, 59, 999);

    return (
      <Card className="border-2 border-dashed border-primary/50 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Clock className="text-primary animate-pulse" size={48} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Project of the Week</h3>
          <p className="text-muted-foreground mb-4">
            Will be revealed on {nextSunday.toLocaleDateString()}
          </p>
          <div className="inline-block px-6 py-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Countdown</p>
            <p className="text-2xl font-mono font-bold">{timeLeft || 'Coming Soon'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Case B: Active project - show unified premium award card
  const weekNumber = getWeekNumber();
  const isWinner = user?.id === powData.project.owner.id;
  const isParticipant = certificateEligibility?.eligible && certificateEligibility?.certificateType === 'participant';

  return (
    <div>
      {/* Premium Award Card */}
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950">
        {/* Diagonal Ribbon */}
        <div className="absolute top-8 -right-16 z-10">
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white px-20 py-2.5 rotate-45 shadow-xl">
            <p className="text-xs font-bold tracking-wider whitespace-nowrap">PROJECT OF THE WEEK</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400"></div>
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-orange-300/20 rounded-full blur-3xl"></div>

        <CardContent className="relative p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <Award className="text-amber-600 dark:text-amber-400 animate-pulse" size={28} />
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 dark:from-amber-400 dark:via-yellow-400 dark:to-orange-400 bg-clip-text text-transparent">
                🎉 Project of the Week
              </h2>
              <Award className="text-amber-600 dark:text-amber-400 animate-pulse" size={28} />
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1 text-sm font-semibold">
              Week {weekNumber}
            </Badge>
          </div>

          {/* Greeting Message */}
          {isWinner ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 border-2 border-amber-400 dark:border-amber-600 rounded-xl">
              <p className="text-center font-bold text-amber-900 dark:text-amber-100 flex items-center justify-center gap-2 text-lg">
                <Trophy className="text-amber-600" size={24} />
                🎉 Congratulations! Your project has been selected as the Project of the Week!
              </p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-white/60 dark:bg-black/30 border border-amber-300 dark:border-amber-700 rounded-xl">
              <h3 className="text-center font-bold text-gray-900 dark:text-white text-xl mb-1">
                🏆 Project of the Week: {powData.project.title}
              </h3>
              <p className="text-center text-gray-700 dark:text-gray-300 text-sm">
                This project has been awarded Project of the Week.
              </p>
            </div>
          )}

          {/* Main Content Container */}
          <div className="bg-white/80 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <Link to={`/user/${powData.project.owner.id}`}>
                <Avatar className="h-10 w-10 border-3 border-amber-400 shadow-lg ring-2 ring-amber-200 dark:ring-amber-800">
                  <AvatarImage src={powData.project.owner.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-400 text-white font-bold">
                    {powData.project.owner.name[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                  {powData.project.title}
                </h3>
                <Link 
                  to={`/user/${powData.project.owner.id}`} 
                  className="text-xs text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-medium"
                >
                  by {powData.project.owner.name}
                </Link>
              </div>
            </div>

            {/* Row Layout: Image + Content */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Project Image - Left Side */}
              {powData.project.imageUrl && (
                <div className="md:w-2/5 rounded-lg overflow-hidden shadow-lg border-2 border-amber-200/50 dark:border-amber-800/50 flex-shrink-0">
                  <img 
                    src={powData.project.imageUrl} 
                    alt={powData.project.title}
                    className="w-full h-40 md:h-32 object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}

              {/* Description + Tech Stack - Right Side */}
              <div className="flex-1 flex flex-col justify-between">
                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm mb-3 line-clamp-3">
                  {powData.project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5">
                  {powData.project.techStack.map((tech: string) => (
                    <Badge 
                      key={tech} 
                      className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 text-xs"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-amber-200 dark:border-amber-800">
              {/* Stats */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <Heart className="text-red-500" size={16} fill="currentColor" />
                  <span className="font-semibold">{powData.project.likesCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <MessageCircle className="text-blue-500" size={16} />
                  <span className="font-semibold">{powData.project.commentsCount}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                {powData.project.githubUrl && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-2 border-gray-300 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-all text-xs"
                    asChild
                  >
                    <a href={powData.project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-1.5 h-3.5 w-3.5" />
                      Code
                    </a>
                  </Button>
                )}
                {powData.project.projectUrl && (
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all text-xs"
                    asChild
                  >
                    <a href={powData.project.projectUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  </Button>
                )}
              </div>
            </div>

          </div>

          {/* Certificate Buttons - Only for Winners */}
          {isWinner && (
            <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
              <div className="flex gap-2">
                <Button
                  onClick={handlePreviewCertificate}
                  disabled={downloadingCert}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Award className="mr-2 h-4 w-4" />
                  {downloadingCert ? 'Loading...' : 'Preview Certificate'}
                </Button>
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {downloadingCert ? 'Downloading...' : 'Download Certificate'}
                </Button>
              </div>
            </div>
          )}

          {/* Footer - Next Contest */}
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50 rounded-full border border-amber-300 dark:border-amber-700">
              <Clock className="text-amber-600 dark:text-amber-400" size={14} />
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Next contest held in: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{timeLeft}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
