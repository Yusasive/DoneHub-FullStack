import React, { useState, useEffect } from 'react';
import useAuth from "../../context/useAuthContext";
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { 
  CheckCircle2, 
  Clock, 
  Plus, 
  Calendar, 
  Users, 
  Target,
  TrendingUp,
  Award,
  Search,
  Edit,
  User
} from 'lucide-react';

import type { Task } from "../../types";

export const MemberDashboard: React.FC = () => {
  const { getTasks, updateTask, createTask, getTaskStats, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    assigned: 'me'
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, statsData] = await Promise.all([
        getTasks({ ...filters, assigned_to: filters.assigned === 'me' ? user?.id : '' }),
        getTaskStats()
      ]);
      setTasks(tasksData.tasks || []);
      setTaskStats(statsData || {});
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask({ ...taskForm, assigned_to: user?.id });
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;
    
    try {
      await updateTask(selectedTask.id, taskForm);
      setShowEditModal(false);
      setSelectedTask(null);
      loadData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTaskForm({
      title: task.title,
      description: task.description ?? '',
      priority: task.priority,
      due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getTimeUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const now = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return 'Due tomorrow';
    return `Due in ${diffInDays} days`;
  };

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const pendingTasks = tasks.filter(task => task.status !== 'completed');
  const todayTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const today = new Date().toDateString();
    return new Date(task.due_date).toDateString() === today;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your tasks and projects</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.active || pendingTasks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.completed || completedTasks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Due Today</p>
              <p className="text-2xl font-bold text-gray-900">{taskStats.today || todayTasks.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 py-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">My Tasks</h2>
                </div>
                <Button size="sm" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
              
              {/* Filters */}
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-4">Get started by creating your first task</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            {task.due_date && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Calendar className="h-3 w-3" />
                                <span>{getTimeUntilDue(task.due_date)}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <User className="h-3 w-3" />
                              <span>
                                {typeof task.assigned_to === 'object' && task.assigned_to !== null
                                  ? (task.assigned_to as { name?: string }).name ?? 'Unassigned'
                                  : typeof task.assigned_to === 'string'
                                    ? task.assigned_to
                                    : 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {task.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTaskStatusChange(task.id, 'completed')}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Focus */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Today's Focus</h3>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All caught up for today!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        task.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {task.status === 'completed' ? 
                          <CheckCircle2 className="h-4 w-4" /> :
                          <Clock className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.priority} priority</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Team Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">New team member joined</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="h-3 w-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">Project milestone completed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tasks completed</span>
                <span className="font-semibold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hours logged</span>
                <span className="font-semibold text-gray-900">28</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Team meetings</span>
                <span className="font-semibold text-gray-900">3</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        size="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <Input
              label="Due Date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        size="lg"
      >
        <form onSubmit={handleUpdateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <Input
              label="Due Date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Update Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};