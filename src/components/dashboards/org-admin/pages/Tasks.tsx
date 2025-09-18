import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Badge } from '../../../ui/Badge';
import { Modal } from '../../../ui/Modal';
import useAuth from "../../../../context/useAuthContext";
import { 
  Plus, 
  Search, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  Edit,
  Trash2
} from 'lucide-react';

import type { Task } from "../../../../types";

export const OrgTasks = () => {
  const { getTasks, createTask, updateTask, deleteTask, getOrganizationMembers } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assigned_to: ''
  });

  const [taskForm, setTaskForm] = useState<{
    title: string;
    description: string;
    priority: string;
    assigned_to: string;
    due_date: string;
    tags: string[];
  }>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    tags: []
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, membersData] = await Promise.all([
        getTasks(filters),
        getOrganizationMembers()
      ]);
      setTasks(tasksData.tasks || []);
      setMembers(membersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(taskForm);
      setShowCreateModal(false);
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: '',
        due_date: '',
        tags: []
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

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadData();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
  setTaskForm({
    title: task.title,
    description: task.description ?? '',
    priority: task.priority ?? 'medium',
    assigned_to: typeof task.assigned_to === 'object' && task.assigned_to !== null && '_id' in task.assigned_to
      ? (task.assigned_to as { _id: string })._id
      : typeof task.assigned_to === 'string'
      ? task.assigned_to
      : '',
    due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    tags: task.tags ?? []
  });
    setShowEditModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) return 'Overdue';
    if (diffInDays === 0) return 'Due today';
    if (diffInDays === 1) return 'Due tomorrow';
    return `Due in ${diffInDays} days`;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <p className="text-gray-600">Manage and track team tasks</p>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
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
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">All Priority</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first task</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <div key={task.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            {typeof task.assigned_to === 'object' && task.assigned_to !== null && 'name' in task.assigned_to
                              ? (task.assigned_to as { name: string }).name
                              : typeof task.assigned_to === 'string'
                              ? task.assigned_to
                              : 'Unassigned'}
                          </span>
                        </div>
                        
                        {task.due_date && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{getTimeUntilDue(task.due_date)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Created {new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {task.status !== 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Input
            label="Due Date"
            type="date"
            value={taskForm.due_date}
            onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
          />
          
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign To
              </label>
              <select
                value={taskForm.assigned_to}
                onChange={(e) => setTaskForm(prev => ({ ...prev, assigned_to: e.target.value }))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">Select member</option>
                {members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <Input
            label="Due Date"
            type="date"
            value={taskForm.due_date}
            onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
          />
          
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