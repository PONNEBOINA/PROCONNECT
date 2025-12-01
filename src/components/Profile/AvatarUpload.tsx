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

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Resize to max 400x400
          let width = img.width;
          let height = img.height;
          const maxSize = 400;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.7 // 70% quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
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

    try {
      setIsUploading(true);
      
      // Compress image in browser
      console.log('Original file size:', file.size);
      const compressedBlob = await compressImage(file);
      console.log('Compressed size:', compressedBlob.size);
      
      const formData = new FormData();
      formData.append('image', compressedBlob, 'avatar.jpg');

      console.log('Uploading compressed image...');

      // Upload the image using our configured axios instance
      const uploadRes = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response:', uploadRes.data);

      // Update user profile with the new avatar URL
      const imageUrl = uploadRes.data.data.fullUrl;
      console.log('Updating profile with avatar URL:', imageUrl);
      
      await updateProfile({ avatarUrl: imageUrl });
      onAvatarUpdate(imageUrl);

      toast({
        title: 'Success',
        description: 'Profile picture updated!',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.message || 'Failed to upload image',
        variant: 'destructive',
      });
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
        title="Click to change profile picture"
      >
        <Avatar className="h-28 w-28 ring-4 ring-primary/30 transition-all group-hover:ring-primary/50">
          <AvatarImage 
            src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
            alt={`${name}'s avatar`} 
          />
          <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-white">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
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

