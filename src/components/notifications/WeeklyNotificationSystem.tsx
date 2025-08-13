import React, { useEffect, useState, useCallback } from 'react';
import { Bell, X, TrendingUp, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useAuth } from '@/contexts/AuthContext';

interface WeeklyNotificationSystemProps {
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

const WeeklyNotificationSystem: React.FC<WeeklyNotificationSystemProps> = ({
  quotations,
  invoices
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);

  // Check if it's time to show notifications (Tuesday and Friday at 10 AM)
  const shouldShowNotifications = useCallback(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = now.getHours();
    
    // Show on Tuesday (2) and Friday (5) at 10 AM
    const isNotificationDay = dayOfWeek === 2 || dayOfWeek === 5;
    const isNotificationTime = hour >= 10 && hour < 11;
    
    // Check if we already showed notification today
    const lastShown = localStorage.getItem('lastNotificationDate');
    const today = now.toDateString();
    const alreadyShownToday = lastShown === today;
    
    return isNotificationDay && isNotificationTime && !alreadyShownToday;
  }, []);

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
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      <div className={`
        transform transition-all duration-500 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}>
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-semibold text-sm">Weekly Summary</span>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
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
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })} • Bi-weekly Summary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyNotificationSystem;