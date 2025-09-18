const express = require('express');
const bcrypt = require('bcryptjs');
const { verifyToken, requireOrgAccess, auditLog } = require('../middleware/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('org_id', 'name branding settings')
      .select('-password');

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update user profile
router.patch('/profile', auditLog('user_updated', 'user'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already taken.' });
      }
      user.email = email;
      user.emailVerified = false; // Require re-verification
    }

    if (name) user.name = name;

    await user.save();

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Change password
router.patch('/password', auditLog('password_changed', 'user'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Get user tasks
router.get('/tasks', requireOrgAccess, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      assigned = 'me',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { org_id: req.user.org_id };
    
    // Filter by assignment
    if (assigned === 'me') {
      query.assigned_to = req.user._id;
    } else if (assigned === 'created') {
      query.created_by = req.user._id;
    }
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email')
      .populate('created_by', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Create task
router.post('/tasks', 
  requireOrgAccess, 
  auditLog('task_created', 'task'),
  async (req, res) => {
    try {
      const { title, description, priority, assigned_to, due_date, tags } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Task title is required.' });
      }

      // Validate assigned_to user belongs to same organization
      if (assigned_to) {
        const assignee = await User.findOne({
          _id: assigned_to,
          org_id: req.user.org_id,
          status: 'active'
        });
        if (!assignee) {
          return res.status(400).json({ message: 'Invalid assignee.' });
        }
      }

      const task = new Task({
        title,
        description,
        priority: priority || 'medium',
        org_id: req.user.org_id,
        assigned_to: assigned_to || req.user._id,
        created_by: req.user._id,
        due_date: due_date ? new Date(due_date) : undefined,
        tags: tags || []
      });

      await task.save();
      await task.populate(['assigned_to', 'created_by'], 'name email');

      res.status(201).json({
        message: 'Task created successfully.',
        task
      });

    } catch (error) {
      console.error('Create task error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

// Update task
router.patch('/tasks/:taskId', 
  requireOrgAccess, 
  auditLog('task_updated', 'task'),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const updates = req.body;

      const task = await Task.findOne({
        _id: taskId,
        org_id: req.user.org_id
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      // Check permissions - only assigned user, creator, or org admin can update
      const canUpdate = task.assigned_to?.toString() === req.user._id.toString() ||
                       task.created_by.toString() === req.user._id.toString() ||
                       ['org_admin', 'sub_admin'].includes(req.user.role);

      if (!canUpdate) {
        return res.status(403).json({ message: 'Not authorized to update this task.' });
      }

      // Validate assigned_to if being updated
      if (updates.assigned_to) {
        const assignee = await User.findOne({
          _id: updates.assigned_to,
          org_id: req.user.org_id,
          status: 'active'
        });
        if (!assignee) {
          return res.status(400).json({ message: 'Invalid assignee.' });
        }
      }

      // Update allowed fields
      const allowedUpdates = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date', 'tags'];
      allowedUpdates.forEach(field => {
        if (updates[field] !== undefined) {
          task[field] = updates[field];
        }
      });

      await task.save();
      await task.populate(['assigned_to', 'created_by'], 'name email');

      res.json({
        message: 'Task updated successfully.',
        task
      });

    } catch (error) {
      console.error('Update task error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

// Delete task
router.delete('/tasks/:taskId', 
  requireOrgAccess, 
  auditLog('task_deleted', 'task'),
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const task = await Task.findOne({
        _id: taskId,
        org_id: req.user.org_id
      });

      if (!task) {
        return res.status(404).json({ message: 'Task not found.' });
      }

      // Check permissions - only creator or org admin can delete
      const canDelete = task.created_by.toString() === req.user._id.toString() ||
                       ['org_admin', 'sub_admin'].includes(req.user.role);

      if (!canDelete) {
        return res.status(403).json({ message: 'Not authorized to delete this task.' });
      }

      await Task.findByIdAndDelete(taskId);

      res.json({ message: 'Task deleted successfully.' });

    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
);

// Get task statistics
router.get('/stats', requireOrgAccess, async (req, res) => {
  console.log("=== GET /user/stats ROUTE HIT ===");
  try {
    const userId = req.user._id;
    
    // Extract org_id properly
    let orgId = req.user.org_id;
    if (orgId && typeof orgId === "object" && orgId._id) {
      orgId = orgId._id;
    }
    
    console.log("Getting user stats for user:", userId, "org:", orgId);

    const [
      myTasks,
      completedTasks,
      overdueTasks,
      todayTasks
    ] = await Promise.all([
      Task.countDocuments({ assigned_to: userId, status: { $ne: 'completed' } }),
      Task.countDocuments({ assigned_to: userId, status: 'completed' }),
      Task.countDocuments({ 
        assigned_to: userId, 
        due_date: { $lt: new Date() },
        status: { $ne: 'completed' }
      }),
      Task.countDocuments({
        assigned_to: userId,
        due_date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      })
    ]);

    const stats = {
      myTasks,
      completedTasks,
      overdueTasks,
      todayTasks,
      active: myTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      today: todayTasks
    };
    
    console.log("User stats:", stats);
    res.json({
      myTasks,
      completedTasks,
      overdueTasks,
      todayTasks,
      // Also provide alternative naming for compatibility
      active: myTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      today: todayTasks
    });

  } catch (error) {
    console.error('Get stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;