
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  className?: string; // Added className prop
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'light',
  className = '' // Default to empty string
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const colorClasses = {
    light: 'text-primary-foreground',
    dark: 'text-primary',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`font-bold ${sizeClasses[size]} ${colorClasses[variant]}`}>
        <span>Academic</span>
        <span className="text-secondary">Connect</span>
      </div>
    </div>
  );
};

export default Logo;
