import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MoreVertical, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  ChevronRight,
  Filter,
  Search,
  LayoutGrid,
  List as ListIcon,
  X,
  User,
  CheckCircle2,
  Trash2,
  Edit2,
  Ban
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useLocation } from 'react-router-dom';
import TaskModal from './TaskModal';
import { useAuthStore } from '../../store/useStore';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Task {
  id: string;
  name: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  projectId: string;
  assigneeId: string;
  assigneeIds?: string[];
  dueDate: string;
  createdAt: string;
}

const priorityColors = {
  Low: 'bg-success/10 text-success',
  Medium: 'bg-warning/10 text-warning',
  High: 'bg-danger/10 text-danger',
  Critical: 'bg-danger text-white'
};

const TaskCard = ({ task, users, user, onClick, onDelete, onEdit }: { task: Task, users: any[], user: any, onClick: () => void, onDelete: (id: string) => void, onEdit: (task: Task) => void }) => {
  const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete task "${task.name}"?`)) {
        onDelete(task.id);
      }
    } else if (action === 'edit') {
      onEdit(task);
    }
  };

  return (
    <motion.div
      layoutId={task.id}
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.task-menu') || (e.target as HTMLElement).closest('.task-actions')) return;
        onClick();
      }}
      className={cn(
        "card p-5 cursor-pointer mb-4 relative overflow-visible group",
        isOverdue && "ring-2 ring-danger shadow-[0_0_15px_rgba(224,92,92,0.2)]"
      )}
    >
      {isOverdue && (
        <div className="absolute top-0 right-0 p-1 bg-danger text-white text-[8px] font-bold uppercase tracking-tighter rounded-bl-lg">
          Overdue
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priorityColors[task.urgency || 'Medium']}`}>
          {task.urgency || 'Medium'}
        </span>
        {user?.role?.toLowerCase() === 'admin' && (
          <div className="relative task-menu">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
              className="p-1.5 hover:bg-surface-light-muted rounded-lg text-text-secondary-light"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}></div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 w-40 card bg-surface-light dark:bg-surface-dark shadow-xl z-20 overflow-hidden py-1 task-actions"
                  >
                    <button onClick={(e) => handleAction(e, 'edit')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-light-muted flex items-center gap-2">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <div className="h-[1px] bg-border-light dark:bg-border-dark my-1"></div>
                    <button onClick={(e) => handleAction(e, 'delete')} className="w-full text-left px-4 py-2 text-sm hover:bg-danger/10 flex items-center gap-2 text-danger font-bold">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <h4 className="font-medium text-text-primary-light dark:text-text-primary-dark mb-2 leading-tight group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
        {task.name}
      </h4>
      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark line-clamp-2 mb-4">
        {task.description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[10px] text-text-secondary-light dark:text-text-secondary-dark">
            <MessageSquare className="w-3 h-3" />
            <span>0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark mr-2">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {(task.assigneeIds || (task.assigneeId ? [task.assigneeId] : [])).slice(0, 3).map((id) => {
              const user = users.find(u => u.id === id);
              return (
                <div 
                  key={id} 
                  className="w-7 h-7 rounded-full border-2 border-surface-light dark:border-surface-dark bg-surface-light-muted overflow-hidden shadow-sm"
                  title={user?.name || 'Team Member'}
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name?.split(' ')[0] || id}`} alt="" className="w-full h-full object-cover" />
                </div>
              );
            })}
            {(task.assigneeIds?.length || (task.assigneeId ? 1 : 0)) > 3 && (
              <div className="w-7 h-7 rounded-full border-2 border-surface-light dark:border-border-dark bg-primary-light/10 flex items-center justify-center text-[8px] font-black text-primary-light z-10">
                +{(task.assigneeIds?.length || 1) - 3}
              </div>
            )}
            {!(task.assigneeIds?.length || task.assigneeId) && (
              <div className="w-7 h-7 rounded-full border-2 border-surface-light dark:border-surface-dark bg-surface-light-muted flex items-center justify-center text-text-secondary-light">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

import api from '../../utils/api';

const TaskBoard = ({ projectId }: { projectId?: string }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'board' | 'list'>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [addTaskInitialStatus, setAddTaskInitialStatus] = useState('To Do');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchTasks(true);
    fetchUsers();
    
    const interval = setInterval(() => {
      fetchTasks(false);
      fetchUsers();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const taskId = queryParams.get('taskId');
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      }
    }
  }, [tasks, location.search]);

  const fetchTasks = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const response = await api.get('/tasks');
      let data = response.data || [];
      if (projectId) {
        data = data.filter((t: Task) => t.projectId === projectId);
      }
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const search = qp.get('search');
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [location.search]);

  const handleAddTask = (status: string = 'To Do') => {
    setTaskToEdit(null);
    setAddTaskInitialStatus(status);
    setIsAddTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsAddTaskModalOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: string) => {
    // 1. Store previous state for rollback
    const previousTasks = [...tasks];
    const previousSelectedTask = selectedTask ? { ...selectedTask } : null;

    // 2. Optimistically update local state immediately
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus as any } : t
    );
    setTasks(updatedTasks);
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus as any });
    }

    try {
      // 3. Perform background server update
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
      // 4. Rollback on failure
      setTasks(previousTasks);
      if (previousSelectedTask?.id === taskId) {
        setSelectedTask(previousSelectedTask);
      }
      alert('Failed to update task status. Rolling back...');
    }
  };

  const columns = ['To Do', 'In Progress', 'In Review', 'Done'] as const;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = activeFilter === 'All' || 
                          (activeFilter === 'High Priority' && (task.urgency === 'High' || task.urgency === 'Critical'));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold">Tasks</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage and track team progress.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-surface-light-muted dark:bg-surface-dark-muted rounded-lg border border-border-light dark:border-border-dark">
            <button 
              onClick={() => setView('board')}
              className={`p-1.5 rounded-md transition-all ${view === 'board' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-light dark:text-primary-dark' : 'text-text-secondary-light'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-all ${view === 'list' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary-light dark:text-primary-dark' : 'text-text-secondary-light'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="h-8 w-[1px] bg-border-light dark:bg-border-dark mx-1"></div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 border rounded-lg transition-all ${activeFilter !== 'All' ? 'bg-primary-light/10 text-primary-light border-primary-light/20' : 'border-border-light dark:border-border-dark hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 card bg-surface-light dark:bg-surface-dark shadow-xl z-20 py-1"
                >
                  {['All', 'My Tasks', 'High Priority'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => { setActiveFilter(filter); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted ${activeFilter === filter ? 'font-bold text-primary-light dark:text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user?.role?.toLowerCase() === 'admin' && (
            <button onClick={() => handleAddTask('To Do')} className="btn-primary flex items-center gap-2 py-2 px-4">
              <Plus className="w-4 h-4" />
              <span>Initialize Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title or description..." 
            className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20 dark:focus:ring-primary-dark/20"
          />
        </div>
      </div>

      <TaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSuccess={fetchTasks}
        initialStatus={addTaskInitialStatus}
        projectId={projectId}
        task={taskToEdit}
      />

      {/* 2x2 Grid instead of horizontal scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-6">
        {columns.map((column) => (
          <div key={column} className="w-full card p-6 bg-surface-light-muted/30 dark:bg-surface-dark-muted/10 border-dashed border-2">
            <div className="flex items-center justify-between mb-6 border-b border-border-light dark:border-border-dark pb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-xl">{column}</h3>
                <span className="w-6 h-6 rounded-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark shadow-sm">
                  {filteredTasks.filter(t => t.status === column).length}
                </span>
              </div>
              {user?.role?.toLowerCase() === 'admin' && (
                <button 
                  onClick={() => handleAddTask(column)} 
                  className="p-1.5 hover:bg-surface-light dark:hover:bg-surface-dark rounded-md text-text-secondary-light dark:text-text-secondary-dark transition-colors border border-transparent hover:border-border-light dark:hover:border-border-dark shadow-sm"
                  title={`Add task to ${column}`}
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
            
            <div className="space-y-1 min-h-[150px]">
              {filteredTasks
                .filter((task) => task.status === column)
                .map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    users={users}
                    user={user}
                    onClick={() => setSelectedTask(task)}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                  />
                ))}
              {filteredTasks.filter(t => t.status === column).length === 0 && (
                <div className="h-full flex items-center justify-center text-text-secondary-light/50 dark:text-text-secondary-dark/50 text-sm font-medium italic py-8">
                  No tasks in this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

              <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              layoutId={selectedTask.id}
              className="relative w-full max-w-2xl card bg-surface-light dark:bg-surface-dark overflow-hidden shadow-2xl"
            >
               <div className="p-8 space-y-8">
                  <div className="flex items-start justify-between">
                     <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${priorityColors[selectedTask.urgency || 'Medium']}`}>
                             {selectedTask.urgency || 'Medium'}
                           </span>
                        </div>
                        <h3 className="text-2xl font-sans font-bold mt-2">{selectedTask.name}</h3>
                     </div>
                     <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg">
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-6 border-y border-border-light dark:border-border-dark">
                     <div className="space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Assignees</p>
                        <div className="flex flex-wrap gap-3">
                          {(selectedTask.assigneeIds || (selectedTask.assigneeId ? [selectedTask.assigneeId] : [])).map(id => {
                            const user = users.find(u => u.id === id);
                            return (
                              <div key={id} className="flex items-center gap-2 bg-surface-light-muted dark:bg-surface-dark-muted px-3 py-1.5 rounded-xl border border-border-light">
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name?.split(' ')[0] || id}`} alt="" />
                                </div>
                                <span className="text-xs font-bold">{user?.name || 'Unknown'}</span>
                              </div>
                            );
                          })}
                          {!(selectedTask.assigneeIds?.length || selectedTask.assigneeId) && (
                            <span className="text-sm italic text-text-secondary-light">Unassigned</span>
                          )}
                        </div>
                     </div>
                     <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Due Date</p>
                        <div className="flex items-center gap-2 text-sm font-medium">
                           <Calendar className="w-4 h-4 text-text-secondary-light" />
                           <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No deadline'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-sm font-bold uppercase tracking-widest text-text-secondary-light">Description</h4>
                     <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                        {selectedTask.description || 'No description provided.'}
                     </p>
                  </div>

                  <div className="pt-8 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        {user?.role?.toLowerCase() === 'admin' && (
                          <button 
                            onClick={() => { handleDeleteTask(selectedTask.id); setSelectedTask(null); }}
                            className="flex items-center gap-2 text-xs font-bold text-danger hover:underline"
                          >
                             <Trash2 className="w-4 h-4" />
                             <span>Delete Task</span>
                          </button>
                        )}
                     </div>
                     <div className="flex items-center gap-3">
                        {user?.role?.toLowerCase() === 'admin' && (
                          <button onClick={() => { handleEditTask(selectedTask); setSelectedTask(null); }} className="px-6 py-2 border border-border-light rounded-xl text-sm font-medium hover:bg-surface-light-muted">Edit</button>
                        )}
                        <select
                          value={selectedTask.status}
                          onChange={(e) => handleStatusUpdate(selectedTask.id, e.target.value)}
                          className="px-4 py-2 bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-xl text-sm font-bold text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light/50 cursor-pointer"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">In Review</option>
                          <option value="Done">Done</option>
                        </select>
                     </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskBoard;
