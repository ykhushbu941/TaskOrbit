import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Palette, 
  Trash2, 
  Save,
  Globe,
  Camera,
  Moon,
  Sun
} from 'lucide-react';
import { useAuthStore, useThemeStore } from '../store/useStore';
import api from '../utils/api';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  if (isAdmin) {
    tabs.push({ id: 'organization', name: 'Organization', icon: Globe });
  }

  const avatars = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Leo`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Maya`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Sam`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Alex`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=Mike`,
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch(`/users/${user.id}`, { name, email, avatar, bio });
      useAuthStore.getState().setUser(response.data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-sans font-bold">Settings</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Manage your account and preferences.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary-light/10 dark:bg-primary-dark/10 text-primary-light dark:text-primary-dark' 
                  : 'text-text-secondary-light hover:bg-surface-light-muted dark:hover:bg-surface-dark-muted hover:text-text-primary-light'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
              <h3 className="text-xl font-sans font-bold mb-8">Personal Information</h3>
              <div className="flex flex-col sm:flex-row items-center gap-8 mb-10">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-primary-light/20 overflow-hidden relative shadow-lg">
                    <img src={avatar} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-3">Choose Avatar</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {avatars.map((av, i) => (
                      <button 
                        key={i} 
                        onClick={() => setAvatar(av)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatar === av ? 'border-primary-light scale-110 shadow-md' : 'border-transparent hover:border-border-light'}`}
                      >
                        <img src={av} alt="" className="w-full h-full" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-2">Bio</label>
                  <textarea 
                    rows={3} 
                    className="input-field resize-none" 
                    placeholder="Tell us a bit about yourself..."
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border-light dark:border-border-dark flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary flex items-center gap-2 px-6 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-danger/20">
                <h4 className="text-danger font-bold mb-2">Danger Zone</h4>
                <p className="text-xs text-text-secondary-light mb-4">These actions are permanent and cannot be undone.</p>
                <button className="flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-lg text-sm font-bold hover:bg-danger/90 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
              <h3 className="text-xl font-sans font-bold mb-8">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-4">Color Mode</p>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => theme === 'dark' && toggleTheme()}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light' ? 'border-primary-light bg-primary-light/5' : 'border-border-light hover:border-text-secondary-light'}`}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-sm font-bold">Light Mode</span>
                    </button>
                    <button 
                      onClick={() => theme === 'light' && toggleTheme()}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark' ? 'border-primary-dark bg-primary-dark/5' : 'border-border-dark hover:border-text-secondary-dark'}`}
                    >
                      <Moon className="w-6 h-6" />
                      <span className="text-sm font-bold">Dark Mode</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
              <h3 className="text-xl font-sans font-bold mb-8">Notification Preferences</h3>
              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', desc: 'Receive daily digests and project updates via email.' },
                  { title: 'Push Notifications', desc: 'Real-time alerts for task assignments and mentions.' },
                  { title: 'System Alerts', desc: 'Get notified about security and organization-wide changes.' }
                ].map((pref, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-light-muted dark:bg-surface-dark-muted rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">{pref.title}</p>
                      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-border-light dark:bg-border-dark peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-light dark:peer-checked:bg-primary-dark"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
              <h3 className="text-xl font-sans font-bold mb-8">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="input-field" />
                </div>
                <div className="flex justify-end">
                  <button className="btn-primary px-6">Update Password</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'organization' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
              <h3 className="text-xl font-sans font-bold mb-8">Organization Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Organization Name</label>
                  <input type="text" className="input-field" defaultValue="TaskOrbit Studio" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select className="input-field">
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Workspace Visibility</label>
                  <select className="input-field">
                    <option>Private (Only invited members)</option>
                    <option>Restricted (Admin approval required)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tabs can be implemented similarly */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
