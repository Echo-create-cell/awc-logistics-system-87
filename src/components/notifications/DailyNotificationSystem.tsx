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
    <div className="fixed top-4 right-4 z-[99995] max-w-sm pointer-events-none">
      <div className={`
        transform transition-all duration-700 ease-out pointer-events-auto
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 animate-pulse" />
                <span className="font-semibold text-sm">Daily Business Summary</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-white/20 rounded-full p-1.5 transition-all duration-200 hover:scale-110"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {currentNotification.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                  {currentNotification.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {currentNotification.message}
                </p>
              </div>
            </div>

            {/* Priority indicator */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentNotification.priority === 'high' ? 'bg-red-400' :
                  currentNotification.priority === 'medium' ? 'bg-yellow-400' :
                  'bg-green-400'
                }`} />
                <span className="text-xs text-gray-500 capitalize">
                  {currentNotification.priority} Priority
                </span>
              </div>
              
              {notifications.length > 1 && (
                <div className="flex gap-1">
                  {notifications.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        index === currentNotificationIndex ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-600 text-center font-medium">
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