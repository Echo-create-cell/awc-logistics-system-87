import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ModalWrapperProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconVariant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
  full: 'sm:max-w-5xl'
};

const iconVariantClasses = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
};

export const ModalWrapper: React.FC<ModalWrapperProps> = ({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  iconVariant = 'default',
  badge,
  size = 'md',
  children,
  className = ''
}) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className={`${sizeClasses[size]} bg-card text-card-foreground border border-border/20 shadow-large ${className}`}>
        <DialogHeader className="pb-6 border-b border-border/10">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className={`p-2.5 rounded-lg ${iconVariantClasses[iconVariant]} shadow-soft`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-3">
                {title}
                {badge && (
                  <Badge variant={badge.variant || 'default'} className="text-xs">
                    {badge.text}
                  </Badge>
                )}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground mt-1.5 leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};