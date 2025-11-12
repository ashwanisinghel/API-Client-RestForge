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
      {/* Clean Modern Logo Icon */}
      <div className={`${sizeClasses[size]} rounded-lg bg-primary flex items-center justify-center`}>
        <svg
          viewBox="0 0 32 32"
          className="w-3/4 h-3/4"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Lightning bolt for speed/API */}
          <path 
            d="M18 6L11 17H16L14 26L21 15H16L18 6Z" 
            fill="white" 
            stroke="white" 
            strokeWidth="0.5" 
            strokeLinejoin="round"
          />
        </svg>
      </div>
      
      {/* App Name */}
      {showText && (
        <span className={`font-semibold tracking-tight text-foreground ${textSizeClasses[size]}`}>
          RestForge
        </span>
      )}
    </div>
  );
}