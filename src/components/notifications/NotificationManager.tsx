import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { PersistentToaster } from '@/components/ui/persistent-toast';
import DailyNotificationSystem from '@/components/notifications/DailyNotificationSystem';
import { NOTIFICATIONS_ENABLED } from '@/config/features';

interface NotificationManagerProps {
  quotations?: any[];
  invoices?: any[];
}

/**
 * Centralized Notification Manager
 * 
 * This component manages all notification systems in a unified way to prevent
 * notifications from scattering across the screen. It ensures:
 * 
 * 1. Consistent positioning (fixed top-4 right-4 - EXACT SAME SPOT)
 * 2. Proper z-index stacking order (all notifications overlap in same position)
 * 3. Professional spacing between different notification types
 * 4. Coordinated timing to prevent overlap
 * 5. Overdue alerts positioned in same fixed location
 */
export const NotificationManager: React.FC<NotificationManagerProps> = ({
  quotations = [],
  invoices = []
}) => {
  if (!NOTIFICATIONS_ENABLED) return null;

  return (
    <div className="notification-container">
      {/* Z-Index Hierarchy (highest to lowest) - ALL OVERLAP IN SAME POSITION:
          99999: Standard Toast System (urgent system messages)
          99998: Persistent Notifications (user actions, confirmations)  
          99997: System Notifications (inline notifications)
          99996: Daily Notifications (scheduled summaries)
          99995: Overdue Notifications (positioned exactly the same) */}

      {/* All notification systems positioned at top-4 right-4 */}
      <Toaster />
      <PersistentToaster />
      
      {/* Daily Notification System - Same Fixed Position */}  
      <DailyNotificationSystem 
        quotations={quotations}
        invoices={invoices}
      />
    </div>
  );
};

export default NotificationManager;