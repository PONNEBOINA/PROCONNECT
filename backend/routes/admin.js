import express from 'express';
import User from '../models/User.js';
import Project from '../models/Project.js';
import ProjectOfTheWeek from '../models/ProjectOfTheWeek.js';
import Notification from '../models/Notification.js';
import Report from '../models/Report.js';
import Contestant from '../models/Contestant.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, authorizeAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, projects] = await Promise.all([
      User.find(),
      Project.find()
    ]);

    const suspendedUsers = users.filter(u => u.isSuspended).length;
    const totalLikes = projects.reduce((sum, p) => sum + p.likes.length, 0);
    const totalComments = projects.reduce((sum, p) => sum + p.comments.length, 0);

    // Get top 3 users by POW wins
    const topUsers = users
      .sort((a, b) => (b.powWins || 0) - (a.powWins || 0))
      .slice(0, 3)
      .map(u => ({
        _id: u._id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        wins: u.powWins || 0
      }));

    res.json({
      totalUsers: users.length,
      suspendedUsers,
      totalProjects: projects.length,
      pendingReports: 0, // Will be real after reports system
      totalAwards: 0, // Will be real after awards system
      totalLikes,
      totalComments,
      topUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    const formattedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      section: user.section,
      role: user.role,
      isSuspended: user.isSuspended,
      friendsCount: user.friendsCount,
      createdAt: user.createdAt
    }));

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Suspend user
router.put('/users/:userId/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend admin users' });
    }

    user.isSuspended = true;
    await user.save();

    res.json({ message: 'User suspended successfully', user: { id: user._id, isSuspended: user.isSuspended } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unsuspend user
router.put('/users/:userId/unsuspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSuspended = false;
    await user.save();

    res.json({ message: 'User unsuspended successfully', user: { id: user._id, isSuspended: user.isSuspended } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    const formattedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      githubUrl: project.githubUrl,
      projectUrl: project.projectUrl,
      owner: {
        id: project.owner._id,
        name: project.owner.name,
        email: project.owner.email
      },
      techStack: project.techStack,
      likesCount: project.likes.length,
      commentsCount: project.comments.length,
      createdAt: project.createdAt
    }));

    res.json(formattedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI Suggest Project of the Week
router.post('/ai/suggest-weekly', async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email avatarUrl');

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects available' });
    }

    // Calculate scores for each project
    const scoredProjects = projects.map(project => {
      const likesScore = project.likes.length * 3;
      const commentsScore = project.comments.length * 2;
      
      // Recency score (projects from last 30 days get bonus)
      const daysSinceCreation = (Date.now() - project.createdAt) / (1000 * 60 * 60 * 24);
      const recencyScore = daysSinceCreation <= 30 ? 10 : 0;
      
      // Tech stack uniqueness (more techs = higher score)
      const techScore = project.techStack.length * 1.5;
      
      const totalScore = likesScore + commentsScore + recencyScore + techScore;

      return {
        project,
        score: totalScore,
        breakdown: {
          likes: likesScore,
          comments: commentsScore,
          recency: recencyScore,
          techStack: techScore
        }
      };
    });

    // Sort by score and get the best
    scoredProjects.sort((a, b) => b.score - a.score);
    const best = scoredProjects[0];

    // Generate reason
    const reason = `Selected based on ${best.project.likes.length} likes, ${best.project.comments.length} comments, ` +
                   `${best.project.techStack.length} technologies used, and recent activity.`;

    res.json({
      projectId: best.project._id,
      title: best.project.title,
      ownerName: best.project.owner.name,
      ownerId: best.project.owner._id,
      score: best.score,
      breakdown: best.breakdown,
      reason,
      techStack: best.project.techStack,
      imageUrl: best.project.imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve Project of the Week (Deprecated - redirects to contest route)
// This endpoint is kept for backward compatibility
// The actual approval logic is now in /contest/approve
router.post('/project-of-week/approve', async (req, res) => {
  try {
    // This endpoint is deprecated, but we'll keep the logic for now
    // In the future, frontend should use /contest/approve directly
    const { projectId, reason, score } = req.body;

    if (!projectId || !reason) {
      return res.status(400).json({ message: 'Project ID and reason are required' });
    }

    const project = await Project.findById(projectId).populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get current week info
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekNumber = Math.ceil(diff / oneWeek);
    const year = now.getFullYear();

    // Deactivate all previous POTWs
    await ProjectOfTheWeek.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Calculate expiration (next Sunday at midnight)
    const daysUntilNextSunday = (7 - now.getDay()) % 7 || 7;
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + daysUntilNextSunday);
    expiresAt.setHours(0, 0, 0, 0);

    // Create new POTW
    const potw = new ProjectOfTheWeek({
      project: projectId,
      user: project.owner._id,
      reason,
      score: score || 100,
      selectedAt: new Date(),
      expiresAt,
      isActive: true
    });

    await potw.save();

    // Update contestant status to winner (if exists)
    await Contestant.updateOne(
      { project: projectId, weekNumber, year, status: 'active' },
      { status: 'winner', certificateType: 'winner' }
    );

    // Mark all other contestants as participants
    await Contestant.updateMany(
      { weekNumber, year, status: 'active', project: { $ne: projectId } },
      { status: 'participant', certificateType: 'participant' }
    );

    // Increment winner's POW win count
    await User.findByIdAndUpdate(
      project.owner._id,
      { $inc: { powWins: 1 } }
    );

    // Send notification to winner
    const winnerNotification = new Notification({
      user: project.owner._id,
      type: 'potw_winner',
      message: `🎉 Congratulations! Your project "${project.title}" has been selected as Project of the Week!`,
      relatedProject: projectId
    });
    await winnerNotification.save();

    // Send notification to all users
    const allUsers = await User.find({ _id: { $ne: project.owner._id } });
    const notifications = allUsers.map(u => ({
      user: u._id,
      type: 'potw_announcement',
      message: `🏆 Project of the Week has been revealed! Check out "${project.title}" by ${project.owner.name}`,
      relatedProject: projectId
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.json({
      message: 'Project of the Week approved successfully!',
      potw: {
        id: potw._id,
        project: {
          id: project._id,
          title: project.title,
          owner: project.owner.name
        },
        reason,
        expiresAt,
        weekNumber,
        year
      }
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current Project of the Week
router.get('/project-of-week/current', async (req, res) => {
  try {
    const currentPOW = await ProjectOfTheWeek.findOne({ isActive: true })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email avatarUrl' }
      })
      .sort({ selectedAt: -1 });

    if (!currentPOW) {
      return res.json({ active: false });
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
        owner: {
          id: currentPOW.project.owner._id,
          name: currentPOW.project.owner.name,
          avatarUrl: currentPOW.project.owner.avatarUrl
        }
      },
      reason: currentPOW.reason,
      score: currentPOW.score,
      selectedAt: currentPOW.selectedAt,
      expiresAt: currentPOW.expiresAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get reports (placeholder for now)
router.get('/reports', async (req, res) => {
  try {
    // TODO: Implement reports system
    // For now, return empty array
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Project of the Week history
router.get('/project-of-week/history', async (req, res) => {
  try {
    const history = await ProjectOfTheWeek.find()
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name avatarUrl powWins' }
      })
      .sort({ selectedAt: -1 })
      .limit(20);

    const formattedHistory = history.map(pow => {
      // Calculate week number from selectedAt date
      const selectedDate = new Date(pow.selectedAt);
      const start = new Date(selectedDate.getFullYear(), 0, 1);
      const diff = selectedDate - start;
      const oneWeek = 1000 * 60 * 60 * 24 * 7;
      const weekNumber = Math.ceil(diff / oneWeek);

      return {
        id: pow._id,
        project: {
          id: pow.project._id,
          title: pow.project.title,
          imageUrl: pow.project.imageUrl
        },
        owner: {
          id: pow.project.owner._id,
          name: pow.project.owner.name,
          avatarUrl: pow.project.owner.avatarUrl,
          totalWins: pow.project.owner.powWins || 0
        },
        reason: pow.reason,
        score: pow.score,
        selectedAt: pow.selectedAt,
        expiresAt: pow.expiresAt,
        weekNumber,
        year: selectedDate.getFullYear(),
        isActive: pow.isActive
      };
    });

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

// Get all pending reports
router.get('/reports', async (req, res) => {
  try {
    const reports = await Report.find({ status: 'pending' })
      .populate('reporter', 'name email avatarUrl')
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email avatarUrl' }
      })
      .sort({ createdAt: -1 });

    const formattedReports = reports.map(report => ({
      id: report._id,
      reporter: {
        id: report.reporter._id,
        name: report.reporter.name,
        email: report.reporter.email,
        avatarUrl: report.reporter.avatarUrl
      },
      project: {
        id: report.project._id,
        title: report.project.title,
        description: report.project.description,
        imageUrl: report.project.imageUrl,
        owner: {
          id: report.project.owner._id,
          name: report.project.owner.name,
          email: report.project.owner.email
        }
      },
      reason: report.reason,
      createdAt: report.createdAt
    }));

    res.json(formattedReports);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Resolve a report
router.post('/reports/:reportId/resolve', async (req, res) => {
  try {
    const { action } = req.body; // 'approved', 'deleted', 'warned', 'suspended'
    const report = await Report.findById(req.params.reportId)
      .populate('project');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Perform action based on admin decision
    if (action === 'deleted') {
      await Project.findByIdAndDelete(report.project._id);
    } else if (action === 'suspended') {
      await User.findByIdAndUpdate(report.project.owner, { isSuspended: true });
    }

    // Update report status
    report.status = 'resolved';
    report.action = action;
    report.resolvedBy = req.user.userId;
    report.resolvedAt = new Date();
    await report.save();

    res.json({ message: 'Report resolved successfully', action });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Project of the Week history
router.get('/project-of-week/history', async (req, res) => {
  try {
    const history = await ProjectOfTheWeek.find({ isActive: false })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email avatarUrl' }
      })
      .sort({ selectedAt: -1 })
      .limit(20);

    const formattedHistory = history.map(pow => ({
      id: pow._id,
      project: {
        id: pow.project._id,
        title: pow.project.title,
        description: pow.project.description,
        imageUrl: pow.project.imageUrl,
        techStack: pow.project.techStack
      },
      winner: {
        id: pow.user,
        name: pow.project.owner.name,
        avatarUrl: pow.project.owner.avatarUrl
      },
      reason: pow.reason,
      score: pow.score,
      selectedAt: pow.selectedAt,
      expiresAt: pow.expiresAt
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user awards/achievements
router.get('/awards/users', async (req, res) => {
  try {
    // Aggregate wins per user
    const awards = await ProjectOfTheWeek.aggregate([
      {
        $group: {
          _id: '$user',
          wins: { $sum: 1 },
          recentWinDate: { $max: '$selectedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          userId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          avatarUrl: '$userInfo.avatarUrl',
          wins: 1,
          recentWinDate: 1
        }
      },
      {
        $sort: { wins: -1 }
      }
    ]);

    res.json(awards);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      suspendedUsers,
      totalProjects,
      pendingReports,
      totalAwards
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isSuspended: true }),
      Project.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      ProjectOfTheWeek.countDocuments()
    ]);

    // Get top 3 users by POW wins
    const topUsers = await ProjectOfTheWeek.aggregate([
      {
        $group: {
          _id: '$user',
          wins: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          name: '$userInfo.name',
          avatarUrl: '$userInfo.avatarUrl',
          wins: 1
        }
      },
      {
        $sort: { wins: -1 }
      },
      {
        $limit: 3
      }
    ]);

    res.json({
      totalUsers,
      suspendedUsers,
      totalProjects,
      pendingReports,
      totalAwards,
      topUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
