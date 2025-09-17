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
 * 1. Consistent positioning (top-4 right-4)
 * 2. Proper z-index stacking order
 * 3. Professional spacing between different notification types
 * 4. Coordinated timing to prevent overlap
 */
export const NotificationManager: React.FC<NotificationManagerProps> = ({
  quotations = [],
  invoices = []
}) => {
  if (!NOTIFICATIONS_ENABLED) return null;

  return (
    <>
      {/* Z-Index Hierarchy (highest to lowest):
          99999: Standard Toast System (urgent system messages)
          99998: Persistent Notifications (user actions, confirmations)
          99997: System Notifications (inline notifications)
          99996: Daily Notifications (scheduled summaries)
          99995: Background Notifications (low priority) */}

      {/* Standard Toast System - Highest Priority */}
      <Toaster />

      {/* Persistent Toast System - High Priority */}
      <PersistentToaster />

      {/* Daily Notification System - Lower Priority */}
      <DailyNotificationSystem 
        quotations={quotations}
        invoices={invoices}
      />
    </>
  );
};

export default NotificationManager;