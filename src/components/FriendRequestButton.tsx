import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserCheck, Clock } from 'lucide-react';

interface FriendRequestButtonProps {
  userId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function FriendRequestButton({ userId, variant = 'default', size = 'default' }: FriendRequestButtonProps) {
  const { user } = useAuth();
  const { sendFriendRequest, cancelFriendRequest, getFriendRequestStatus, unfriend } = useSocial();
  const [status, setStatus] = useState<'none' | 'requested' | 'pending' | 'friends'>('none');
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, [userId, user?.friendsCount]); // Reload when user's friend count changes

  const loadStatus = async () => {
    try {
      const result = await getFriendRequestStatus(userId);
      setStatus(result.status);
      setRequestId(result.requestId || null);
    } catch (error) {
      console.error('Failed to load status:', error);
    }
  };

  const handleSendRequest = async () => {
    setLoading(true);
    try {
      await sendFriendRequest(userId);
      await loadStatus();
    } catch (error: any) {
      console.error('Failed to send request:', error);
      alert(error.message || 'Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!requestId) return;
    setLoading(true);
    try {
      await cancelFriendRequest(requestId);
      await loadStatus();
    } catch (error: any) {
      console.error('Failed to cancel request:', error);
      alert(error.message || 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfriend = async () => {
    if (!confirm('Are you sure you want to unfriend this user?')) return;
    setLoading(true);
    try {
      await unfriend(userId);
      await loadStatus();
    } catch (error: any) {
      console.error('Failed to unfriend:', error);
      alert(error.message || 'Failed to unfriend user');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button for own profile
  if (user?.id === userId) {
    return null;
  }

  if (status === 'none') {
    const buttonProps = { variant, size } as any;
    return (
      <Button
        onClick={handleSendRequest}
        disabled={loading}
        {...buttonProps}
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {loading ? 'Sending...' : 'Send Request'}
      </Button>
    );
  }

  if (status === 'requested') {
    const buttonProps = { variant: 'outline', size } as any;
    return (
      <Button
        onClick={handleCancelRequest}
        disabled={loading}
        {...buttonProps}
      >
        <Clock className="w-4 h-4 mr-2" />
        {loading ? 'Canceling...' : 'Requested'}
      </Button>
    );
  }

  if (status === 'pending') {
    const buttonProps = { variant: 'outline', size } as any;
    return (
      <Button
        disabled
        {...buttonProps}
      >
        Respond to Request
      </Button>
    );
  }

  if (status === 'friends') {
    const buttonProps = { variant: 'outline', size } as any;
    return (
      <Button
        onClick={handleUnfriend}
        disabled={loading}
        {...buttonProps}
      >
        <UserCheck className="w-4 h-4 mr-2" />
        {loading ? 'Removing...' : 'Friends'}
      </Button>
    );
  }

  return null;
}
