import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className = ''
}) => {
  const variants = {
    default: "bg-white/10 text-white border border-white/20",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    warning: "bg-highlight/20 text-highlight border border-highlight/30",
    info: "bg-accent/20 text-accent border border-accent/30"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
