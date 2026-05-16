import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Ban,
  X,
  AlignLeft,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuthStore } from '../../store/useStore';

const ProjectCard = ({ project, onDelete }: { project: any, onDelete: (id: string) => void }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleNavigate = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.project-menu') || (e.target as HTMLElement).closest('.project-actions')) {
      return;
    }
    const basePath = user?.role?.toLowerCase() === 'admin' ? '/admin' : '/member';
    navigate(`${basePath}/projects/${project.id}`);
  };

  const handleAction = (action: string) => {
    setIsMenuOpen(false);
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${project.name}?`)) {
        onDelete(project.id);
      }
    } else {
      alert(`Project ${project.name} action: ${action} executed!`);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleNavigate}
      className="card p-6 flex flex-col cursor-pointer relative"
    >
      <div className="flex items-start justify-between mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-background-dark font-sans font-bold text-xl"
          style={{ backgroundColor: project.color || '#5B6BF9' }}
        >
          {project.name.charAt(0)}
        </div>
        
          {user?.role?.toLowerCase() === 'admin' && (
            <div className="relative project-menu">
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg text-text-secondary-light dark:text-text-secondary-dark"
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
                      className="absolute right-0 top-full mt-1 w-40 card bg-surface-light dark:bg-surface-dark shadow-xl z-20 overflow-hidden py-1 project-actions"
                    >
                      <button onClick={() => handleAction('edit')} className="w-full text-left px-4 py-2 text-sm hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleAction('stop')} className="w-full text-left px-4 py-2 text-sm hover:bg-warning/10 flex items-center gap-2 text-warning transition-colors">
                        <Ban className="w-3.5 h-3.5" /> Stop
                      </button>
                      <div className="h-[1px] bg-border-light dark:bg-border-dark my-1"></div>
                      <button onClick={() => handleAction('delete')} className="w-full text-left px-4 py-2 text-sm hover:bg-danger/10 flex items-center gap-2 text-danger transition-colors font-bold">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
      </div>

      <h3 className="text-xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
        {project.name}
      </h3>
      <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2 flex-1 mb-6">
        {project.description}
      </p>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-text-secondary-light dark:text-text-secondary-dark">Progress</span>
            <span className="text-text-primary-light dark:text-text-primary-dark">{project.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-surface-light-muted dark:bg-surface-dark-muted rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: project.color || '#5B6BF9' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border-light dark:border-border-dark">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
             <Clock className="w-3.5 h-3.5" />
             <span>{project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-xs text-text-secondary-light dark:text-text-secondary-dark font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}</span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateProjectModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const { user } = useAuthStore();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const colors = ['#E8D5B7', '#C9A96E', '#4CAF7D', '#5B6BF9', '#E05C5C', '#9B51E0'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newProject = {
        name,
        description,
        startDate,
        deadline,
        status: 'Planning',
        progress: 0,
        color: randomColor,
        createdAt: new Date().toISOString()
      };
      
      await api.post('/projects', newProject);

      showToast('Project created successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 500);
      // Reset form
      setName('');
      setDescription('');
      setStartDate('');
      setDeadline('');
    } catch (error: any) {
      console.error('Error creating project:', error);
      const message = error.response?.data?.message || 'Failed to create project. Please try again.';
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl card bg-surface-light dark:bg-surface-dark p-8 shadow-2xl border border-border-light dark:border-border-dark"
          >
            {/* Custom Toast Notification inside Modal */}
            <AnimatePresence>
              {toast && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 border whitespace-nowrap ${
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

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-2xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark">Launch New Project</h3>
              <button onClick={onClose} className="p-2 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted rounded-lg transition-colors">
                <X className="w-5 h-5 text-text-secondary-light" />
              </button>
            </div>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-8">Set the foundation for your next big achievement.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Project Name *
                </label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field" 
                  placeholder="e.g. Q3 Strategic Rebranding" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlignLeft className="w-3 h-3" /> Description
                </label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="input-field resize-none py-3" 
                  placeholder="What is this project about? Define the core mission..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Start Date
                  </label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Deadline
                  </label>
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="input-field" 
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-border-light dark:border-border-dark rounded-xl font-medium hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-text-primary-light dark:text-text-primary-dark"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-primary-light/20 dark:shadow-primary-dark/10 disabled:opacity-50"
                >
                  {isLoading ? 'Creating Project...' : 'Initialize Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ProjectList = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || project.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark">Projects</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage and organize your team's workspace.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects..." 
              className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-light/20 dark:focus:ring-primary-dark/20 text-text-primary-light dark:text-text-primary-dark"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-2 border rounded-lg transition-all ${activeFilter !== 'All' ? 'bg-primary-light/10 text-primary-light border-primary-light/20' : 'border-border-light dark:border-border-dark hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted'}`}
            >
              <Filter className="w-4 h-4 text-text-secondary-light" />
            </button>
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-36 card bg-surface-light dark:bg-surface-dark shadow-xl z-20 py-1"
                >
                  {['All', 'Active', 'In Progress', 'Planning'].map(status => (
                    <button
                      key={status}
                      onClick={() => { setActiveFilter(status); setIsFilterOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted ${activeFilter === status ? 'font-bold text-primary-light dark:text-primary-dark' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}
                    >
                      {status}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user?.role?.toLowerCase() === 'admin' && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-text-secondary-light dark:text-text-secondary-dark bg-surface-light-muted dark:bg-surface-dark-muted rounded-3xl border border-dashed border-border-light dark:border-border-dark flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-light dark:bg-surface-dark flex items-center justify-center mb-4 text-text-secondary-light">
              <Plus className="w-8 h-8" />
            </div>
            <p className="font-medium text-lg">No projects found.</p>
            <p className="text-sm opacity-60 mt-1">Start by creating your first project.</p>
            <button onClick={() => setIsCreateModalOpen(true)} className="mt-6 text-primary-light dark:text-primary-dark font-bold hover:underline">
              Create a new project
            </button>
          </div>
        )}
      </div>

      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={fetchProjects} 
      />
    </div>
  );
};

export default ProjectList;
