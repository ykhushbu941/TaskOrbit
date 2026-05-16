import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  CheckSquare, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Zap,
  Target,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import { useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuthStore();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/messages/unread/count');
        setUnreadCount(response.data.count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const adminLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
    { name: 'Members', icon: Users, path: '/admin/members' },
    { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' }, 
  ];

  const memberLinks = [
    { name: 'My Dashboard', icon: LayoutDashboard, path: '/member' },
    { name: 'My Tasks', icon: CheckSquare, path: '/member/tasks' },
    { name: 'Projects', icon: Briefcase, path: '/member/projects' },
    { name: 'Messages', icon: MessageSquare, path: '/member/messages' },
    { name: 'Raise Issue', icon: AlertCircle, path: '/member/raise-issue' },
    { name: 'Focus Mode', icon: Target, path: '/member/focus' },
  ];

  const links = isAdmin ? [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Projects', icon: Briefcase, path: '/admin/projects' },
    { name: 'Tasks', icon: CheckSquare, path: '/admin/tasks' },
    { name: 'Members', icon: Users, path: '/admin/members' },
    { name: 'Messages', icon: MessageSquare, path: '/admin/messages' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ] : [
    { name: 'My Dashboard', icon: LayoutDashboard, path: '/member' },
    { name: 'My Tasks', icon: CheckSquare, path: '/member/tasks' },
    { name: 'Projects', icon: Briefcase, path: '/member/projects' },
    { name: 'Messages', icon: MessageSquare, path: '/member/messages' },
    { name: 'Raise Issue', icon: AlertCircle, path: '/member/raise-issue' },
    { name: 'Focus Mode', icon: Target, path: '/member/focus' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="h-screen bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex flex-col relative z-20"
    >
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-light dark:bg-primary-dark flex items-center justify-center shrink-0">
          <Zap className="text-white dark:text-background-dark w-5 h-5" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-sans font-bold tracking-tight text-text-primary-light dark:text-text-primary-dark"
          >
            TaskOrbit
          </motion.span>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/admin' || link.path === '/member'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group",
              isActive 
                ? "bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark shadow-sm" 
                : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted hover:text-text-primary-light dark:hover:text-text-primary-dark"
            )}
          >
            <link.icon className={cn("w-5 h-5 shrink-0 transition-transform group-hover:scale-110")} />
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 flex items-center justify-between overflow-hidden"
              >
                <span className="font-medium whitespace-nowrap">{link.name}</span>
                {link.name === 'Messages' && unreadCount > 0 && (
                  <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-danger/20 min-w-[20px] text-center">
                    {unreadCount}
                  </span>
                )}
              </motion.div>
            )}
            {isCollapsed && link.name === 'Messages' && unreadCount > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface-light dark:border-surface-dark" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
