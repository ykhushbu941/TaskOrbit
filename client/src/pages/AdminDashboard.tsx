import React, { useState, useEffect } from 'react';
import { 
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  MessageSquare,
  PlusCircle,
  FolderOpen,
  Zap,
  Users,
  ChevronDown,
  Plus,
  AlertTriangle,
  X,
  ListTodo,
  CheckSquare,
  UserSquare2,
  ArrowRight,
  Maximize2,
  Activity,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TaskModal from '../components/tasks/TaskModal';
import OrbitView from '../components/orbit/OrbitView';
import { useAuthStore } from '../store/useStore';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Backend Data State
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Expanded Tasks Component State
  const [isTasksExpanded, setIsTasksExpanded] = useState(false);
  const [expandedTaskTab, setExpandedTaskTab] = useState('Total Tasks');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes, activityRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get('/users'),
        api.get('/activityLog')
      ]);
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setUsers(usersRes.data || []);
      setActivityLog(activityRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const handleAddTaskClick = () => {
    setIsAddTaskModalOpen(true);
  };

  const topMembers = users.map(user => {
    const completedTasks = tasks.filter(t => (t.assigneeId === user.id || (t.assigneeIds && t.assigneeIds.includes(user.id))) && t.status === 'Done').length;
    return { ...user, completedTasks };
  }).sort((a, b) => b.completedTasks - a.completedTasks).slice(0, 5);


  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status).map(t => {
      const project = projects.find(p => p.id === t.projectId);
      const user = users.find(u => u.id === t.assigneeId);
      return {
        id: t.id,
        name: t.name,
        project: project?.name || 'Unknown Project',
        assignee: user?.name || 'Unassigned',
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        urgency: t.urgency || 'Medium'
      };
    });
  };

  const tasksData = {
    'Total Tasks': tasks.map(t => {
      const project = projects.find(p => p.id === t.projectId);
      const user = users.find(u => u.id === t.assigneeId);
      return {
        id: t.id,
        name: t.name,
        project: project?.name || 'Unknown Project',
        assignee: user?.name || 'Unassigned',
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        urgency: t.urgency || 'Medium'
      };
    }),
    'To Do': getTasksByStatus('To Do'),
    'In Progress': getTasksByStatus('In Progress'),
    'In Review': getTasksByStatus('In Review'),
    'Done': getTasksByStatus('Done')
  };

  // Calculate real workload data from tasks
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const workloadData = days.map(day => {
    const count = tasks.filter(t => {
      const d = new Date(t.createdAt);
      return days[d.getDay()] === day;
    }).length;
    return { name: day, tasks: count };
  });


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              toast.type === 'success' 
                ? 'bg-success/10 border-success/20 text-success backdrop-blur-md' 
                : 'bg-danger/10 border-danger/20 text-danger backdrop-blur-md'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">Dashboard Overview</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Monitor your team's progress and performance.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddTaskModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Initialize Task</span>
          </button>
        </div>
      </div>

      {/* Expandable Tasks Component */}
      <motion.button 
        layoutId="tasks-component"
        onClick={() => setIsTasksExpanded(true)}
        className="w-full card p-6 cursor-pointer group text-left hover:border-primary-light/50 dark:hover:border-primary-dark/50 transition-colors relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center text-primary-light dark:text-primary-dark">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">Tasks</h2>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">Click to expand and view detailed task data</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-light-muted dark:bg-surface-dark-muted flex items-center justify-center text-text-secondary-light group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
          {[
            { label: 'Total Tasks', count: tasks.length, color: 'text-blue-500' },
            { label: 'To Do', count: tasks.filter(t => t.status === 'To Do').length, color: 'text-slate-500' },
            { label: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: 'text-[#FFA000]' },
            { label: 'In Review', count: tasks.filter(t => t.status === 'In Review').length, color: 'text-[#9B51E0]' },
            { label: 'Done', count: tasks.filter(t => t.status === 'Done').length, color: 'text-[#00C896]' },
          ].map((stat, i) => (
            <div key={i} className="bg-surface-light-muted dark:bg-surface-dark-muted p-3 rounded-xl border border-transparent group-hover:border-border-light dark:group-hover:border-border-dark transition-colors flex flex-col items-center justify-center">
              <span className={`text-xl font-bold ${stat.color}`}>{stat.count}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary-light dark:text-text-secondary-dark mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
        
        {/* Decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary-light/5 dark:bg-primary-dark/5 rounded-full blur-3xl group-hover:bg-primary-light/10 dark:group-hover:bg-primary-dark/10 transition-colors"></div>
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Main Column (span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Team Orbit Card */}
          <div className="card p-6">
            <div className="w-full aspect-square">
              <OrbitView isDashboardWidget={true} />
            </div>
          </div>

          {/* My Recent Activities Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">My Recent Activities</h3>
              </div>
            </div>

            <div className="relative pl-3">
              <div className="absolute left-[1.15rem] top-2 bottom-6 w-[2px] bg-border-light dark:bg-border-dark transition-all duration-500"></div>
              <div className="space-y-6">
                {activityLog.filter(log => log.userId === currentUser?.id).length > 0 ? activityLog.filter(log => log.userId === currentUser?.id).slice(0, 6).map((log, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark shrink-0 z-10 border-2 border-border-light dark:border-border-dark relative -left-1 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(log.userName || 'User').split(' ')[0]}`} alt={log.userName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        <span className="font-bold">You</span> {log.action} <span className="font-bold">{log.targetName}</span>
                      </p>
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 font-bold uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-text-secondary-light italic text-sm">
                    No recent activities recorded for you.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (span 1) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Critical Deadlines Card */}
          <div className="card p-6 border-danger/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" />
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Critical Deadlines</h3>
              </div>
              <span className="text-[10px] font-bold tracking-widest text-danger bg-danger/10 px-2 py-1 rounded uppercase">
                {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length} Overdue
              </span>
            </div>
            
            <div className="space-y-3">
              {projects.filter(p => p.deadline).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 4).map((project, i) => {
                const isOverdue = new Date(project.deadline) < new Date();
                return (
                  <button 
                    key={i}
                    onClick={() => navigate(`/admin/projects`)}
                    className={`w-full text-left block p-4 rounded-xl transition-all cursor-pointer group border ${
                      isOverdue 
                        ? 'bg-danger/5 border-danger/20 hover:bg-danger/10 hover:border-danger/40' 
                        : 'bg-surface-light-muted dark:bg-surface-dark-muted border-transparent hover:border-border-light dark:hover:border-border-dark'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-bold transition-colors ${isOverdue ? 'text-danger' : 'text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark'}`}>
                        {project.name}
                      </h4>
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded uppercase ${
                        isOverdue ? 'bg-danger text-white' : 'bg-warning/10 text-warning'
                      }`}>
                        {isOverdue ? 'Overdue' : 'Due'}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 mb-3 font-medium flex items-center justify-between ${isOverdue ? 'text-danger/80' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                      {new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    
                    <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isOverdue ? 'bg-danger' : 'bg-warning'}`} 
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </button>
                );
              })}
              {projects.filter(p => p.deadline).length === 0 && (
                <div className="text-center py-6 text-text-secondary-light italic text-sm">
                  No upcoming deadlines.
                </div>
              )}
            </div>
          </div>



          {/* Team Recent Activities Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-light dark:text-primary-dark" />
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">Team Recent Activities</h3>
              </div>
            </div>

            <div className="relative pl-3">
              <div className="absolute left-[1.15rem] top-2 bottom-6 w-[2px] bg-border-light dark:bg-border-dark transition-all duration-500"></div>
              <div className="space-y-6">
                {activityLog.filter(log => log.userId !== currentUser?.id).length > 0 ? activityLog.filter(log => log.userId !== currentUser?.id).slice(0, 6).map((log, i) => (
                  <div key={i} className="relative flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark shrink-0 z-10 border-2 border-border-light dark:border-border-dark relative -left-1 overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(log.userName || 'User').split(' ')[0]}`} alt={log.userName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-text-primary-light dark:text-text-primary-dark">
                        <span className="font-bold">{log.userName}</span> {log.action} <span className="font-bold">{log.targetName}</span>
                      </p>
                      <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 font-bold uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-text-secondary-light italic text-sm">
                    No recent activities recorded for the team.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Expanded Tasks Modal */}
      <AnimatePresence>
        {isTasksExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTasksExpanded(false)}
              className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              layoutId="tasks-component"
              className="card bg-surface-light dark:bg-surface-dark w-full max-w-5xl h-full max-h-[85vh] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-border-light dark:border-border-dark"
            >
              <div className="flex items-center justify-between p-6 border-b border-border-light dark:border-border-dark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-light/10 dark:bg-primary-dark/10 flex items-center justify-center text-primary-light dark:text-primary-dark">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">Tasks Overview</h2>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-0.5">Detailed breakdown by status</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsTasksExpanded(false)}
                  className="w-10 h-10 rounded-full bg-surface-light-muted dark:bg-surface-dark-muted flex items-center justify-center text-text-secondary-light hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border-light dark:border-border-dark p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto custom-scrollbar">
                  {Object.keys(tasksData).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setExpandedTaskTab(tab)}
                      className={`flex items-center justify-between w-full p-3 rounded-xl transition-all whitespace-nowrap text-left ${
                        expandedTaskTab === tab 
                          ? 'bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark shadow-md' 
                          : 'hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted text-text-secondary-light dark:text-text-secondary-dark font-medium'
                      }`}
                    >
                      <span>{tab}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        expandedTaskTab === tab 
                          ? 'bg-white/20 text-white dark:text-background-dark' 
                          : 'bg-surface-light-muted dark:bg-surface-dark-muted text-text-secondary-light dark:text-text-secondary-dark'
                      }`}>
                        {tasksData[tab as keyof typeof tasksData].length}
                      </span>
                    </button>
                  ))}
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-surface-light-muted/30 dark:bg-surface-dark-muted/30">
                  <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-6 flex items-center gap-2">
                    {expandedTaskTab} Tasks
                  </h3>
                  
                  <div className="space-y-3">
                    {(tasksData[expandedTaskTab as keyof typeof tasksData] || []).map((task: any) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={task.id}
                        onClick={() => navigate(`/admin/tasks?taskId=${task.id}`)}
                        className="bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md hover:border-primary-light/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                      >
                        <div>
                          <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark text-base group-hover:text-primary-light transition-colors">{task.name || 'Untitled Task'}</h4>
                          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mt-1 flex items-center gap-2">
                            <FolderOpen className="w-3.5 h-3.5" />
                            {task.project || 'No Project'}
                          </p>
                        </div>
                        <div className="flex items-center gap-6 sm:justify-end">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-surface-light-muted overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${(task.assignee || 'User').split(' ')[0]}`} alt={task.assignee} />
                            </div>
                            <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{task.assignee || 'Unassigned'}</span>
                          </div>
                          <div className="flex flex-col items-end">
                             <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                               task.urgency === 'High' || task.urgency === 'Critical' ? 'bg-danger/10 text-danger' : 'bg-primary-light/10 text-primary-light'
                             }`}>
                               {task.urgency || 'Medium'}
                             </span>
                             <span className="text-[10px] text-text-secondary-light mt-1">{task.date || 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {tasksData[expandedTaskTab as keyof typeof tasksData].length === 0 && (
                      <div className="text-center py-12 text-text-secondary-light italic">
                        No {expandedTaskTab.toLowerCase()} tasks found.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TaskModal 
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSuccess={fetchDashboardData}
      />


    </div>
  );
};

export default AdminDashboard;
