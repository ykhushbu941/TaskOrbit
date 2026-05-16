import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Users } from 'lucide-react';

import BackgroundOrbit from '../components/BackgroundOrbit';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark overflow-hidden flex flex-col relative">
      {/* Dynamic Orbit Background */}
      <BackgroundOrbit />

      {/* Navbar */}
      <nav className="p-8 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-light dark:bg-primary-dark flex items-center justify-center">
            <Zap className="text-white dark:text-background-dark w-6 h-6" />
          </div>
          <span className="text-2xl font-sans font-bold tracking-tight">TaskOrbit</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        {/* Background blobs/elements (subtle) */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-light/5 dark:bg-primary-dark/5 blur-[120px] rounded-full pointer-events-none animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-light/5 dark:bg-secondary-dark/5 blur-[120px] rounded-full pointer-events-none animate-float-delayed"></div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl z-20 glass-card p-12 border-white/20 dark:border-white/5"
        >
          <h1 className="text-6xl md:text-8xl font-sans font-bold leading-tight mb-8">
            Keep your team <br />
            <span className="italic text-primary-light dark:text-primary-dark italic-orbit">in orbit.</span>
          </h1>
          <p className="text-xl text-text-secondary-light dark:text-text-secondary-dark mb-12 max-w-xl mx-auto leading-relaxed font-medium">
            A production-grade team management platform designed for clarity, focus, and quiet confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login?role=admin')}
              className="group relative px-8 py-4 bg-primary-light dark:bg-primary-dark text-white dark:text-background-dark rounded-2xl font-medium text-lg overflow-hidden transition-all shadow-xl shadow-primary-light/20 dark:shadow-primary-dark/10"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                <span>I'm an Admin</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login?role=member')}
              className="group px-8 py-4 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark rounded-2xl font-medium text-lg hover:border-primary-light dark:hover:border-primary-dark transition-all"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>I'm a Team Member</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          </div>
        </motion.div>
      </main>

      <footer className="p-8 text-center text-text-secondary-light dark:text-text-secondary-dark text-sm border-t border-border-light/50 dark:border-border-dark/50 relative z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        © 2026 TaskOrbit. All rights reserved. Built for boutique teams.
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .italic-orbit {
          background: linear-gradient(to right, #C9A96E, #E8D5B7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />
    </div>
  );
};

export default Landing;
