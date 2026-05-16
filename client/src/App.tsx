import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useThemeStore, useAuthStore } from './store/useStore';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import TaskBoard from './components/tasks/TaskBoard';
import ProjectList from './components/projects/ProjectList';
import MessageSystem from './components/dashboard/MessageSystem';
import FocusMode from './components/focus/FocusMode';

import MemberDashboard from './pages/MemberDashboard';
import MemberRaiseIssue from './pages/MemberRaiseIssue';
import AdminMembers from './pages/AdminMembers';
import Settings from './pages/Settings';
import ProjectDetail from './pages/ProjectDetail';
import ReportsAnalytics from './pages/ReportsAnalytics';

// Mock components for remainders
const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'member' }) => {
  const { user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to={user.role?.toLowerCase() === 'admin' ? '/admin' : '/member'} replace />;
  }

  return <>{children}</>;
};

function App() {
  const { theme } = useThemeStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="messages" element={<MessageSystem />} />
          {/* <Route path="reports" element={<ReportsAnalytics />} /> */}
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Member Routes */}
        <Route path="/member" element={
          <ProtectedRoute role="member">
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<MemberDashboard />} />
          <Route path="tasks" element={<TaskBoard />} />
          <Route path="projects" element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="messages" element={<MessageSystem />} />
          <Route path="raise-issue" element={<MemberRaiseIssue />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        <Route path="/member/focus" element={
          <ProtectedRoute role="member">
            <FocusMode />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
