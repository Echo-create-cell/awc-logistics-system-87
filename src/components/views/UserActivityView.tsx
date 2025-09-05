import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserActivityMonitor from '@/components/admin/UserActivityMonitor';
import UserLogsMonitor from '@/components/admin/UserLogsMonitor';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface UserActivityViewProps {
  user: User;
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
}

const UserActivityView = ({ user, users, quotations, invoices }: UserActivityViewProps) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow p-8 rounded-lg text-white shadow-large">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            User Performance Overview
          </h1>
          <p className="text-primary-foreground/90 text-lg">
            Monitor and analyze user activities, quotations, and performance metrics
          </p>
        </div>
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="activity" className="text-sm font-medium">
              User Activity Overview
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-sm font-medium">
              Detailed Activity Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-6">
            <UserActivityMonitor 
              users={users} 
              quotations={quotations} 
              invoices={invoices} 
            />
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-6">
            <UserLogsMonitor 
              users={users} 
              quotations={quotations} 
              invoices={invoices} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserActivityView;