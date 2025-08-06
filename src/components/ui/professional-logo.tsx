import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { processLogoForTransparency } from '@/utils/logoProcessor';

interface ProfessionalLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'sidebar' | 'header' | 'invoice';
  showGlow?: boolean;
  animated?: boolean;
}

const sizeClasses = {
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto', 
  lg: 'h-12 w-auto',
  xl: 'h-16 w-auto'
};

const variantClasses = {
  default: 'bg-white rounded-lg shadow-sm p-2 filter brightness-100',
  sidebar: 'bg-white rounded-md shadow-sm p-1.5 filter brightness-100 opacity-90 hover:opacity-100',
  header: 'bg-white rounded-lg shadow-md p-2 filter brightness-100 drop-shadow-lg',
  invoice: 'bg-white rounded-md shadow-sm p-1.5 filter brightness-100 opacity-95'
};

export const ProfessionalLogo: React.FC<ProfessionalLogoProps> = ({
  className,
  size = 'md',
  variant = 'default',
  showGlow = false,
  animated = false
}) => {
  const [logoSrc, setLogoSrc] = useState('/lovable-uploads/42894000-b0f9-4208-a908-0ff700e4e3b3.png');

  // Remove the background processing since we want white background for visibility
  // useEffect(() => {
  //   const processLogo = async () => {
  //     try {
  //       setIsProcessing(true);
  //       console.log('Starting logo background removal...');
  //       const transparentLogo = await processLogoForTransparency(logoSrc);
  //       setLogoSrc(transparentLogo);
  //       console.log('Logo background removal completed');
  //     } catch (error) {
  //       console.error('Failed to process logo:', error);
  //       // Keep original logo as fallback
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };

  //   // Process logo for all variants to make it transparent
  //   processLogo();
  // }, [variant]);

  return (
    <div className={cn(
      'relative inline-block',
      animated && 'transition-all duration-300 hover:scale-105',
      showGlow && 'hover:drop-shadow-glow',
      variantClasses[variant],
      className
    )}>
      <img
        src={logoSrc}
        alt="AWC Africa World Cargo"
        className={cn(
          sizeClasses[size],
          animated && 'transition-all duration-300',
          'object-contain max-w-none'
        )}
        style={{
          filter: showGlow ? 'drop-shadow(0 0 20px hsl(var(--primary) / 0.3))' : undefined
        }}
      />
      {showGlow && (
        <div 
          className="absolute inset-0 -z-10 rounded-lg"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)',
            filter: 'blur(20px)'
          }}
        />
      )}
    </div>
  );
};
