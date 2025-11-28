import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { socialAPI } from '../services/api';

export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'NEW_PROJECT';
  message: string;
  isRead: boolean;
  metadata: Record<string, any>;
  createdAt: string;
}

interface SocialContextType {
  friendRequests: FriendRequest[];
  sentRequests: any[];
  notifications: Notification[];
  sendFriendRequest: (receiverId: string) => Promise<void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  respondToFriendRequest: (requestId: string, accept: boolean) => Promise<void>;
  unfriend: (friendId: string) => Promise<void>;
  getFriendRequestStatus: (userId: string) => Promise<any>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  unreadCount: number;
  getAllUsers: () => any[];
  getFriendsList: () => Promise<any[]>;
  loadFriendRequests: () => Promise<void>;
  loadSentRequests: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, users, loadUsers, reloadCurrentUser } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadFriendRequests();
      loadSentRequests();
      loadNotifications();
    }
  }, [user]);

  const loadFriendRequests = async () => {
    try {
      const requests = await socialAPI.getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const requests = await socialAPI.getSentFriendRequests();
      setSentRequests(requests);
    } catch (error) {
      console.error('Failed to load sent requests:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const notifs = await socialAPI.getNotifications();
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return;

    try {
      await socialAPI.sendFriendRequest(receiverId);
      await loadSentRequests();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send friend request');
    }
  };

  const cancelFriendRequest = async (requestId: string) => {
    if (!user) return;

    try {
      await socialAPI.cancelFriendRequest(requestId);
      await loadSentRequests();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel friend request');
    }
  };

  const respondToFriendRequest = async (requestId: string, accept: boolean) => {
    if (!user) return;

    try {
      await socialAPI.respondToFriendRequest(requestId, accept);
      await loadFriendRequests();
      await loadNotifications();
      if (accept) {
        await Promise.all([
          loadUsers(), // Refresh all users to update friend counts
          reloadCurrentUser() // Reload current user to update their friendsCount
        ]);
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to respond to friend request');
    }
  };

  const unfriend = async (friendId: string) => {
    if (!user) return;

    try {
      await socialAPI.unfriend(friendId);
      await Promise.all([
        loadUsers(), // Refresh all users to update friend counts
        reloadCurrentUser() // Reload current user to update their friendsCount
      ]);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unfriend user');
    }
  };

  const getFriendRequestStatus = async (userId: string) => {
    try {
      return await socialAPI.getFriendRequestStatus(userId);
    } catch (error) {
      console.error('Failed to get friend request status:', error);
      return { status: 'none' };
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await socialAPI.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await socialAPI.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const unreadCount = user ? notifications.filter(n => n.userId === user.id && !n.isRead).length : 0;

  const getAllUsers = () => {
    return users;
  };

  const getFriendsList = async () => {
    try {
      const friendsList = await socialAPI.getFriends();
      setFriends(friendsList);
      return friendsList;
    } catch (error) {
      console.error('Failed to load friends:', error);
      return [];
    }
  };

  return (
    <SocialContext.Provider value={{
      friendRequests,
      sentRequests,
      notifications,
      sendFriendRequest,
      cancelFriendRequest,
      respondToFriendRequest,
      unfriend,
      getFriendRequestStatus,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
      getAllUsers,
      getFriendsList,
      loadFriendRequests,
      loadSentRequests,
      loadNotifications
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within SocialProvider');
  }
  return context;
};
