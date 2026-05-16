import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion } from 'framer-motion';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useKeyboardShortcuts({
    'n': () => user?.role?.toLowerCase() === 'admin' ? navigate('/admin/tasks') : null,
    'f': () => user?.role === 'member' ? navigate('/member/focus') : null,
    'm': () => navigate(user?.role?.toLowerCase() === 'admin' ? '/admin/messages' : '/member/messages'),
    'd': () => navigate(user?.role?.toLowerCase() === 'admin' ? '/admin' : '/member'),
    '?': () => alert('Keyboard Shortcuts:\nN - New Task (Admin)\nF - Focus Mode (Member)\nM - Messages\nD - Dashboard\nEsc - Close Modal'),
  });

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark overflow-hidden relative">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-light/10 dark:bg-primary-dark/5 rounded-full blur-[100px] animate-float pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#5B6BF9]/10 dark:bg-[#5B6BF9]/5 rounded-full blur-[120px] animate-float-delayed pointer-events-none"></div>
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-[#00C896]/10 dark:bg-[#00C896]/5 rounded-full blur-[90px] animate-float pointer-events-none" style={{ animationDelay: '5s' }}></div>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
