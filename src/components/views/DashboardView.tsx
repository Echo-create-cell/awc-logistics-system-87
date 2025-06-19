
import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentQuotations from '@/components/dashboard/RecentQuotations';
import UserActivityMonitor from '@/components/admin/UserActivityMonitor';
import UserLogsMonitor from '@/components/admin/UserLogsMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface DashboardViewProps {
  user: User;
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
  onTabChange: (tab: string) => void;
}

const DashboardView = ({ user, users, quotations, invoices, onTabChange }: DashboardViewProps) => {
  const recentPendingQuotations = quotations
    .filter(q => {
      if (user.role === 'admin') {
        return q.status === 'pending';
      }
      if (user.role === 'sales_director' || user.role === 'sales_agent') {
        return q.status === 'pending' && q.quoteSentBy === user.name;
      }
      return false;
    })
    .slice(0, 5);

  const cardTitle = user.role === 'admin' ? 'Pending Quotation Approvals' : 'Your Recent Pending Quotations';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground text-lg">
          Welcome back, <span className="font-semibold text-blue-600">{user.name}</span>! Here's a comprehensive overview of your activities and system insights.
        </p>
      </div>

      <DashboardStats user={user} users={users} quotations={quotations} />

      {/* Enhanced Admin Section */}
      {user.role === 'admin' && (
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
      )}

      {/* Recent Quotations Section */}
      {(user.role === 'admin' || user.role === 'sales_director' || user.role === 'sales_agent') && recentPendingQuotations.length > 0 && (
        <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
              {cardTitle}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Review and manage your pending quotations
            </p>
          </CardHeader>
          <CardContent>
            <RecentQuotations 
              quotations={recentPendingQuotations} 
              userRole={user.role}
              setActiveTab={onTabChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Finance Officer Enhanced Dashboard */}
      {user.role === 'finance_officer' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-green-800">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">
                ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-green-600 mt-1">
                Total from {invoices.length} invoices
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-blue-800">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {invoices.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-orange-800">
                Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </div>
              <p className="text-sm text-orange-600 mt-1">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
