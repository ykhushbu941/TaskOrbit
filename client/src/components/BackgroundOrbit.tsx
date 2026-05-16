import React from 'react';
import { motion } from 'framer-motion';

const BackgroundOrbit = () => {
  const members = [
    { seed: 'Felix', distance: 200, speed: 20, size: 56, color: '#00C896', angle: 0 },
    { seed: 'Zoe', distance: 320, speed: 35, size: 64, color: '#FFA000', angle: 72 },
    { seed: 'Leo', distance: 440, speed: 50, size: 60, color: '#9B51E0', angle: 144 },
    { seed: 'Maya', distance: 560, speed: 65, size: 72, color: '#E05C5C', angle: 216 },
    { seed: 'Sam', distance: 700, speed: 85, size: 56, color: '#C9A96E', angle: 288 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-70 dark:opacity-50 z-0">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Central Hub in Background */}
        <div className="absolute w-32 h-32 rounded-full bg-primary-light/30 dark:bg-primary-dark/30 flex items-center justify-center blur-2xl animate-pulse"></div>
        
        {members.map((m, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-dashed border-primary-light/20 dark:border-primary-dark/20"
            style={{ width: m.distance * 2, height: m.distance * 2 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: m.speed, repeat: Infinity, ease: "linear" }}
              className="w-full h-full relative"
              style={{ rotate: m.angle }}
            >
              <div 
                className="absolute left-1/2 -translate-x-1/2 overflow-hidden border-2 rounded-full shadow-2xl"
                style={{ 
                  width: m.size, 
                  height: m.size, 
                  top: -(m.size / 2),
                  borderColor: m.color,
                  backgroundColor: 'white'
                }}
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${m.seed}`} alt="member" className="w-full h-full object-cover bg-white" />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BackgroundOrbit;
