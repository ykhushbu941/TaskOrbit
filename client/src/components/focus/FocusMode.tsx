import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Music, 
  Volume2, 
  VolumeX,
  ChevronRight,
  Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FocusMode = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [isMuted, setIsMuted] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi'>('none');

  const task = {
    title: 'Finalize Design Tokens',
    description: 'Ensure all primary and secondary colors match the TaskOrbit editorial design system.',
    subtasks: [
      { id: '1', text: 'Define HSL variables for dark mode', completed: true },
      { id: '2', text: 'Create shadow utility classes', completed: false },
      { id: '3', text: 'Export typography scale', completed: false },
    ]
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
      // Play sound notification (mock)
      setIsActive(false);
      alert(mode === 'work' ? 'Time for a break!' : 'Break over, let\'s get back to work!');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'work' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-2xl flex flex-col items-center justify-center text-text-primary-dark p-8"
    >
      {/* Header */}
      <div className="absolute top-8 left-8 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-dark flex items-center justify-center">
          <Target className="text-background-dark w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-sans font-bold">Focus Mode</h2>
          <p className="text-text-secondary-dark text-xs uppercase tracking-widest">In Orbit • {mode.toUpperCase()}</p>
        </div>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        {/* Timer Section */}
        <div className="flex flex-col items-center">
          <div className="relative mb-12">
            <svg className="w-80 h-80 -rotate-90">
              <circle
                cx="160"
                cy="160"
                r="150"
                className="stroke-white/10"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="160"
                cy="160"
                r="150"
                className="stroke-primary-dark"
                strokeWidth="4"
                fill="none"
                strokeDasharray="942"
                animate={{ strokeDashoffset: 942 - (timeLeft / (mode === 'work' ? 25 * 60 : 5 * 60)) * 942 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-8xl font-mono font-bold tracking-tighter">{formatTime(timeLeft)}</span>
              <span className="text-text-secondary-dark font-medium uppercase tracking-widest mt-2">{mode}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={resetTimer}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
            <button
              onClick={toggleTimer}
              className="p-6 rounded-full bg-primary-dark text-background-dark hover:scale-105 transition-transform shadow-[0_0_30px_rgba(232,213,183,0.3)]"
            >
              {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-0.5" />}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-4 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
            </button>
          </div>

          <div className="flex gap-4 mt-12 bg-white/5 p-1 rounded-full">
            <button
              onClick={() => switchMode('work')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'work' ? 'bg-primary-dark text-background-dark' : 'text-text-secondary-dark hover:text-white'}`}
            >
              Focus
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${mode === 'break' ? 'bg-primary-dark text-background-dark' : 'text-text-secondary-dark hover:text-white'}`}
            >
              Break
            </button>
          </div>
        </div>

        {/* Task Details Section */}
        <div className="space-y-12">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-bold uppercase tracking-widest">Current Task</span>
            <h1 className="text-4xl font-sans font-bold mt-4 mb-4">{task.title}</h1>
            <p className="text-text-secondary-dark text-lg leading-relaxed">
              {task.description}
            </p>
          </motion.div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase tracking-widest text-text-secondary-dark">Checklist</h3>
            {task.subtasks.map((subtask) => (
              <div key={subtask.id} className="flex items-center gap-4 group cursor-pointer">
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${subtask.completed ? 'bg-success border-success' : 'border-white/20 group-hover:border-primary-dark'}`}>
                  {subtask.completed && <CheckCircle2 className="w-4 h-4 text-background-dark" />}
                </div>
                <span className={`text-lg ${subtask.completed ? 'text-text-secondary-dark line-through' : ''}`}>
                  {subtask.text}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <button className="btn-primary w-full py-4 flex items-center justify-center gap-3">
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark as Completed</span>
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4 text-text-secondary-dark">
             <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span className="text-xs font-medium">Ambient: {ambientSound.toUpperCase()}</span>
             </div>
             <div className="flex gap-2">
                {['none', 'rain', 'lofi'].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setAmbientSound(s as any)}
                    className={`w-2 h-2 rounded-full ${ambientSound === s ? 'bg-primary-dark' : 'bg-white/20'}`}
                  ></button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FocusMode;
