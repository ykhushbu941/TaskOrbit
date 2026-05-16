import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckSquare, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  Zap,
  FolderOpen
} from 'lucide-react';
import { KpiCard } from '../components/dashboard/DashboardComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

import api from '../utils/api';

const MemberDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMemberData();
    }
  }, [user]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get(`/tasks?assigneeId=${user.id}`),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching member data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (id: string) => {
    return projects.find(p => p.id === id)?.name || 'Unknown Project';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === 'To Do' || t.status === 'Created');
  const ongoingTasks = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review');

  const completedTasks = tasks.filter(t => t.status === 'Done');

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark">
            Welcome back, {user?.name?.split(' ')[0] || 'Member'} <span className="text-primary-light dark:text-primary-dark opacity-50 italic">!</span>
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Here's what's happening with your tasks today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Today's Date</p>
            <p className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <button 
            onClick={() => navigate('/member/focus')}
            className="px-6 py-3 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-primary-light/10 dark:shadow-primary-dark/5"
          >
            <Target className="w-5 h-5" />
            <span>Enter Focus Mode</span>
          </button>
        </div>
      </div>

      {/* Top 3 Tasks Picker */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 bg-gradient-to-br from-surface-light to-surface-light-muted dark:from-surface-dark dark:to-surface-dark-muted border-primary-light/20 dark:border-primary-dark/20 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Zap className="w-32 h-32 text-primary-light" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-sans font-bold mb-2">Your Priorities</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">Tasks that need your immediate attention.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tasks.filter(t => t.status !== 'Completed').slice(0, 3).map((task, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/member/tasks?taskId=${task.id}`)}
                className="p-5 bg-white dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.urgency === 'High' || task.urgency === 'Critical' ? 'bg-danger text-white' : 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'}`}>
                    {task.urgency || 'Medium'}
                  </span>
                  <span className="text-[10px] font-medium text-text-secondary-light dark:text-text-secondary-dark">{task.status}</span>
                </div>
                <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light dark:group-hover:text-primary-dark transition-colors">{task.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark flex items-center gap-1">
                    <FolderOpen className="w-3 h-3" />
                    {getProjectName(task.projectId)}
                  </p>
                  <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium">
                    Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {tasks.filter(t => t.status !== 'Completed').length === 0 && (
              <div className="md:col-span-3 py-12 text-center text-text-secondary-light italic">
                All caught up! No pending tasks.
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Status Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <KpiCard title="To Do" value={todoTasks.length.toString()} icon={Clock} color="primary" />
            <KpiCard title="In Progress" value={ongoingTasks.length.toString()} icon={TrendingUp} color="warning" />
            <KpiCard title="Done" value={completedTasks.length.toString()} icon={CheckSquare} color="success" />
          </div>

          {/* Upcoming Deadlines */}
          <div className="card p-8">
            <h3 className="text-xl font-sans font-bold mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {tasks.filter(t => t.dueDate && t.status !== 'Completed').slice(0, 3).map((task, i) => (
                <div 
                  key={i} 
                  onClick={() => navigate(`/member/tasks?taskId=${task.id}`)}
                  className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 rounded-full bg-primary-light"></div>
                    <div>
                      <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{task.name}</p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{getProjectName(task.projectId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{new Date(task.dueDate).toLocaleDateString()}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">{task.status}</p>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.dueDate && t.status !== 'Completed').length === 0 && (
                <div className="text-center py-8 text-text-secondary-light italic">
                  No upcoming task deadlines.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="card p-8 bg-surface-light-muted dark:bg-surface-dark-muted">
            <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark mb-4">Your Workload</h3>
            <div className="flex items-end gap-2 h-20 mb-4">
              {(() => {
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const monIdx = [1, 2, 3, 4, 5, 6, 0]; // Monday to Sunday
                return monIdx.map(idx => {
                  const dayTasks = tasks.filter(t => {
                    const d = new Date(t.createdAt);
                    return d.getDay() === idx;
                  }).length;
                  const h = Math.min(dayTasks * 20, 100); // 20% height per task, max 100%
                  return (
                    <div key={idx} className="flex-1 bg-primary-light/20 dark:bg-primary-dark/20 rounded-t-sm relative group">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: dayTasks > 0 ? `${h}%` : '4px' }}
                        className="absolute bottom-0 left-0 right-0 bg-primary-light dark:bg-primary-dark rounded-t-sm"
                      />
                    </div>
                  );
                });
              })()}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark px-1">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
