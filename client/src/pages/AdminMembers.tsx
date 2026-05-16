import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  MoreVertical, 
  Search, 
  Filter,
  ShieldCheck,
  Shield,
  Circle,
  ExternalLink,
  Trash2,
  Edit2,
  X
} from 'lucide-react';

import api from '../utils/api';

const AdminMembers = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/users?role=member'),
        api.get('/projects'),
        api.get('/tasks')
      ]);
      setMembers(membersRes.data);
      setProjects(projectsRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || m.role === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getProjectName = (id: string) => {
    const project = projects.find(p => p.id === id);
    return project ? project.name : 'Not Assigned';
  };

  const handleAddMember = async () => {
    if (!newEmail) return;
    
    try {
      const newMember = {
        name: newName || newEmail.split('@')[0],
        email: newEmail,
        password: newPassword, 
        role: newRole,
        assignedProjectId: selectedProjectId,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newName || newEmail}`,
      };
      
      const response = await api.post('/users', newMember);
      if (response.status === 201) {
        setMembers([...members, response.data]);
        setIsInviteModalOpen(false);
        setNewEmail('');
        setNewName('');
        setSelectedProjectId('');
        showToast('Member added successfully!');
      }
    } catch (error: any) {
      console.error('Error adding member:', error);
      showToast(error.response?.data?.message || 'Failed to add member.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      try {
        await api.delete(`/users/${id}`);
        setMembers(members.filter(m => m.id !== id));
        showToast('Member removed successfully!');
      } catch (error) {
        console.error('Error deleting member:', error);
        showToast('Failed to remove member.', 'error');
      }
    }
  };

  const handleEdit = (id: string) => {
    const member = members.find(m => m.id === id);
    const newName = window.prompt("Edit member name:", member?.name);
    if (newName) {
      api.patch(`/users/${id}`, { name: newName })
        .then(res => setMembers(members.map(m => m.id === id ? res.data : m)))
        .catch(err => console.error(err));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
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
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-bold text-sm">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold">Team Members</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage your team and their project assignments.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members..." 
              className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20 dark:focus:ring-primary-dark/20 text-text-primary-light dark:text-text-primary-dark"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 border rounded-lg transition-all flex items-center gap-2 ${activeFilter !== 'All' ? 'bg-primary-light/10 text-primary-light border-primary-light/20' : 'border-border-light dark:border-border-dark hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted'}`}
            >
              <Filter className="w-4 h-4 text-text-secondary-light" />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 card bg-surface-light dark:bg-surface-dark shadow-xl z-20 py-1"
                >
                  {['All', 'admin', 'member'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => { setActiveFilter(filter); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted capitalize ${activeFilter === filter ? 'font-bold text-primary-light dark:text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
                    >
                      {filter}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-light-muted dark:bg-surface-dark-muted border-b border-border-light dark:border-border-dark">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Member</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Assigned Project</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light dark:divide-border-dark">
            {filteredMembers.map((member) => (
              <tr 
                key={member.id} 
                onClick={() => setSelectedMember(member)}
                className="hover:bg-surface-light-muted/50 dark:hover:bg-surface-dark-muted/50 transition-colors group cursor-pointer"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar} className="w-10 h-10 rounded-full border border-border-light dark:border-border-dark" alt="" />
                    <div>
                      <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark">{member.name}</p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {member.role?.toLowerCase() === 'admin' ? (
                      <ShieldCheck className="w-4 h-4 text-primary-light dark:text-primary-dark" />
                    ) : (
                      <Shield className="w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                    )}
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm px-3 py-1 bg-primary-light/5 dark:bg-primary-dark/5 text-primary-light dark:text-primary-dark rounded-full font-medium">
                    {getProjectName(member.assignedProjectId)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Circle className={`w-2 h-2 fill-current ${member.status === 'Active' ? 'text-success' : 'text-text-secondary-light'}`} />
                    <span className="text-sm">{member.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(member.id); }} 
                      className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light hover:text-text-primary-light transition-colors" 
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(member.id); }} 
                      className="p-2 hover:bg-danger/10 rounded-lg text-text-secondary-light hover:text-danger transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredMembers.length === 0 && (
          <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark italic">
            No members found.
          </div>
        )}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {isInviteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg card bg-surface-light dark:bg-surface-dark p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-sans font-bold">Add New Member</h3>
                <button onClick={() => setIsInviteModalOpen(false)} className="p-2 hover:bg-surface-light-muted rounded-lg transition-colors">
                  <X className="w-5 h-5 text-text-secondary-light" />
                </button>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">Create a new account for your team member.</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-[10px] text-text-secondary-light">Full Name *</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light" />
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="input-field pl-10" 
                      placeholder="e.g. John Doe" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 uppercase tracking-widest text-[10px] text-text-secondary-light">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light" />
                    <input 
                      type="email" 
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      className="input-field pl-10" 
                      placeholder="colleague@company.com" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <select value={newRole} onChange={e => setNewRole(e.target.value)} className="input-field">
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Assigned Project</label>
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="input-field">
                      <option value="">Select a project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input 
                    type="text" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="input-field" 
                  />
                  <p className="text-[10px] text-text-secondary-light mt-1 uppercase font-bold tracking-widest">Default password for the new member</p>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button 
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-3 border border-border-light dark:border-border-dark rounded-xl font-medium hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-text-primary-light dark:text-text-primary-dark"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddMember}
                    className="flex-[2] py-3 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-xl font-bold hover:scale-[1.02] transition-transform"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Details Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl card bg-surface-light dark:bg-surface-dark p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-border-light dark:border-border-dark flex items-start justify-between bg-surface-light-muted/30 dark:bg-surface-dark-muted/10">
                <div className="flex items-center gap-6">
                  <img src={selectedMember.avatar} className="w-20 h-20 rounded-2xl border-2 border-primary-light shadow-xl" alt="" />
                  <div>
                    <h3 className="text-3xl font-sans font-bold">{selectedMember.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-text-secondary-light flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {selectedMember.email}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-border-light dark:bg-border-dark"></span>
                      <span className="text-sm font-bold capitalize text-primary-light">{selectedMember.role}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-surface-light-muted rounded-lg transition-colors">
                  <X className="w-6 h-6 text-text-secondary-light" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        Assigned Tasks
                        <span className="text-xs font-bold px-2 py-0.5 bg-primary-light/10 text-primary-light rounded-full">
                          {tasks.filter(t => t.assigneeId === selectedMember.id || (t.assigneeIds && t.assigneeIds.includes(selectedMember.id))).length}
                        </span>
                      </h4>
                      <div className="space-y-3">
                        {tasks.filter(t => t.assigneeId === selectedMember.id || (t.assigneeIds && t.assigneeIds.includes(selectedMember.id))).length > 0 ? (
                          tasks.filter(t => t.assigneeId === selectedMember.id || (t.assigneeIds && t.assigneeIds.includes(selectedMember.id))).map(task => (
                            <div key={task.id} className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-surface-light-muted/50 dark:bg-surface-dark-muted/50 flex items-center justify-between group hover:border-primary-light/50 transition-colors">
                              <div>
                                <h5 className="font-bold text-sm">{task.name}</h5>
                                <p className="text-xs text-text-secondary-light mt-1">
                                  Project: {getProjectName(task.projectId)}
                                </p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                  task.status === 'Done' ? 'bg-success/20 text-success' :
                                  task.status === 'In Progress' ? 'bg-warning/20 text-warning' :
                                  'bg-primary-light/20 text-primary-light'
                                }`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center border-2 border-dashed border-border-light dark:border-border-dark rounded-2xl">
                            <p className="text-sm text-text-secondary-light italic">No tasks assigned to this member.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary-light mb-4">Member Info</h4>
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider mb-1">Status</p>
                          <div className="flex items-center gap-2">
                            <Circle className={`w-2 h-2 fill-current ${selectedMember.status === 'Active' ? 'text-success' : 'text-text-secondary-light'}`} />
                            <span className="text-sm font-bold">{selectedMember.status}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider mb-1">Default Project</p>
                          <p className="text-sm font-bold">{getProjectName(selectedMember.assignedProjectId)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text-secondary-light uppercase tracking-wider mb-1">Joined Date</p>
                          <p className="text-sm font-bold">May 12, 2026</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-border-light dark:border-border-dark flex justify-end">
                 <button onClick={() => setSelectedMember(null)} className="px-6 py-2 rounded-xl bg-surface-light-muted dark:bg-surface-dark-muted font-bold text-sm">
                   Close
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMembers;
