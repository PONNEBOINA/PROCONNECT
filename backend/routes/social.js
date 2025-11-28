import express from 'express';
import FriendRequest from '../models/FriendRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/friend-request', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;

    const existingRequest = await FriendRequest.findOne({
      sender: req.user.userId,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    const friendRequest = new FriendRequest({
      sender: req.user.userId,
      receiver: receiverId
    });

    await friendRequest.save();

    const sender = await User.findById(req.user.userId);
    const notification = new Notification({
      user: receiverId,
      type: 'FRIEND_REQUEST',
      message: `${sender.name} sent you a friend request`,
      metadata: { requestId: friendRequest._id, senderId: req.user.userId }
    });

    await notification.save();

    res.status(201).json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friend requests (received)
router.get('/friend-requests', authenticateToken, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user.userId,
      status: 'pending'
    })
      .populate('sender', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map(req => ({
      id: req._id,
      senderId: req.sender._id,
      senderName: req.sender.name,
      senderAvatar: req.sender.avatarUrl,
      receiverId: req.receiver,
      status: req.status,
      createdAt: req.createdAt
    }));

    res.json(formattedRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get sent friend requests (to show "Requested" status)
router.get('/friend-requests/sent', authenticateToken, async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      sender: req.user.userId,
      status: 'pending'
    })
      .populate('receiver', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const formattedRequests = requests.map(req => ({
      id: req._id,
      receiverId: req.receiver._id,
      receiverName: req.receiver.name,
      receiverAvatar: req.receiver.avatarUrl,
      status: req.status,
      createdAt: req.createdAt
    }));

    res.json(formattedRequests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check friend request status with a specific user
router.get('/friend-request/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(req.user.userId);

    // Check if already friends
    if (currentUser.friends.includes(userId)) {
      return res.json({ status: 'friends' });
    }

    // Check if there's a pending request (sent or received)
    const sentRequest = await FriendRequest.findOne({
      sender: req.user.userId,
      receiver: userId,
      status: 'pending'
    });

    if (sentRequest) {
      return res.json({ status: 'requested', requestId: sentRequest._id });
    }

    const receivedRequest = await FriendRequest.findOne({
      sender: userId,
      receiver: req.user.userId,
      status: 'pending'
    });

    if (receivedRequest) {
      return res.json({ status: 'pending', requestId: receivedRequest._id });
    }

    res.json({ status: 'none' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cancel friend request (for sender)
router.delete('/friend-request/:id', authenticateToken, async (req, res) => {
  try {
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.sender.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel this request' });
    }

    await friendRequest.deleteOne();

    // Remove the notification
    await Notification.deleteOne({
      user: friendRequest.receiver,
      type: 'FRIEND_REQUEST',
      'metadata.requestId': friendRequest._id
    });

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Respond to friend request
router.post('/friend-request/:id/respond', authenticateToken, async (req, res) => {
  try {
    const { accept } = req.body;
    const friendRequest = await FriendRequest.findById(req.params.id);

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (friendRequest.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    friendRequest.status = accept ? 'accepted' : 'rejected';
    await friendRequest.save();

    if (accept) {
      await User.findByIdAndUpdate(req.user.userId, {
        $addToSet: { friends: friendRequest.sender }
      });

      await User.findByIdAndUpdate(friendRequest.sender, {
        $addToSet: { friends: req.user.userId }
      });

      const receiver = await User.findById(req.user.userId);
      const notification = new Notification({
        user: friendRequest.sender,
        type: 'FRIEND_ACCEPTED',
        message: `${receiver.name} accepted your friend request`,
        metadata: { userId: req.user.userId }
      });

      await notification.save();
    }

    res.json({ message: accept ? 'Friend request accepted' : 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get notifications
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const formattedNotifications = notifications.map(notif => ({
      id: notif._id,
      userId: notif.user,
      type: notif.type,
      message: notif.message,
      isRead: notif.isRead,
      metadata: notif.metadata,
      createdAt: notif.createdAt
    }));

    res.json(formattedNotifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get friends list
router.get('/friends', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('friends', 'name email avatarUrl section bio')
      .lean();

    const formattedFriends = user.friends.map(friend => ({
      id: friend._id,
      name: friend.name,
      email: friend.email,
      avatarUrl: friend.avatarUrl,
      section: friend.section,
      bio: friend.bio
    }));

    res.json(formattedFriends);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unfriend a user
router.delete('/friend/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Remove from both users' friend lists
    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { friends: friendId }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: req.user.userId }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
