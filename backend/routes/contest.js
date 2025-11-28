import express from 'express';
import Contestant from '../models/Contestant.js';
import Project from '../models/Project.js';
import ProjectOfTheWeek from '../models/ProjectOfTheWeek.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to get current week number and year
const getCurrentWeek = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now - start;
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  const weekNumber = Math.ceil(diff / oneWeek);
  return { weekNumber, year: now.getFullYear() };
};

// Helper function to check if registration is open (Saturday 12 AM - Sunday 12 AM)
const isRegistrationOpen = () => {
  const now = new Date();
  const day = now.getDay();
  return day === 6; // Saturday only
};

// Helper function to send contest reminder notifications (Friday evening)
const sendContestReminders = async () => {
  try {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // Send reminders on Friday evening (day 5, hour 18-19)
    if (day === 5 && hour === 18) {
      const allUsers = await User.find();
      const notifications = allUsers.map(user => ({
        recipient: user._id,
        type: 'contest_reminder',
        message: '🏆 Reminder: Project of the Week contest registration opens tomorrow (Saturday)! Get your project ready.',
        createdAt: new Date()
      }));
      
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
        console.log(`Sent contest reminders to ${notifications.length} users`);
      }
    }
  } catch (error) {
    console.error('Failed to send contest reminders:', error);
  }
};

// Helper function to check if admin can evaluate (Sunday 12 AM - Monday 12 AM)
const isEvaluationPeriod = () => {
  const now = new Date();
  const day = now.getDay();
  return day === 0; // Sunday only
};

// Helper function to check if winner should be displayed (Monday 12:01 AM - Friday 11:59 PM)
const isDisplayPeriod = () => {
  const now = new Date();
  const day = now.getDay();
  return day >= 1 && day <= 5; // Monday to Friday
};

// Register project for contest (ONLY ON SATURDAYS)
router.post('/register/:projectId', authenticateToken, async (req, res) => {
  try {
    // Check if registration is open (Saturday only)
    if (!isRegistrationOpen()) {
      return res.status(403).json({ 
        message: 'Contest registration is only allowed on Saturdays (12:00 AM - 11:59 PM)',
        canRegister: false
      });
    }

    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Verify user is the owner
    if (project.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the project owner can register for contest' });
    }

    const { weekNumber, year } = getCurrentWeek();

    // Check if already registered for this week
    const existingContestant = await Contestant.findOne({
      project: req.params.projectId,
      weekNumber,
      year,
      status: 'active'
    });

    if (existingContestant) {
      return res.status(400).json({ 
        message: 'This project is already registered for this week\'s contest',
        alreadyRegistered: true
      });
    }

    // Create contestant entry
    const contestant = new Contestant({
      user: req.user.userId,
      project: req.params.projectId,
      weekNumber,
      year
    });

    await contestant.save();

    res.status(201).json({
      message: 'Successfully registered for Project of the Week contest!',
      contestant: {
        id: contestant._id,
        weekNumber,
        year,
        registeredAt: contestant.registeredAt
      }
    });
  } catch (error) {
    console.error('Contest registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if project is registered for current week
router.get('/check-registration/:projectId', authenticateToken, async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();
    
    const contestant = await Contestant.findOne({
      project: req.params.projectId,
      weekNumber,
      year,
      status: 'active'
    });

    res.json({
      isRegistered: !!contestant,
      canRegister: isRegistrationOpen(),
      isEvaluationPeriod: isEvaluationPeriod(),
      weekNumber,
      year,
      contestant: contestant ? {
        id: contestant._id,
        registeredAt: contestant.registeredAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all contestants for current week (ADMIN ONLY)
router.get('/contestants', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();
    
    const contestants = await Contestant.find({
      weekNumber,
      year,
      status: 'active'
    })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name email avatarUrl' }
      })
      .populate('user', 'name email avatarUrl')
      .sort({ registeredAt: -1 });

    const formattedContestants = contestants.map(c => ({
      id: c._id,
      project: {
        id: c.project._id,
        title: c.project.title,
        description: c.project.description,
        techStack: c.project.techStack,
        imageUrl: c.project.imageUrl,
        likesCount: c.project.likesCount,
        commentsCount: c.project.commentsCount,
        owner: {
          id: c.project.owner._id,
          name: c.project.owner.name,
          avatarUrl: c.project.owner.avatarUrl
        }
      },
      registeredAt: c.registeredAt,
      weekNumber: c.weekNumber,
      year: c.year
    }));

    res.json({
      contestants: formattedContestants,
      weekNumber,
      year,
      count: formattedContestants.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove contestant from contest (ADMIN ONLY)
router.delete('/contestants/:contestantId', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const contestant = await Contestant.findById(req.params.contestantId);
    
    if (!contestant) {
      return res.status(404).json({ message: 'Contestant not found' });
    }

    contestant.status = 'removed';
    await contestant.save();

    res.json({ message: 'Contestant removed from contest' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// AI-powered selection (ADMIN ONLY - Sunday only)
router.post('/ai-pick', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    // Check if it's evaluation period (Sunday)
    if (!isEvaluationPeriod()) {
      return res.status(403).json({ 
        message: 'Winner selection is only allowed on Sundays (12:00 AM - 11:59 PM)',
        canEvaluate: false
      });
    }

    const { weekNumber, year } = getCurrentWeek();
    
    // Get all active contestants for this week
    const contestants = await Contestant.find({
      weekNumber,
      year,
      status: 'active'
    }).populate('project');

    if (contestants.length === 0) {
      return res.status(404).json({ 
        message: 'No contestants found for this week',
        hasContestants: false
      });
    }

    // AI Scoring Algorithm
    const scoredProjects = await Promise.all(contestants.map(async (contestant) => {
      const project = contestant.project;
      
      // Calculate scores
      const likesScore = (project.likesCount || 0) * 3;
      const commentsScore = (project.commentsCount || 0) * 5;
      const techStackScore = (project.techStack?.length || 0) * 2;
      const descriptionScore = project.description?.length > 200 ? 10 : 5;
      
      // Recency bonus (registered earlier in the week gets slight bonus)
      const daysSinceRegistration = Math.floor((Date.now() - contestant.registeredAt) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 7 - daysSinceRegistration);
      
      const totalScore = likesScore + commentsScore + techStackScore + descriptionScore + recencyScore;
      
      return {
        contestantId: contestant._id,
        projectId: project._id,
        userId: contestant.user,
        title: project.title,
        description: project.description,
        techStack: project.techStack,
        likesCount: project.likesCount,
        commentsCount: project.commentsCount,
        score: totalScore,
        breakdown: {
          likes: likesScore,
          comments: commentsScore,
          techStack: techStackScore,
          description: descriptionScore,
          recency: recencyScore
        }
      };
    }));

    // Sort by score and pick the best
    scoredProjects.sort((a, b) => b.score - a.score);
    const winner = scoredProjects[0];

    // Get owner details
    const project = await Project.findById(winner.projectId).populate('owner', 'name email avatarUrl');
    
    // Generate AI reason
    const reasons = [];
    if (winner.likesCount > 5) reasons.push(`${winner.likesCount} likes from the community`);
    if (winner.commentsCount > 3) reasons.push(`${winner.commentsCount} engaging comments`);
    if (winner.techStack.length > 3) reasons.push(`diverse tech stack (${winner.techStack.slice(0, 3).join(', ')})`);
    if (winner.description.length > 200) reasons.push('comprehensive project description');
    
    const reason = reasons.length > 0 
      ? `Selected for ${reasons.join(', ')}.`
      : 'Outstanding project quality and presentation.';

    res.json({
      success: true,
      suggestion: {
        contestantId: winner.contestantId,
        projectId: winner.projectId,
        userId: winner.userId,
        ownerName: project.owner.name,
        ownerAvatar: project.owner.avatarUrl,
        title: winner.title,
        description: winner.description,
        techStack: winner.techStack,
        score: winner.score,
        breakdown: winner.breakdown,
        reason,
        weekNumber,
        year
      },
      totalContestants: scoredProjects.length,
      allScores: scoredProjects.map(p => ({
        title: p.title,
        score: p.score
      }))
    });
  } catch (error) {
    console.error('AI pick error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve AI suggestion and set as Project of the Week (ADMIN ONLY)
router.post('/approve', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { projectId, reason, score } = req.body;

    if (!projectId || !reason) {
      return res.status(400).json({ message: 'Project ID and reason are required' });
    }

    const project = await Project.findById(projectId).populate('owner', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { weekNumber, year } = getCurrentWeek();

    // Deactivate all previous POTWs
    await ProjectOfTheWeek.updateMany(
      { isActive: true },
      { isActive: false }
    );

    // Calculate expiration (next Sunday at midnight)
    const now = new Date();
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

    // Update contestant status to winner and mark for winner certificate
    await Contestant.updateOne(
      { project: projectId, weekNumber, year, status: 'active' },
      { status: 'winner', certificateType: 'winner' }
    );

    // Mark all other contestants as participants (eligible for participant certificate)
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
      recipient: project.owner._id,
      type: 'potw_winner',
      message: `🎉 Congratulations! Your project "${project.title}" has been selected as Project of the Week!`,
      relatedProject: projectId
    });
    await winnerNotification.save();

    // Send notification to all users
    const allUsers = await User.find({ _id: { $ne: project.owner._id } });
    const notifications = allUsers.map(user => ({
      recipient: user._id,
      type: 'potw_announcement',
      message: `🏆 Project of the Week has been revealed! Check out "${project.title}" by ${project.owner.name}`,
      relatedProject: projectId
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // Schedule Friday reminder for next week's contest
    // This would typically be done via a cron job, but we can trigger it manually
    // Admin can call /contest/send-reminders endpoint on Friday evening

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

// Get contest status (for feed banner)
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const { weekNumber, year } = getCurrentWeek();
    
    // Check if there's an active POTW
    const activePOTW = await ProjectOfTheWeek.findOne({ isActive: true })
      .populate({
        path: 'project',
        populate: { path: 'owner', select: 'name avatarUrl' }
      });

    // Check if there are active contestants
    const contestantsCount = await Contestant.countDocuments({
      weekNumber,
      year,
      status: 'active'
    });

    res.json({
      hasWinner: !!activePOTW,
      contestInProgress: contestantsCount > 0 && !activePOTW,
      contestantsCount,
      weekNumber,
      year,
      winner: activePOTW ? {
        id: activePOTW._id,
        project: {
          id: activePOTW.project._id,
          title: activePOTW.project.title,
          description: activePOTW.project.description,
          imageUrl: activePOTW.project.imageUrl,
          techStack: activePOTW.project.techStack,
          owner: {
            id: activePOTW.project.owner._id,
            name: activePOTW.project.owner.name,
            avatarUrl: activePOTW.project.owner.avatarUrl
          }
        },
        reason: activePOTW.reason,
        selectedAt: activePOTW.selectedAt,
        expiresAt: activePOTW.expiresAt
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send contest reminder notifications (ADMIN ONLY or CRON JOB)
router.post('/send-reminders', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    await sendContestReminders();
    res.json({ message: 'Contest reminders sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if user is eligible for contest certificate
router.get('/certificate-eligibility/:projectId', authenticateToken, async (req, res) => {
  try {
    const contestant = await Contestant.findOne({
      project: req.params.projectId,
      user: req.user.userId,
      certificateType: { $in: ['winner', 'participant'] }
    }).sort({ registeredAt: -1 });

    if (!contestant) {
      return res.json({
        eligible: false,
        certificateType: null
      });
    }

    res.json({
      eligible: true,
      certificateType: contestant.certificateType,
      weekNumber: contestant.weekNumber,
      year: contestant.year,
      contestantId: contestant._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
