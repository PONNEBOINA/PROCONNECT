import express from 'express';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user insights
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get user to check if exists and get friends count
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all projects for this user
    const projects = await Project.find({ owner: userId });

    // Calculate total projects
    const totalProjects = projects.length;

    // Calculate total likes across all projects
    const totalLikes = projects.reduce((sum, project) => sum + project.likes.length, 0);

    // Calculate total comments across all projects
    const totalComments = projects.reduce((sum, project) => sum + project.comments.length, 0);

    // Get friends count
    const friendsCount = user.friends.length;

    // Get distinct tech stack
    const techStackSet = new Set();
    const techStackCount = {};
    
    projects.forEach(project => {
      project.techStack.forEach(tech => {
        techStackSet.add(tech);
        techStackCount[tech] = (techStackCount[tech] || 0) + 1;
      });
    });

    const distinctTechStack = Array.from(techStackSet);

    // Find most used tech
    let mostUsedTech = null;
    let maxCount = 0;
    
    for (const [tech, count] of Object.entries(techStackCount)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedTech = tech;
      }
    }

    // Find top project (by likes, then by comments)
    let topProject = null;
    
    if (projects.length > 0) {
      const sortedProjects = projects.sort((a, b) => {
        const likeDiff = b.likes.length - a.likes.length;
        if (likeDiff !== 0) return likeDiff;
        return b.comments.length - a.comments.length;
      });

      const top = sortedProjects[0];
      topProject = {
        title: top.title,
        likes: top.likes.length,
        comments: top.comments.length
      };
    }

    res.json({
      totalProjects,
      totalLikes,
      totalComments,
      friendsCount,
      distinctTechStack,
      mostUsedTech,
      topProject
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
