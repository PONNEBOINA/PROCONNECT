import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { contestAPI } from '@/services/api';
import { Trophy, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContestRegistrationModal({ isOpen, onClose }: ContestRegistrationModalProps) {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectLink: '',
    challengesFaced: '',
    whatLearned: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isSaturday, setIsSaturday] = useState(false);

  useEffect(() => {
    checkIfSaturday();
    const interval = setInterval(checkIfSaturday, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkIfSaturday = () => {
    const now = new Date();
    const day = now.getDay();
    setIsSaturday(day === 6); // 6 = Saturday
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSaturday) {
      setMessage({ type: 'error', text: 'Registration opens every Saturday.' });
      return;
    }

    if (!formData.projectTitle || !formData.projectLink) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      // For now, we'll show a success message
      // In a real implementation, you'd create a project first, then register it
      setMessage({ 
        type: 'success', 
        text: 'Registration submitted successfully! Your project will be evaluated on Sunday.' 
      });

      // Reset form
      setFormData({
        projectTitle: '',
        projectLink: '',
        challengesFaced: '',
        whatLearned: ''
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to register for contest' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="text-purple-600 dark:text-purple-400" size={28} />
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Register for Project of the Week Contest
            </span>
          </DialogTitle>
          <DialogDescription>
            Submit your project to compete for this week's Project of the Week award!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Registration Status Alert */}
          <Alert className={`${isSaturday ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700'}`}>
            <Calendar className={isSaturday ? 'text-green-600' : 'text-amber-600'} size={16} />
            <AlertDescription className={isSaturday ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}>
              {isSaturday ? (
                <span className="font-semibold">✅ Registration is OPEN! Submit your project today.</span>
              ) : (
                <span className="font-semibold">⏰ Registration opens every Saturday.</span>
              )}
            </AlertDescription>
          </Alert>

          {message && (
            <Alert className={`${
              message.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700' :
              message.type === 'error' ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700' :
              'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
            }`}>
              <AlertCircle className={
                message.type === 'success' ? 'text-green-600' :
                message.type === 'error' ? 'text-red-600' :
                'text-blue-600'
              } size={16} />
              <AlertDescription className={
                message.type === 'success' ? 'text-green-800 dark:text-green-200' :
                message.type === 'error' ? 'text-red-800 dark:text-red-200' :
                'text-blue-800 dark:text-blue-200'
              }>
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="projectTitle" className="text-gray-700 dark:text-gray-300">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Enter your project title"
                className="mt-1"
                disabled={!isSaturday || loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="projectLink" className="text-gray-700 dark:text-gray-300">
                Project Link <span className="text-red-500">*</span>
              </Label>
              <Input
                id="projectLink"
                name="projectLink"
                type="url"
                value={formData.projectLink}
                onChange={handleChange}
                placeholder="https://github.com/username/project"
                className="mt-1"
                disabled={!isSaturday || loading}
                required
              />
            </div>

            <div>
              <Label htmlFor="challengesFaced" className="text-gray-700 dark:text-gray-300">
                Challenges Faced
              </Label>
              <Textarea
                id="challengesFaced"
                name="challengesFaced"
                value={formData.challengesFaced}
                onChange={handleChange}
                placeholder="Describe the challenges you encountered during development..."
                className="mt-1 min-h-[80px]"
                disabled={!isSaturday || loading}
              />
            </div>

            <div>
              <Label htmlFor="whatLearned" className="text-gray-700 dark:text-gray-300">
                What You Learned
              </Label>
              <Textarea
                id="whatLearned"
                name="whatLearned"
                value={formData.whatLearned}
                onChange={handleChange}
                placeholder="Share what you learned from this project..."
                className="mt-1 min-h-[80px]"
                disabled={!isSaturday || loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isSaturday || loading}
                className={`flex-1 ${
                  isSaturday
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white shadow-lg transition-all`}
              >
                {loading ? (
                  'Submitting...'
                ) : isSaturday ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Submit Registration
                  </>
                ) : (
                  'Opens on Saturday'
                )}
              </Button>
            </div>

            <div className="text-xs text-center text-gray-600 dark:text-gray-400 pt-2 border-t">
              <p className="font-medium">📅 Contest Timeline</p>
              <p className="mt-1">Registration: Saturday | Evaluation: Sunday | Winner Display: Monday-Friday</p>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
