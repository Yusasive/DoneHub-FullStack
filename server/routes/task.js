const express = require('express');
const { verifyToken, requireOrgAccess, auditLog } = require('../middleware/auth');
const Task = require('../models/Task');
const User = require('../models/User');
const router = express.Router();

// Apply authentication to all routes
router.use(verifyToken);

// Get tasks for organization
router.get('/', requireOrgAccess, async (req, res) => {
  console.log("=== GET /tasks ROUTE HIT ===");
  try {
    // Extract org_id properly
    let orgId = req.user.org_id;
    if (orgId && typeof orgId === "object" && orgId._id) {
      orgId = orgId._id;
    }
    
    console.log("Getting tasks for org:", orgId);
    
    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      assigned_to,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { org_id: orgId };
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigned_to) query.assigned_to = assigned_to;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    console.log("Task query:", query);
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(query)
      .populate('assigned_to', 'name email')
      .populate('created_by', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(query);

    console.log("Found", tasks.length, "tasks out of", total, "total");
    
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
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Create task
router.post('/', 
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
router.patch('/:taskId', 
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
router.delete('/:taskId', 
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
  console.log("=== GET /task/stats ROUTE HIT ===");
  try {
    // Extract org_id properly
    let orgId = req.user.org_id;
    if (orgId && typeof orgId === "object" && orgId._id) {
      orgId = orgId._id;
    }
    
    console.log("Getting task stats for org:", orgId);

    const [
      totalTasks,
      completedTasks,
      activeTasks,
      overdueTasks,
      todayTasks,
      highPriorityTasks
    ] = await Promise.all([
      Task.countDocuments({ org_id: orgId }),
      Task.countDocuments({ org_id: orgId, status: 'completed' }),
      Task.countDocuments({ org_id: orgId, status: { $in: ['todo', 'in_progress'] } }),
      Task.countDocuments({ 
        org_id: orgId, 
        due_date: { $lt: new Date() },
        status: { $in: ['todo', 'in_progress'] }
      }),
      Task.countDocuments({
        org_id: orgId,
        due_date: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Task.countDocuments({ 
        org_id: orgId, 
        priority: 'high',
        status: { $in: ['todo', 'in_progress'] }
      })
    ]);

    const stats = {
      total: totalTasks,
      completed: completedTasks,
      active: activeTasks,
      overdue: overdueTasks,
      today: todayTasks,
      highPriority: highPriorityTasks
    };
    
    console.log("Task stats:", stats);
    res.json({
      total: totalTasks,
      completed: completedTasks,
      active: activeTasks,
      overdue: overdueTasks,
      today: todayTasks,
      highPriority: highPriorityTasks
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;