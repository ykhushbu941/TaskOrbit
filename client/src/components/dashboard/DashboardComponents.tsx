import React from 'react';
import { motion } from 'framer-motion';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const KpiCard = ({ title, value, icon: Icon, trend, color = 'primary' }: KpiCardProps) => {
  const colorClasses = {
    primary: 'text-primary-light dark:text-primary-dark bg-primary-light/10 dark:bg-primary-dark/10',
    secondary: 'text-secondary-light dark:text-secondary-dark bg-secondary-light/10 dark:bg-secondary-dark/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    danger: 'text-danger bg-danger/10',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="card p-6 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-3 rounded-xl", colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isUp ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
          )}>
            {trend.isUp ? '+' : '-'}{trend.value}%
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-sans font-bold mt-1 text-text-primary-light dark:text-text-primary-dark">{value}</h3>
      </div>
    </motion.div>
  );
};

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  color?: string;
}

export const ProgressRing = ({ progress, size = 120, strokeWidth = 8, label, color = 'var(--primary)' }: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="rotate-[-90deg]" width={size} height={size}>
          <circle
            className="text-border-light dark:text-border-dark"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{progress}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{label}</span>
    </div>
  );
};
