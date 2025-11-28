import { useState } from 'react';
import { Navbar } from '@/components/Layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useSocial } from '@/contexts/SocialContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Check, Bell, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Notifications() {
  const { notifications, friendRequests, markNotificationRead, markAllNotificationsRead, respondToFriendRequest } = useSocial();
  const { user, users } = useAuth();
  const { toast } = useToast();
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  // Helper to get user info from notification metadata
  const getUserFromNotification = (notification: any) => {
    if (notification.type === 'FRIEND_REQUEST' && notification.metadata?.senderId) {
      return users.find(u => u.id === notification.metadata.senderId);
    }
    if (notification.type === 'FRIEND_ACCEPTED' && notification.metadata?.userId) {
      return users.find(u => u.id === notification.metadata.userId);
    }
    return null;
  };

  // Filter out friend request notifications that have been responded to
  const userNotifications = notifications
    .filter(n => n.userId === user?.id)
    .filter(n => {
      // If it's a friend request notification, check if it still has a pending request
      if (n.type === 'FRIEND_REQUEST' && n.metadata?.requestId) {
        const request = friendRequests.find(r => r.id === n.metadata.requestId);
        return request && request.status === 'pending';
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST':
        return <UserPlus className="text-primary" size={20} />;
      case 'FRIEND_ACCEPTED':
        return <Check className="text-green-500" size={20} />;
      case 'NEW_PROJECT':
        return <Bell className="text-accent" size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean, senderName: string) => {
    setProcessingRequest(requestId);
    try {
      await respondToFriendRequest(requestId, accept);
      toast({
        title: accept ? 'Friend request accepted!' : 'Friend request rejected',
        description: accept ? `You are now friends with ${senderName}` : `Request from ${senderName} rejected`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to friend request',
        variant: 'destructive',
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-24">
        <div className="flex items-center justify-between mb-8 animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-destructive to-destructive/80 text-white text-xs rounded-full font-bold mr-2 animate-bounce-in">
                  {unreadCount}
                </span>
                unread notification{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
              className="hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all group animate-slide-down"
            >
              <Check size={16} className="mr-2 transition-transform group-hover:scale-110" />
              Mark all read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {userNotifications.length === 0 ? (
            <Card className="p-12 text-center animate-bounce-in bg-gradient-to-br from-card to-muted/30">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center animate-float">
                <Bell className="text-primary" size={36} />
              </div>
              <h3 className="text-xl font-bold mb-2">No notifications yet</h3>
              <p className="text-muted-foreground">
                You're all caught up! New notifications will appear here.
              </p>
            </Card>
          ) : (
            userNotifications.map((notification, index) => {
              const notificationUser = getUserFromNotification(notification);
              
              return (
              <Card
                key={notification.id}
                className={`
                  p-4 cursor-pointer transition-all duration-300 hover-lift group
                  ${!notification.isRead 
                    ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-primary shadow-lg' 
                    : 'hover:bg-muted/50'
                  }
                  animate-slide-up
                `}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => markNotificationRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1 transform transition-transform group-hover:scale-110">
                    {notificationUser ? (
                      <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                        <AvatarImage src={notificationUser.avatarUrl} alt={notificationUser.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20">
                          {notificationUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.isRead ? 'bg-gradient-to-br from-primary/20 to-accent/20' : 'bg-muted'
                      }`}>
                        {getIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold' : ''}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">
                      <span>{formatDate(notification.createdAt)}</span>
                    </p>
                    
                    {/* Show Confirm/Reject buttons for friend requests */}
                    {notification.type === 'FRIEND_REQUEST' && notification.metadata?.requestId && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const request = friendRequests.find(r => r.id === notification.metadata.requestId);
                            handleRespondToRequest(notification.metadata.requestId, true, request?.senderName || 'User');
                          }}
                          disabled={processingRequest === notification.metadata.requestId}
                          className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
                        >
                          <Check size={14} className="mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            const request = friendRequests.find(r => r.id === notification.metadata.requestId);
                            handleRespondToRequest(notification.metadata.requestId, false, request?.senderName || 'User');
                          }}
                          disabled={processingRequest === notification.metadata.requestId}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                        >
                          <X size={14} className="mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                  {!notification.isRead && (
                    <Badge 
                      variant="default" 
                      className="ml-2 bg-gradient-to-r from-primary to-accent animate-pulse-glow"
                    >
                      New
                    </Badge>
                  )}
                </div>
              </Card>
            );
            })
          )}
        </div>
      </main>
    </div>
  );
}
