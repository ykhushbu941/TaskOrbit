import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, CheckCircle2, Clock, AlertCircle, Info, Activity, Zap } from 'lucide-react';
import axios from 'axios';

import api from '../../utils/api';

interface PlanetProps {
  size: number;
  color: string;
  distance: number;
  speed: number;
  name: string;
  tasks: number;
  avatar: string;
  index: number;
  total: number;
  initialAngleOffset?: number;
  onClick?: () => void;
}

const Planet = ({ size, color, distance, speed, name, tasks, avatar, index, total, initialAngleOffset = 0, onClick }: PlanetProps) => {
  const initialRotation = ((index / total) * 360) + initialAngleOffset;
  
  return (
    <div
      style={{
        width: distance * 2,
        height: distance * 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
      className="rounded-full border border-border-light/20 dark:border-border-dark/20 border-dashed pointer-events-none"
    >
      <motion.div
        initial={{ rotate: initialRotation }}
        animate={{ rotate: initialRotation + 360 }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <motion.div
          whileHover={{ scale: 1.2, zIndex: 50 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="cursor-pointer group flex items-center justify-center pointer-events-auto"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: '16px', // Modern rounded square
            position: 'absolute',
            top: -size / 2,
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: `0 0 30px ${color}60`,
            border: `2px solid white`,
            padding: '2px'
          }}
        >
          <img src={avatar} alt={name} className="w-full h-full object-cover rounded-[12px]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

const OrbitView = ({ isDashboardWidget = false }: { isDashboardWidget?: boolean }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000); // Poll every 5 seconds for real-time feel
    return () => clearInterval(interval);
  }, []);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [usersRes, tasksRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setUsers(usersRes.data);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching orbit data:', error);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  };

  const getMemberData = (user: any) => {
    const memberTasks = tasks.filter(t => t.assigneeId === user.id || (t.assigneeIds && t.assigneeIds.includes(user.id)));
    const completedTasks = memberTasks.filter(t => t.status === 'Done').length;
    const taskCount = memberTasks.length;
    
    // Calculate rank for orbit distance (Position = Completion Rank)
    const userRankings = users.map(u => {
      const uTasks = tasks.filter(t => t.assigneeId === u.id || (t.assigneeIds && t.assigneeIds.includes(u.id)));
      return { id: u.id, done: uTasks.filter(t => t.status === 'Done').length };
    }).sort((a, b) => b.done - a.done);

    const rankIndex = userRankings.findIndex(u => u.id === user.id);
    const totalUsers = users.length;
    const percent = (rankIndex / totalUsers);
    
    // Determine Workload for Color (Color = Assigned Tasks)
    let workload: 'low' | 'optimal' | 'high' | 'critical' = 'low';
    if (taskCount > 8) workload = 'critical';
    else if (taskCount > 5) workload = 'high';
    else if (taskCount > 2) workload = 'optimal';

    // Map Workload to Visuals
    let color = '#00C896'; // Low (Green)
    switch(workload) {
      case 'critical': color = '#E05C5C'; break; // Red
      case 'high': color = '#FFA000'; break; // Orange
      case 'optimal': color = '#5B6BF9'; break; // Blue
    }

    // Determine Orbit Distance (1st orbit = top contributors)
    let distance = 280;
    if (rankIndex === 0 || percent < 0.25) distance = 100;
    else if (percent < 0.5) distance = 160;
    else if (percent < 0.75) distance = 220;

    // Deterministic random for jitter
    const getHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) / 2147483648;
    };
    const rand1 = getHash(user.id + 'a');
    const rand2 = getHash(user.id + 'b');
    
    // Jitter
    distance = distance + (rand1 * 40 - 20);
    const speed = 40 + (rand2 * 20 - 10);
    const size = 32 + (rand1 * 10 - 5);

    return {
      ...user,
      tasks: memberTasks,
      taskCount,
      completedTasks,
      workload,
      speed,
      size,
      distance,
      color,
      delay: rand1 * -20,
      avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name.split(' ')[0]}`
    };
  };

  if (isLoading) {
    return (
      <div className={`w-full aspect-square flex items-center justify-center ${isDashboardWidget ? '' : 'bg-surface-light-muted dark:bg-surface-dark-muted rounded-3xl border border-border-light dark:border-border-dark'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className={`relative w-full aspect-square flex items-center justify-center ${isDashboardWidget ? '' : 'bg-surface-light dark:bg-background-dark/30 rounded-3xl border border-border-light dark:border-border-dark shadow-2xl'} overflow-hidden transition-all`}>
      
      {/* Top Label */}
      <div className="absolute top-8 left-8 z-20">
        <h2 className="text-xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary-light" />
          Team Orbit
        </h2>
        <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark uppercase font-black tracking-[0.2em] mt-1 opacity-70">Elite contributors in the center orbit</p>
      </div>

      {/* Workload Scale */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-transparent px-8 py-4 rounded-[2rem] flex flex-col items-center gap-3 z-20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light/80">Workload Capacity</p>
        <div className="flex items-center gap-8">
          {[
            { label: 'Critical', color: 'bg-[#E05C5C]' },
            { label: 'High', color: 'bg-[#FFA000]' },
            { label: 'Optimal', color: 'bg-[#5B6BF9]' },
            { label: 'Low', color: 'bg-[#00C896]' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
              <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-primary-light dark:text-text-primary-dark">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Visual Orbital Paths */}
      {[100, 150, 200, 260].map((d) => (
        <div 
          key={d}
          style={{
            width: d * 2,
            height: d * 2,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            border: '1.5px solid rgba(155, 81, 224, 0.08)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #9B51E0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Central Hub */}
      <motion.div 
        animate={{ 
          boxShadow: ['0 0 40px rgba(155, 81, 224, 0.2)', '0 0 80px rgba(155, 81, 224, 0.4)', '0 0 40px rgba(155, 81, 224, 0.2)']
        }}
        transition={{ duration: 4, repeat: Infinity }}
        className="relative z-10 w-24 h-24 rounded-3xl bg-white dark:bg-surface-dark border-4 border-primary-light flex items-center justify-center shadow-2xl rotate-45"
      >
        <div className="-rotate-45 text-center">
           <Zap className="w-8 h-8 text-primary-light mx-auto mb-1" />
           <p className="text-[8px] text-text-secondary-light font-black uppercase tracking-[0.2em]">Orbit Core</p>
        </div>
      </motion.div>

      {/* Orbit Rings & Planets */}
      {users.map((user, index) => {
        const stats = getMemberData(user);
        return (
          <Planet
            key={`${user.id}-${stats.taskCount}`}
            size={stats.size}
            color={stats.color}
            distance={stats.distance}
            speed={stats.speed}
            name={user.name}
            tasks={stats.taskCount}
            avatar={stats.avatar}
            index={index}
            total={users.length}
            initialAngleOffset={stats.delay}
            onClick={() => setSelectedMember(stats)}
          />
        );
      })}

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)]"></div>
      </div>

      {/* Member Details Modal */}

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-background-light/60 dark:bg-background-dark/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface-light dark:bg-surface-dark rounded-3xl shadow-2xl border border-border-light dark:border-border-dark overflow-hidden z-10"
            >
              {/* Header */}
              <div className="relative h-32 bg-gradient-to-r from-primary-light/20 to-primary-dark/20 flex items-end p-6">
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center text-text-secondary-light hover:text-text-primary-light transition-colors border border-border-light dark:border-border-dark"
                >
                  <X className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl border-4 border-surface-light dark:border-surface-dark overflow-hidden shadow-lg bg-surface-light dark:bg-surface-dark -mb-10">
                    <img src={selectedMember.avatar} alt={selectedMember.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="mb-2">
                    <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">{selectedMember.name}</h2>
                    <p className="text-sm font-medium text-text-secondary-light flex items-center gap-2">
                      {selectedMember.email} • {selectedMember.role || 'Team Member'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 pt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Sidebar */}
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark">
                    <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-widest mb-1">Tasks Assigned</p>
                    <p className="text-3xl font-black text-text-primary-light dark:text-text-primary-dark">{selectedMember.taskCount}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary-light/5 border border-primary-light/20">
                    <p className="text-[10px] font-bold text-primary-light uppercase tracking-widest mb-1">Completed Tasks</p>
                    <p className="text-3xl font-black text-primary-light">{selectedMember.completedTasks}</p>
                  </div>
                  
                  <div className={`p-4 rounded-2xl border ${
                    selectedMember.workload === 'critical' ? 'bg-[#E05C5C]/10 border-[#E05C5C]/20 text-[#E05C5C]' :
                    selectedMember.workload === 'high' ? 'bg-[#FFA000]/10 border-[#FFA000]/20 text-[#FFA000]' :
                    selectedMember.workload === 'optimal' ? 'bg-[#5B6BF9]/10 border-[#5B6BF9]/20 text-[#5B6BF9]' :
                    'bg-[#00C896]/10 border-[#00C896]/20 text-[#00C896]'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-3 h-3" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Current Workload</p>
                    </div>
                    <p className="text-lg font-bold uppercase">
                      {selectedMember.workload}
                    </p>
                  </div>
                </div>

                {/* Tasks List */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary-light" />
                      Task Assignments
                    </h3>
                  </div>
                  
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {selectedMember.tasks.length > 0 ? selectedMember.tasks.map((task: any) => {
                      const project = projects.find(p => p.id === task.projectId);
                      return (
                        <div key={task.id} className="p-3 rounded-xl bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark group hover:border-primary-light/50 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{task.name}</p>
                              <p className="text-[10px] text-text-secondary-light mt-0.5">{project?.name || 'General Project'}</p>
                            </div>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                              task.status === 'Completed' ? 'bg-success/20 text-success' :
                              task.status === 'In Progress' ? 'bg-warning/20 text-warning' :
                              'bg-primary-light/20 text-primary-light'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex items-center gap-3">
                               <span className="flex items-center gap-1 text-[9px] font-bold text-text-secondary-light">
                                 <Clock className="w-2.5 h-2.5" />
                                 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                               </span>
                             </div>
                             <div className={`w-1.5 h-1.5 rounded-full ${
                               task.urgency === 'Critical' ? 'bg-danger' :
                               task.urgency === 'High' ? 'bg-warning' :
                               'bg-success'
                             }`}></div>
                          </div>
                        </div>
                      );
                    }) : (
                      <div className="text-center py-10 opacity-50">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
                        <p className="text-xs font-medium">No tasks currently assigned</p>
                      </div>
                    )}
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

export default OrbitView;
