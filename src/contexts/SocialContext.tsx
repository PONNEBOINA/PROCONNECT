import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

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
  notifications: Notification[];
  sendFriendRequest: (receiverId: string) => void;
  respondToFriendRequest: (requestId: string, accept: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadCount: number;
  getAllUsers: () => any[];
  getFriendsList: () => any[];
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const storedRequests = localStorage.getItem('projectgram_friend_requests');
    const storedNotifications = localStorage.getItem('projectgram_notifications');
    
    if (storedRequests) setFriendRequests(JSON.parse(storedRequests));
    if (storedNotifications) setNotifications(JSON.parse(storedNotifications));
  }, []);

  const saveRequests = (requests: FriendRequest[]) => {
    setFriendRequests(requests);
    localStorage.setItem('projectgram_friend_requests', JSON.stringify(requests));
  };

  const saveNotifications = (notifs: Notification[]) => {
    setNotifications(notifs);
    localStorage.setItem('projectgram_notifications', JSON.stringify(notifs));
  };

  const sendFriendRequest = (receiverId: string) => {
    if (!user) return;

    const allUsers = JSON.parse(localStorage.getItem('projectgram_all_users') || '[]');
    const receiver = allUsers.find((u: any) => u.id === receiverId);
    
    const newRequest: FriendRequest = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatarUrl,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    saveRequests([...friendRequests, newRequest]);

    const notification: Notification = {
      id: (Date.now() + 1).toString(),
      userId: receiverId,
      type: 'FRIEND_REQUEST',
      message: `${user.name} sent you a friend request`,
      isRead: false,
      metadata: { requestId: newRequest.id, senderId: user.id },
      createdAt: new Date().toISOString()
    };

    saveNotifications([notification, ...notifications]);
  };

  const respondToFriendRequest = (requestId: string, accept: boolean) => {
    if (!user) return;

    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    const updatedRequests = friendRequests.map(r => 
      r.id === requestId ? { ...r, status: accept ? 'accepted' as const : 'rejected' as const } : r
    );
    saveRequests(updatedRequests);

    if (accept) {
      // Update friends list in localStorage
      const allUsers = JSON.parse(localStorage.getItem('projectgram_all_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, friends: [...(u.friends || []), request.senderId] };
        }
        if (u.id === request.senderId) {
          return { ...u, friends: [...(u.friends || []), user.id] };
        }
        return u;
      });
      localStorage.setItem('projectgram_all_users', JSON.stringify(updatedUsers));

      // Update current user
      const currentUser = JSON.parse(localStorage.getItem('projectgram_user') || '{}');
      if (currentUser.id === user.id) {
        currentUser.friends = [...(currentUser.friends || []), request.senderId];
        localStorage.setItem('projectgram_user', JSON.stringify(currentUser));
      }

      // Send notification to sender
      const notification: Notification = {
        id: Date.now().toString(),
        userId: request.senderId,
        type: 'FRIEND_ACCEPTED',
        message: `${user.name} accepted your friend request`,
        isRead: false,
        metadata: { userId: user.id },
        createdAt: new Date().toISOString()
      };
      saveNotifications([notification, ...notifications]);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    saveNotifications([newNotif, ...notifications]);
  };

  const markNotificationRead = (id: string) => {
    saveNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    saveNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = user ? notifications.filter(n => n.userId === user.id && !n.isRead).length : 0;

  const getAllUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('projectgram_all_users') || '[]');
    return allUsers.filter((u: any) => u.id !== user?.id);
  };

  const getFriendsList = () => {
    if (!user) return [];
    const allUsers = JSON.parse(localStorage.getItem('projectgram_all_users') || '[]');
    return allUsers.filter((u: any) => user.friends.includes(u.id));
  };

  return (
    <SocialContext.Provider value={{
      friendRequests,
      notifications,
      sendFriendRequest,
      respondToFriendRequest,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      unreadCount,
      getAllUsers,
      getFriendsList
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
