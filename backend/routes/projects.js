import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import ProjectOfTheWeek from '../models/ProjectOfTheWeek.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current Project of the Week (public for feed)
router.get('/project-of-week', authenticateToken, async (req, res) => {
  try {
    const currentPOW = await ProjectOfTheWeek.findOne({ isActive: true })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email avatarUrl' }
      })
      .sort({ selectedAt: -1 });

    if (!currentPOW) {
      return res.json({ active: false, expiresAt: null });
    }

    // Check if expired
    if (new Date() > currentPOW.expiresAt) {
      currentPOW.isActive = false;
      await currentPOW.save();
      return res.json({ active: false, expiresAt: currentPOW.expiresAt });
    }

    res.json({
      active: true,
      id: currentPOW._id,
      project: {
        id: currentPOW.project._id,
        title: currentPOW.project.title,
        description: currentPOW.project.description,
        techStack: currentPOW.project.techStack,
        imageUrl: currentPOW.project.imageUrl,
        githubUrl: currentPOW.project.githubUrl,
        projectUrl: currentPOW.project.projectUrl,
        likesCount: currentPOW.project.likes.length,
        commentsCount: currentPOW.project.comments.length,
        owner: {
          id: currentPOW.project.owner._id,
          name: currentPOW.project.owner.name,
          avatarUrl: currentPOW.project.owner.avatarUrl
        }
      },
      reason: currentPOW.reason,
      selectedAt: currentPOW.selectedAt,
      expiresAt: currentPOW.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get feed projects (user's own + friends' projects)
router.get('/feed', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    // Feed includes:
    // 1. User's own projects (all visibility)
    // 2. Friends' public projects
    // 3. Friends' friend-only projects
    const projects = await Project.find({
      $or: [
        // User's own projects
        { owner: req.user.userId },
        // Friends' public projects
        { owner: { $in: user.friends }, visibility: 'public' },
        // Friends' friend-only projects
        { owner: { $in: user.friends }, visibility: 'friends' }
      ]
    })
      .populate('owner', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      id: project._id,
      ownerId: project.owner._id,
      ownerName: project.owner.name,
      ownerAvatar: project.owner.avatarUrl,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl,
      imageUrl: project.imageUrl,
      visibility: project.visibility,
      createdAt: project.createdAt,
      likes: project.likes,
      likesCount: project.likesCount,
      commentsCount: project.commentsCount,
      isLiked: project.likes.some(id => id.toString() === req.user.userId),
      challenges: project.challenges
    }));

    res.json(formattedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's projects
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.params.userId })
      .populate('owner', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      id: project._id,
      ownerId: project.owner._id,
      ownerName: project.owner.name,
      ownerAvatar: project.owner.avatarUrl,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl,
      imageUrl: project.imageUrl,
      visibility: project.visibility,
      createdAt: project.createdAt,
      likes: project.likes,
      likesCount: project.likesCount,
      commentsCount: project.commentsCount,
      isLiked: project.likes.some(id => id.toString() === req.user.userId),
      challenges: project.challenges
    }));

    res.json(formattedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, projectUrl, imageUrl, visibility, challenges } = req.body;

    const project = new Project({
      owner: req.user.userId,
      title,
      description,
      techStack,
      githubUrl,
      projectUrl,
      imageUrl,
      visibility,
      challenges: challenges || { faced: '', learned: '', explored: '' }
    });

    await project.save();
    await project.populate('owner', 'name email avatarUrl');

    res.status(201).json({
      id: project._id,
      ownerId: project.owner._id,
      ownerName: project.owner.name,
      ownerAvatar: project.owner.avatarUrl,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl,
      imageUrl: project.imageUrl,
      visibility: project.visibility,
      createdAt: project.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, techStack, githubUrl, projectUrl, imageUrl, visibility } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    project.techStack = techStack || project.techStack;
    project.githubUrl = githubUrl !== undefined ? githubUrl : project.githubUrl;
    project.projectUrl = projectUrl !== undefined ? projectUrl : project.projectUrl;
    project.imageUrl = imageUrl !== undefined ? imageUrl : project.imageUrl;
    project.visibility = visibility || project.visibility;

    await project.save();
    await project.populate('owner', 'name email avatarUrl');

    res.json({
      id: project._id,
      ownerId: project.owner._id,
      ownerName: project.owner.name,
      ownerAvatar: project.owner.avatarUrl,
      title: project.title,
      description: project.description,
      techStack: project.techStack,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl,
      imageUrl: project.imageUrl,
      visibility: project.visibility,
      createdAt: project.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like/Unlike project
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userIndex = project.likes.indexOf(req.user.userId);

    if (userIndex > -1) {
      // Unlike
      project.likes.splice(userIndex, 1);
    } else {
      // Like
      project.likes.push(req.user.userId);
    }

    await project.save();

    res.json({
      liked: userIndex === -1,
      likesCount: project.likesCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const comment = {
      user: req.user.userId,
      text: text.trim(),
      createdAt: new Date()
    };

    project.comments.push(comment);
    await project.save();

    // Populate user info for the new comment
    await project.populate('comments.user', 'name avatarUrl');

    const newComment = project.comments[project.comments.length - 1];

    res.status(201).json({
      id: newComment._id,
      user: {
        id: newComment.user._id,
        name: newComment.user.name,
        avatarUrl: newComment.user.avatarUrl
      },
      text: newComment.text,
      createdAt: newComment.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add reply to comment
router.post('/:id/comment/:commentId/reply', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const comment = project.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const reply = {
      user: req.user.userId,
      text: text.trim(),
      createdAt: new Date()
    };

    comment.replies.push(reply);
    await project.save();

    // Populate user info for the new reply
    await project.populate('comments.replies.user', 'name avatarUrl');

    const newReply = comment.replies[comment.replies.length - 1];

    res.status(201).json({
      id: newReply._id,
      user: {
        id: newReply.user._id,
        name: newReply.user.name,
        avatarUrl: newReply.user.avatarUrl
      },
      text: newReply.text,
      createdAt: newReply.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comments for a project
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('comments.user', 'name avatarUrl')
      .populate('comments.replies.user', 'name avatarUrl');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const formattedComments = project.comments.map(comment => ({
      id: comment._id,
      user: {
        id: comment.user._id,
        name: comment.user.name,
        avatarUrl: comment.user.avatarUrl
      },
      text: comment.text,
      replies: comment.replies.map(reply => ({
        id: reply._id,
        user: {
          id: reply.user._id,
          name: reply.user.name,
          avatarUrl: reply.user.avatarUrl
        },
        text: reply.text,
        createdAt: reply.createdAt
      })),
      createdAt: comment.createdAt
    }));

    res.json(formattedComments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete comment
router.delete('/:projectId/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const comment = project.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only comment owner or project owner can delete
    if (comment.user.toString() !== req.user.userId && project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.deleteOne();
    await project.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project challenges
router.put('/:id/challenges', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is the owner
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the project owner can update challenges' });
    }

    const { faced, learned, explored } = req.body;

    project.challenges = {
      faced: faced || '',
      learned: learned || '',
      explored: explored || ''
    };

    await project.save();
    await project.populate('owner', 'name email avatarUrl');

    res.json({
      message: 'Challenges updated successfully',
      challenges: project.challenges
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
