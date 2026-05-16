import React, { useState, useEffect } from 'react';
import { Bell, Moon, Sun, Search, User, Settings as SettingsIcon, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useThemeStore, useAuthStore } from '../../store/useStore';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNotif, setExpandedNotif] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const toggleNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const notif = notifications.find(n => n.id === id);
    if (notif && !notif.read) {
      try {
        await api.post(`/notifications/${id}/read`);
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    setExpandedNotif(expandedNotif === id ? null : id);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/tasks?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark group-focus-within:text-primary-light dark:group-focus-within:text-primary-dark transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks, projects (Press Enter)..."
            className="w-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-light/20 dark:focus:ring-primary-dark/20 transition-all text-sm"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 sm:w-[400px] card bg-surface-light dark:bg-surface-dark shadow-2xl z-20 overflow-hidden"
                >
                  <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-surface-light dark:bg-surface-dark">
                    <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
                    <button onClick={markAllAsRead} className="text-xs text-primary-light dark:text-primary-dark font-medium hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto bg-surface-light dark:bg-surface-dark">
                    {notifications.length > 0 ? notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        onClick={(e) => toggleNotification(notif.id, e)} 
                        className={`p-4 hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors cursor-pointer border-b border-border-light/50 dark:border-border-dark/50 last:border-0 ${!notif.read ? 'bg-primary-light/5 dark:bg-primary-dark/5' : ''}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} text-text-primary-light dark:text-text-primary-dark`}>{notif.title}</p>
                          <div className="flex items-center gap-2">
                            {expandedNotif === notif.id ? <ChevronUp className="w-4 h-4 text-text-secondary-light" /> : <ChevronDown className="w-4 h-4 text-text-secondary-light" />}
                            {!notif.read && <span className="w-2 h-2 bg-primary-light dark:bg-primary-dark rounded-full shrink-0"></span>}
                          </div>
                        </div>
                        <motion.div 
                          initial={false}
                          animate={{ height: expandedNotif === notif.id ? 'auto' : '20px' }}
                          className="overflow-hidden"
                        >
                          <p className={`text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 ${expandedNotif === notif.id ? '' : 'truncate'}`}>
                            {notif.message}
                          </p>
                        </motion.div>
                        <p className="text-[10px] text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-2 uppercase font-bold tracking-widest">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )) : (
                      <div className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-surface-light-muted dark:bg-surface-dark-muted text-center border-t border-border-light dark:border-border-dark">
                    <button 
                      onClick={() => { setIsNotificationsOpen(false); navigate('/admin/messages'); }} 
                      className="text-xs w-full py-1 font-bold uppercase tracking-widest text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="h-8 w-[1px] bg-border-light dark:bg-border-dark mx-1 sm:mx-2"></div>

        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark leading-none">{user?.name || 'Guest'}</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize mt-1">{user?.role || 'Member'}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-light-muted dark:bg-surface-dark-muted border border-border-light dark:border-border-dark flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-text-secondary-light dark:text-text-secondary-dark" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 card bg-surface-light dark:bg-surface-dark shadow-2xl z-20 p-2"
                >
                  <button 
                    onClick={() => { navigate(user?.role?.toLowerCase() === 'admin' ? '/admin/settings' : '/member/settings'); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </button>
                  <button 
                    onClick={() => { navigate(user?.role?.toLowerCase() === 'admin' ? '/admin/settings' : '/member/settings'); setIsProfileOpen(false); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted transition-colors text-sm font-medium text-text-primary-light dark:text-text-primary-dark"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="h-[1px] bg-border-light dark:bg-border-dark my-2 mx-2"></div>
                  <button 
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-danger/10 text-danger transition-colors text-sm font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Header;
