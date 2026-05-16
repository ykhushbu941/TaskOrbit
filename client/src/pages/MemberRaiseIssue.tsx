import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Send, 
  Paperclip, 
  ChevronRight, 
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import api from '../utils/api';

const MemberRaiseIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [issues, setIssues] = useState([
    { id: '1', title: 'Auth Bug on Safari', project: 'API Migration', priority: 'High', status: 'In Progress', date: '2h ago' },
    { id: '2', title: 'Typography mismatch in footer', project: 'TaskOrbit', priority: 'Low', status: 'Resolved', date: 'Yesterday' },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.post('/activityLog', {
        action: 'raised an issue',
        targetName: title
      });
      
      const newIssue = {
        id: Date.now().toString(),
        title,
        project,
        priority,
        status: 'Open',
        date: 'Just now'
      };
      setIssues([newIssue, ...issues]);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error raising issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h2 className="text-3xl font-sans font-bold">Raise an Issue</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Found a blocker or have a concern? Let the admin know.</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Issue Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Summarize the problem..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Project</label>
                <select 
                  required
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select Project</option>
                  <option value="TaskOrbit">TaskOrbit Redesign</option>
                  <option value="API Migration">API Migration</option>
                  <option value="Mobile App">Mobile App Prototype</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Description</label>
              <textarea
                rows={5}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field resize-none"
                placeholder="Explain the issue in detail. What happened? How can we reproduce it?"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button type="button" className="flex items-center gap-2 text-sm font-medium text-text-secondary-light hover:text-text-primary-light transition-colors">
                <Paperclip className="w-4 h-4" />
                <span>Attach Files</span>
              </button>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary px-8 py-3 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Issue</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-sans font-bold">Your Issues</h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">Track the status of your reports.</p>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {issues.map((issue) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card p-5 group cursor-pointer hover:border-primary-light/50 dark:hover:border-primary-dark/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                    issue.status === 'Resolved' ? 'bg-success/10 text-success' : 
                    issue.status === 'In Progress' ? 'bg-warning/10 text-warning' : 
                    'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark'
                  }`}>
                    {issue.status}
                  </div>
                  <span className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium">{issue.date}</span>
                </div>
                <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-1">{issue.title}</h4>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{issue.project}</p>
                
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>{issue.priority} Priority</span>
                  </div>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="card p-6 bg-surface-light-muted dark:bg-surface-dark-muted border-dashed">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold">12 Issues Resolved</p>
              <p className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium">Keep up the good work!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRaiseIssue;
