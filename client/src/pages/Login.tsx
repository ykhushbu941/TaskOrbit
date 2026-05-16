import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import BackgroundOrbit from '../components/BackgroundOrbit';
import { useAuthStore } from '../store/useStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const queryParams = new URLSearchParams(window.location.search);
  const isAdminLogin = queryParams.get('role') === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data);
      const role = String(response.data.role).toLowerCase();
      navigate(role === 'admin' ? '/admin' : '/member');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden">
      <BackgroundOrbit />
      
      {/* Dynamic background accents */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-light/20 dark:bg-primary-dark/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-float"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-light/20 dark:bg-secondary-dark/10 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 pointer-events-none animate-float-delayed"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-primary-light dark:bg-primary-dark items-center justify-center mb-4">
            <Zap className="text-white dark:text-background-dark w-7 h-7" />
          </div>
          <h2 className="text-3xl font-sans font-bold text-text-primary-light dark:text-text-primary-dark">
            {isAdminLogin ? 'Admin Login' : 'Team Member Login'}
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
            {isAdminLogin ? 'Sign in to manage your team.' : 'Sign in to access your dashboard.'}
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3 text-danger text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary-light dark:text-text-secondary-dark" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-bold"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark text-center">
            {isAdminLogin ? (
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                Don't have an account? <button onClick={() => navigate('/signup')} className="text-primary-light dark:text-primary-dark font-medium hover:underline">Create an Admin Account</button>
              </p>
            ) : (
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark italic">
                Team member accounts are created by administrators. Please contact your manager for login credentials.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
