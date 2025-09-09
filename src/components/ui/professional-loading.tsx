import React from 'react';
import { Loader2, CheckCircle, FileText, Database, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalLoadingProps {
  isLoading: boolean;
  step?: string;
  progress?: number;
  className?: string;
}

export const ProfessionalLoading = ({
  isLoading,
  step = "Processing...",
  progress = 0,
  className
}: ProfessionalLoadingProps) => {
  if (!isLoading) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm", className)}>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100">
        <div className="text-center space-y-6">
          {/* Animated loader */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto relative">
              <Loader2 size={64} className="text-blue-600 animate-spin" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            </div>
          </div>
          
          {/* Step description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">Creating Invoice</h3>
            <p className="text-sm text-gray-600">{step}</p>
          </div>
          
          {/* Progress indicators */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <FileText size={14} />
                <span>Validating data</span>
              </div>
              <CheckCircle size={14} className="text-green-500" />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Database size={14} />
                <span>Saving to database</span>
              </div>
              <Loader2 size={14} className="animate-spin text-blue-500" />
            </div>
            
            <div className="flex justify-between items-center text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <Zap size={14} />
                <span>Finalizing invoice</span>
              </div>
              <div className="w-3 h-3 rounded-full border border-gray-300"></div>
            </div>
          </div>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Success animation component
interface ProfessionalSuccessProps {
  isVisible: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export const ProfessionalSuccess = ({
  isVisible,
  title = "Success!",
  description = "Operation completed successfully",
  onClose,
  autoClose = true,
  duration = 3000
}: ProfessionalSuccessProps) => {
  React.useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border border-green-100 animate-in zoom-in-95 duration-300">
        <div className="text-center space-y-4">
          {/* Success checkmark with animation */}
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600 animate-in zoom-in-50 duration-500" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-green-900">{title}</h3>
            <p className="text-sm text-green-700">{description}</p>
          </div>
          
          {/* Auto-close progress bar */}
          {autoClose && (
            <div className="w-full bg-green-100 rounded-full h-1">
              <div 
                className="bg-green-600 h-1 rounded-full transition-all duration-300 ease-linear"
                style={{
                  animation: `shrink ${duration}ms linear`,
                  width: '100%'
                }}
              ></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add the shrink animation to your CSS
const style = `
  @keyframes shrink {
    from { width: 100%; }
    to { width: 0%; }
  }
`;

// Inject the style if it doesn't exist
if (typeof document !== 'undefined' && !document.querySelector('#professional-loading-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'professional-loading-styles';
  styleElement.textContent = style;
  document.head.appendChild(styleElement);
}