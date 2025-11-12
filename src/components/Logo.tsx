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
      {/* Logo Icon */}
      <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg`}>
        <svg
          viewBox="0 0 40 20"
          className="w-3/4 h-3/4 text-white"
          fill="currentColor"
        >
          {/* R */}
          <path d="M4 2 L4 18 L6 18 L6 11 L11 11 C13.5 11 15 9.5 15 7 C15 4.5 13.5 3 11 3 L4 3 Z M6 5 L11 5 C12 5 13 6 13 7 C13 8 12 9 11 9 L6 9 Z M11 9 L14 18 L16 18 L13 9" />
          
          {/* F */}
          <path d="M20 2 L20 18 L22 18 L22 11 L30 11 L30 9 L22 9 L22 4 L32 4 L32 2 Z" />
        </svg>
      </div>
      
      {/* App Name */}
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          RestForge
        </span>
      )}
    </div>
  );
}