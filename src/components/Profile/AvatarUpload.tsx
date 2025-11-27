import { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';

type AvatarUploadProps = {
  userId: string;
  avatarUrl: string;
  name: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
};

export function AvatarUpload({ userId, avatarUrl, name, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateProfile } = useAuth();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload a valid image (JPEG, PNG, GIF, or WebP)',
        variant: 'destructive',
      });
      return;
    }

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum size allowed is 5MB',
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');

      // Upload the image using our configured axios instance
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update user profile with the new avatar URL
      const imageUrl = uploadRes.data.data.fullUrl;
      await updateProfile({ avatarUrl: imageUrl });
      onAvatarUpdate(imageUrl);

      toast({
        title: 'Success',
        description: 'Profile picture updated!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative group">
      <div
        className="relative cursor-pointer"
        onClick={handleAvatarClick}
        aria-label="Change profile picture"
      >
        <Avatar className="h-28 w-28 ring-4 ring-primary/30">
          <AvatarImage 
            src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
            alt={`${name}'s avatar`} 
          />
          <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {isUploading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}

