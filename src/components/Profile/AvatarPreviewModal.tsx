import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AvatarPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  avatarUrl: string;
  userName: string;
}

export function AvatarPreviewModal({ isOpen, onClose, avatarUrl, userName }: AvatarPreviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="relative bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
          <div className="flex items-center justify-center min-h-[400px] max-h-[80vh]">
            <img
              src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`}
              alt={`${userName}'s profile picture`}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-white font-semibold text-center">{userName}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
