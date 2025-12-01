import { useState, useRef, ChangeEvent } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AvatarUploadProps = {
  userId: string;
  avatarUrl: string;
  name: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
};

export function AvatarUpload({ userId, avatarUrl, name, onAvatarUpdate }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { updateProfile } = useAuth();

  const handleAvatarClick = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;
    
    const file = fileInputRef.current.files[0];
    
    try {
      setIsUploading(true);
      
      // Compress image in browser
      const compressedBlob = await compressImage(file);
      
      const formData = new FormData();
      formData.append('image', compressedBlob, 'avatar.jpg');

      // Upload the image
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
      
      handleCloseDialog();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true);
      await updateProfile({ avatarUrl: '' });
      onAvatarUpdate('');
      toast({
        title: 'Success',
        description: 'Profile picture removed',
      });
      handleCloseDialog();
    } catch (error: any) {
      console.error('Remove avatar error:', error);
      toast({
        title: 'Failed to remove picture',
        description: error.response?.data?.message || error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="relative group">
        <div
          className="relative cursor-pointer"
          onClick={handleAvatarClick}
          aria-label="Change profile picture"
          title="Click to change profile picture"
        >
          <Avatar className="h-28 w-28 ring-4 ring-primary/30 transition-all group-hover:ring-primary/50">
            {avatarUrl ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={`${name}'s avatar`} 
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
            )}
          </Avatar>

          <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Profile Photo</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            {previewUrl ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="relative h-48 w-48 rounded-full overflow-hidden mx-auto">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col w-full space-y-2">
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : 'Apply'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setPreviewUrl(null)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  Upload Photo
                </Button>
                {avatarUrl && (
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Removing...
                      </>
                    ) : 'Remove Current Photo'}
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={handleCloseDialog}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        disabled={isUploading}
      />
    </>
  );
}

