const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'cancelled'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  org_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  due_date: Date,
  completed_at: Date,
  tags: [String],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimetype: String
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  timeTracking: {
    estimated: Number, // in minutes
    actual: Number,    // in minutes
    sessions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      startTime: Date,
      endTime: Date,
      duration: Number // in minutes
    }]
  }
}, {
  timestamps: true
});

// Indexes
taskSchema.index({ org_id: 1, status: 1 });
taskSchema.index({ assigned_to: 1, status: 1 });
taskSchema.index({ due_date: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ tags: 1 });

// Auto-update completed_at when status changes to completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completed_at) {
      this.completed_at = new Date();
    } else if (this.status !== 'completed') {
      this.completed_at = undefined;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);