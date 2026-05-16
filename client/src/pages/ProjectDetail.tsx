import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Settings, 
  Plus, 
  Users, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  BarChart3,
  Calendar,
  FileText,
  Link2,
  FolderOpen
} from 'lucide-react';
import { useAuthStore } from '../store/useStore';
import TaskBoard from '../components/tasks/TaskBoard';
import api from '../utils/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      const [projectRes, usersRes, activityRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users'),
        api.get('/activityLog')
      ]);

      const currentProject = projectRes.data;
      setProject(currentProject);

      // Tasks are now included in the single project response
      const projectTasks = currentProject.tasks || [];
      setTasks(projectTasks);

      // Get unique members from the project's member list
      setTeam(currentProject.members || []);

      const projectActivity = activityRes.data.filter((log: any) => 
        log.projectId === id || (currentProject?.name && log.targetName === currentProject.name)
      );
      setActivityLogs(projectActivity);

    } catch (error) {
      console.error('Error fetching project data:', error);
      showToast('Failed to load project details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-light dark:border-primary-dark"></div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-sans font-bold">{project.name}</h1>
             <span className="px-3 py-1 bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest rounded-full">
               Active
             </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg border border-border-light dark:border-border-dark hover:bg-surface-light-muted transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Project Summary */}
          <div className="card p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
               <div className="flex-1">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary-light mb-4">About Project</h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                  </p>
               </div>
               <div className="w-full md:w-64 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary-light mb-4">Team</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.length > 0 ? team.map((member, i) => (
                      <div key={i} className="flex items-center gap-2 bg-surface-light-muted dark:bg-surface-dark-muted p-2 rounded-lg border border-border-light dark:border-border-dark" title={member.name}>
                        <img src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} className="w-6 h-6 rounded-full" alt="" />
                        <span className="text-xs font-medium">{member.name.split(' ')[0]}</span>
                      </div>
                    )) : (
                      <p className="text-xs text-text-secondary-light italic">No members assigned</p>
                    )}
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-surface-light-muted dark:bg-surface-dark-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary-light dark:bg-primary-dark rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <span className="text-sm font-bold">{progress}%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Tasks</p>
                <p className="text-lg font-bold">{completedTasks} <span className="text-text-secondary-light font-normal text-sm">/ {tasks.length}</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Timeline</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary-light" />
                  <span className="text-sm">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Status</p>
                <p className="text-lg font-bold text-success">Healthy</p>
              </div>
            </div>
          </div>

          {/* Task Board Integration */}
          <div className="card p-8">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-sans font-bold">Project Tasks</h3>
             </div>
             <TaskBoard projectId={id} />
          </div>
        </div>

        <div className="space-y-8">
          {/* Project Activity */}
          <div className="card p-8">
            <h3 className="text-xl font-sans font-bold mb-6">Activity Log</h3>
            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activityLogs.length > 0 ? activityLogs.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-surface-light-muted dark:bg-surface-dark-muted flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-text-secondary-light" />
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-bold">{item.userName}</span> <span className="text-text-secondary-light dark:text-text-secondary-dark">{item.action}</span>
                    </p>
                    <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark mt-1 uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-text-secondary-light italic text-center">No recent activity</p>
              )}
            </div>
          </div>

          {/* Project Resources */}
          <div className="card p-8">
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-text-secondary-light">Resources</h3>
                {user?.role?.toLowerCase() === 'admin' && (
                  <button 
                    onClick={() => {
                      const spec = prompt('Specifications Link:', project.specifications || '');
                      const assets = prompt('Assets Folder Link:', project.assetsFolder || '');
                      const prod = prompt('Production Link:', project.productionLink || '');
                      
                      if (spec !== null || assets !== null || prod !== null) {
                        const updates: any = {};
                        if (spec !== null) updates.specifications = spec;
                        if (assets !== null) updates.assetsFolder = assets;
                        if (prod !== null) updates.productionLink = prod;
                        
                        api.put(`/projects/${id}`, updates).then(res => setProject(res.data));
                      }
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-primary-light hover:underline"
                  >
                    Edit Links
                  </button>
                )}
             </div>
             
             <div className="space-y-4">
               {[
                 { name: 'Specifications', icon: FileText, url: project.specifications },
                 { name: 'Assets Folder', icon: FolderOpen, url: project.assetsFolder },
                 { name: 'Production Link', icon: Link2, url: project.productionLink },
               ].map((res, i) => (
                 <a 
                   key={i} 
                   href={res.url || '#'} 
                   target={res.url ? "_blank" : "_self"}
                   rel="noopener noreferrer"
                   className={`w-full flex items-center justify-between p-3 rounded-xl border border-border-light dark:border-border-dark transition-all text-sm font-medium ${
                     res.url 
                      ? 'hover:bg-primary-light/5 hover:border-primary-light/30 group' 
                      : 'opacity-50 cursor-not-allowed grayscale'
                   }`}
                 >
                   <div className="flex items-center gap-3">
                     <res.icon className={`w-4 h-4 ${res.url ? 'text-primary-light' : 'text-text-secondary-light'}`} />
                     <span className={res.url ? 'text-text-primary-light dark:text-text-primary-dark group-hover:text-primary-light' : ''}>
                       {res.name}
                     </span>
                   </div>
                   {res.url && <Link2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                 </a>
               ))}
             </div>

             <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Files & Assets</h4>
                  {user?.role?.toLowerCase() === 'admin' && (
                    <button 
                      onClick={() => {
                        const fileName = prompt('File Name:');
                        if (!fileName) return;
                        const fileUrl = prompt('File/Asset URL:');
                        if (!fileUrl) return;
                        
                        const updatedFiles = [...(project.files || []), { name: fileName, url: fileUrl }];
                        api.put(`/projects/${id}`, { files: updatedFiles }).then(res => setProject(res.data));
                      }}
                      className="p-1 hover:bg-surface-light-muted rounded"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {project.files && project.files.length > 0 ? project.files.map((file: any, i: number) => (
                    <a 
                      key={i} 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-lg bg-surface-light-muted/50 dark:bg-surface-dark-muted/50 border border-transparent hover:border-border-light text-xs group"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-text-secondary-light" />
                        <span className="font-medium group-hover:text-primary-light">{file.name}</span>
                      </div>
                      <Plus className="w-3 h-3 rotate-45 opacity-0 group-hover:opacity-100" />
                    </a>
                  )) : (
                    <p className="text-[10px] text-text-secondary-light italic">No shared files yet</p>
                  )}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
