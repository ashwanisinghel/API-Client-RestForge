import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Modern Elegant Logo Icon - Geometric Design */}
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30`}>
        <svg
          viewBox="0 0 32 32"
          className="w-4/5 h-4/5"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="100%" stopColor="#F3F4F6" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          
          {/* Central node */}
          <circle cx="16" cy="16" r="4" fill="url(#logo-gradient)" />
          
          {/* Connecting lines to nodes */}
          <line x1="16" y1="12" x2="16" y2="8" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="16" x2="24" y2="16" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="16" y1="20" x2="16" y2="24" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="12" y1="16" x2="8" y2="16" stroke="url(#logo-gradient)" strokeWidth="1.5" strokeLinecap="round" />
          
          {/* Corner nodes */}
          <circle cx="16" cy="8" r="2" fill="url(#logo-gradient)" />
          <circle cx="24" cy="16" r="2" fill="url(#logo-gradient)" />
          <circle cx="16" cy="24" r="2" fill="url(#logo-gradient)" />
          <circle cx="8" cy="16" r="2" fill="url(#logo-gradient)" />
          
          {/* Diagonal connections for modern look */}
          <line x1="18" y1="14" x2="22" y2="10" stroke="url(#logo-gradient)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="18" y1="18" x2="22" y2="22" stroke="url(#logo-gradient)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="14" y1="18" x2="10" y2="22" stroke="url(#logo-gradient)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="14" y1="14" x2="10" y2="10" stroke="url(#logo-gradient)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
        </svg>
      </div>
      
      {/* App Name with elegant typography */}
      {showText && (
        <span className={`font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-500 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          RestForge
        </span>
      )}
    </div>
  );
}