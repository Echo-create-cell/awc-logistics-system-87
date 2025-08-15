import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'warning' | 'error' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
}

const variantClasses = {
  default: 'border-border bg-card',
  warning: 'border-warning/30 bg-warning/5',
  error: 'border-destructive/30 bg-destructive/5',
  success: 'border-success/30 bg-success/5',
  info: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20'
};

const iconVariantClasses = {
  default: 'text-muted-foreground',
  warning: 'text-warning',
  error: 'text-destructive', 
  success: 'text-success',
  info: 'text-blue-600 dark:text-blue-400'
};

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon: Icon,
  variant = 'default',
  children,
  className = ''
}) => {
  return (
    <Card className={`${variantClasses[variant]} shadow-soft ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          {Icon && <Icon className={`h-4 w-4 ${iconVariantClasses[variant]}`} />}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {description}
          </p>
        )}
        
        {children}
      </CardContent>
    </Card>
  );
};