import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckCircle2, Plus } from 'lucide-react';
import api from '../../utils/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialStatus?: string;
  projectId?: string;
  task?: any;
}

const TaskModal = ({ isOpen, onClose, onSuccess, initialStatus = 'To Do', projectId: initialProjectId, task = null }: TaskModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(initialProjectId || '');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (task && typeof task === 'object') {
        setName(task.name || '');
        setDescription(task.description || '');
        setProjectId(task.projectId || '');
        setDeadline(task.dueDate ? task.dueDate.split('T')[0] : '');
        setPriority(task.urgency || 'Medium');
        setAssigneeIds(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []));
      } else {
        resetForm();
        setProjectId(initialProjectId || '');
      }
    }
  }, [isOpen, task, initialProjectId]);

  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        api.get('/projects'),
        api.get('/users')
      ]);
      setProjects(projRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error('Error fetching modal data:', error);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !projectId) {
      showToast('Please fill in required fields.', 'error');
      return;
    }

    const newTask = {
      name,
      description,
      projectId,
      status: initialStatus,
      dueDate: deadline,
      urgency: priority,
      assigneeIds,
      assigneeId: assigneeIds[0] || '',
      createdAt: task ? task.createdAt : new Date().toISOString()
    };

    setIsLoading(true);
    try {
      if (task) {
        await api.put(`/tasks/${task.id}`, { ...newTask, status: task.status });
        await api.post('/activityLog', { action: 'updated task', targetName: name });
        showToast('Task updated successfully!');
      } else {
        await api.post('/tasks', newTask);
        await api.post('/activityLog', { action: 'created task', targetName: name });
        showToast('Task created successfully!');
      }
      
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 500);
    } catch (error) {
      console.error('Error creating task:', error);
      showToast('Failed to create task.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDeadline('');
    setPriority('Medium');
    setAssigneeIds([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card bg-surface-light dark:bg-surface-dark w-full max-w-xl shadow-2xl border border-border-light dark:border-border-dark relative z-10 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Custom Toast Notification inside Modal */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border whitespace-nowrap ${
                    toast.type === 'success' 
                      ? 'bg-success/10 border-success/20 text-success backdrop-blur-md' 
                      : 'bg-danger/10 border-danger/20 text-danger backdrop-blur-md'
                  }`}
                >
                  {toast.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span className="font-bold text-xs">{toast.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center p-8 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                  {task ? 'Edit Task' : 'Initialize Task'}
                </h3>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  {task ? 'Modify task details and assignments.' : 'Assign a new task to your team projects.'}
                </p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-light-muted transition-colors">
                <X className="w-6 h-6 text-text-secondary-light" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-2 text-[10px]">Task Name *</label>
                    <input 
                      type="text" 
                      required
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Design Landing Page"
                      className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-2 text-[10px]">Task Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the task details..."
                      rows={3}
                      className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark resize-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-2 text-[10px]">Project *</label>
                      <select 
                        required
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark font-medium"
                      >
                        <option value="">Choose a project</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-2 text-[10px]">Deadline</label>
                      <div className="relative">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light" />
                         <input 
                          type="date" 
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-2 text-[10px]">Priority</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark font-medium"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-text-secondary-light uppercase tracking-widest mb-3 text-[10px]">Assign To (Multiple Members)</label>
                      <div className="space-y-4">
                        <select 
                          className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/50 text-text-primary-light dark:text-text-primary-dark font-medium cursor-pointer"
                          value=""
                          onChange={(e) => {
                            const id = e.target.value;
                            if (id && !assigneeIds.includes(id)) {
                              setAssigneeIds([...assigneeIds, id]);
                            }
                          }}
                        >
                          <option value="">Select a team member...</option>
                          {users.map(u => (
                            <option key={u.id} value={u.id}>
                              {assigneeIds.includes(u.id) ? '✓ ' : ''}{u.name} ({u.role || 'Member'})
                            </option>
                          ))}
                        </select>

                        <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-surface-light-muted/30 dark:bg-surface-dark-muted/30 rounded-2xl border border-dashed border-border-light dark:border-border-dark">
                          {assigneeIds.map(id => {
                            const member = users.find(u => u.id === id);
                            if (!member) return null;
                            return (
                              <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={id} 
                                className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark px-3 py-1.5 rounded-xl shadow-sm"
                              >
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-primary-light/20">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name.split(' ')[0]}`} alt="" />
                                </div>
                                <span className="text-[11px] font-bold text-text-primary-light dark:text-text-primary-dark">{member.name}</span>
                                <button 
                                  type="button"
                                  onClick={() => setAssigneeIds(assigneeIds.filter(aId => aId !== id))}
                                  className="p-1 hover:bg-danger/10 text-text-secondary-light hover:text-danger rounded-lg transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            );
                          })}
                          {assigneeIds.length === 0 && (
                            <div className="flex items-center gap-2 text-text-secondary-light/50 py-1">
                              <Plus className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-medium italic">Selected members will appear here...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-4 border-t border-border-light dark:border-border-dark flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl border border-border-light dark:border-border-dark text-sm font-bold hover:bg-surface-light-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-primary px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-primary-light/20 flex items-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    task ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                  )}
                  {task ? 'Update Task' : 'Initialize Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
