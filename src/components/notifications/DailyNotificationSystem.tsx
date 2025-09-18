import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';

interface DailyNotificationSystemProps {
  quotations: Quotation[];
  invoices: InvoiceData[];
}

interface NotificationData {
  id: string;
  type: 'quotation' | 'invoice';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  icon: React.ReactNode;
  data: any;
}

const DailyNotificationSystem: React.FC<DailyNotificationSystemProps> = ({
  quotations,
  invoices
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  // Check if it's time to show notifications (Every day at 9 AM)
  const shouldShowNotifications = useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Show daily at 9:00 AM (with 5 minute window)
    const isNotificationTime = hour === 9 && minute >= 0 && minute < 5;
    
    // TEST MODE: For demonstration, also show if there are notifications (remove this in production)
    const testMode = true; // Set to false in production
    const hasData = quotations.length > 0 || invoices.length > 0;
    
    // Check if we already showed notification today
    const lastShown = localStorage.getItem('lastNotificationDate');
    const today = now.toDateString();
    const alreadyShownToday = lastShown === today;
    
    // For testing, reset the localStorage daily check if needed
    if (testMode && !alreadyShownToday && hasData) {
      return true;
    }
    
    return isNotificationTime && !alreadyShownToday;
  }, [quotations.length, invoices.length]);

  // Generate notification data based on quotations and invoices
  const generateNotifications = useCallback(() => {
    const newNotifications: NotificationData[] = [];
    const now = new Date();

    // Pending quotations
    const pendingQuotations = quotations.filter(q => q.status === 'pending');
    if (pendingQuotations.length > 0) {
      newNotifications.push({
        id: 'pending-quotations',
        type: 'quotation',
        title: 'Pending Quotations',
        message: `You have ${pendingQuotations.length} quotation${pendingQuotations.length > 1 ? 's' : ''} awaiting ${user?.role === 'admin' ? 'approval' : 'response'}`,
        priority: 'high',
        icon: <Clock className="w-5 h-5 text-amber-500" />,
        data: pendingQuotations
      });
    }

    // Recently won quotations
    const recentlyWon = quotations.filter(q => {
      if (q.status !== 'won') return false;
      const quotationDate = new Date(q.createdAt);
      const daysDiff = Math.floor((now.getTime() - quotationDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    if (recentlyWon.length > 0) {
      const totalValue = recentlyWon.reduce((sum, q) => sum + q.clientQuote, 0);
      newNotifications.push({
        id: 'recent-wins',
        type: 'quotation',
        title: 'Recent Wins!',
        message: `${recentlyWon.length} quotation${recentlyWon.length > 1 ? 's' : ''} won this week worth ${recentlyWon[0]?.currency || 'USD'} ${totalValue.toLocaleString()}`,
        priority: 'high',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        data: recentlyWon
      });
    }

    // Overdue invoices
    const overdueInvoices = invoices.filter(inv => {
      if (inv.status !== 'pending' || !inv.dueDate) return false;
      const dueDate = new Date(inv.dueDate);
      return now > dueDate;
    });

    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      newNotifications.push({
        id: 'overdue-invoices',
        type: 'invoice',
        title: 'Overdue Invoices',
        message: `${overdueInvoices.length} invoice${overdueInvoices.length > 1 ? 's' : ''} overdue totaling ${overdueInvoices[0]?.currency || 'USD'} ${totalOverdue.toLocaleString()}`,
        priority: 'high',
        icon: <DollarSign className="w-5 h-5 text-red-500" />,
        data: overdueInvoices
      });
    }

    // Paid invoices this week
    const recentlyPaid = invoices.filter(inv => {
      if (inv.status !== 'paid') return false;
      const paidDate = new Date(inv.createdAt);
      const daysDiff = Math.floor((now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    });

    if (recentlyPaid.length > 0) {
      const totalPaid = recentlyPaid.reduce((sum, inv) => sum + inv.totalAmount, 0);
      newNotifications.push({
        id: 'recent-payments',
        type: 'invoice',
        title: 'Payments Received',
        message: `${recentlyPaid.length} payment${recentlyPaid.length > 1 ? 's' : ''} received this week totaling ${recentlyPaid[0]?.currency || 'USD'} ${totalPaid.toLocaleString()}`,
        priority: 'medium',
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        data: recentlyPaid
      });
    }

    return newNotifications;
  }, [quotations, invoices, user?.role]);

  // Check and show notifications
  useEffect(() => {
    if (shouldShowNotifications()) {
      const newNotifications = generateNotifications();
      if (newNotifications.length > 0) {
        setNotifications(newNotifications);
        setIsVisible(true);
        setCurrentNotificationIndex(0);
        
        // Mark as shown today
        localStorage.setItem('lastNotificationDate', new Date().toDateString());
      }
    }
  }, [shouldShowNotifications, generateNotifications]);

  // Auto-cycle through notifications
  useEffect(() => {
    if (isVisible && notifications.length > 1) {
      const timer = setTimeout(() => {
        setCurrentNotificationIndex(prev => (prev + 1) % notifications.length);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, notifications.length, currentNotificationIndex]);

  // Auto-hide after showing all notifications
  useEffect(() => {
    if (isVisible && notifications.length > 0) {
      const totalDuration = notifications.length * 4000 + 2000;
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, totalDuration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, notifications.length]);

  if (!isVisible || notifications.length === 0) return null;

  const currentNotification = notifications[currentNotificationIndex];

  return (
    <div className="professional-notification-zone">
      <div className={`
        professional-notification-item professional-toast w-96 max-w-sm
        transform transition-all duration-700 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100 animate-professional-slide-in' : 'translate-x-full opacity-0 scale-95 animate-professional-slide-out'}
        hover:scale-102 hover:-translate-x-1
        animate-subtle-glow-pulse --glow-color:rgba(59,130,246,0.3)
      `}>
        <div className="overflow-hidden backdrop-blur-xl">
          {/* Professional Header with Enhanced Gradient */}
          <div className="bg-gradient-to-r from-primary via-primary-glow to-primary-dark p-4 text-primary-foreground shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 animate-pulse drop-shadow-lg" />
                <span className="font-semibold text-sm tracking-wide">Daily Business Summary</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-white/20 rounded-full p-1.5 transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <X className="w-4 h-4 drop-shadow-lg" />
              </button>
            </div>
          </div>

          {/* Professional Content Area */}
          <div className="p-5 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-900/80">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1 p-2 rounded-full bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm shadow-lg">
                {currentNotification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm mb-2 tracking-tight">
                  {currentNotification.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {currentNotification.message}
                </p>
              </div>
            </div>

            {/* Enhanced Priority and Navigation */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full shadow-lg animate-pulse ${
                  currentNotification.priority === 'high' ? 'bg-red-400 shadow-red-400/50' :
                  currentNotification.priority === 'medium' ? 'bg-yellow-400 shadow-yellow-400/50' :
                  'bg-green-400 shadow-green-400/50'
                }`} />
                <span className="text-xs text-muted-foreground capitalize font-medium tracking-wide">
                  {currentNotification.priority} Priority
                </span>
              </div>
              
              {notifications.length > 1 && (
                <div className="flex gap-2">
                  {notifications.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentNotificationIndex 
                          ? 'bg-primary scale-125 shadow-lg shadow-primary/50' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Professional Footer */}
          <div className="bg-gradient-to-r from-gray-50/90 via-blue-50/60 to-indigo-50/30 dark:from-slate-700/50 dark:via-slate-800/30 dark:to-slate-900/20 px-5 py-3 border-t border-border/20 backdrop-blur-sm">
            <p className="text-xs text-muted-foreground text-center font-medium tracking-wide">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })} • Daily Operations Update
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyNotificationSystem;