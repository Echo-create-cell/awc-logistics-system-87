import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'success' | 'warning';
  icon?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

interface ActionButtonGroupProps {
  buttons: ActionButton[];
  alignment?: 'left' | 'center' | 'right' | 'between';
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const alignmentClasses = {
  left: 'justify-start',
  center: 'justify-center', 
  right: 'justify-end',
  between: 'justify-between'
};

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  buttons,
  alignment = 'right',
  className = '',
  size = 'default'
}) => {
  return (
    <div className={`flex items-center gap-3 ${alignmentClasses[alignment]} ${className}`}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant || 'default'}
          size={size}
          onClick={button.onClick}
          disabled={button.disabled || button.loading}
          className={`gap-2 interactive-button ${button.className || ''}`}
        >
          {button.icon && <button.icon className="h-4 w-4" />}
          {button.loading ? 'Loading...' : button.label}
        </Button>
      ))}
    </div>
  );
};