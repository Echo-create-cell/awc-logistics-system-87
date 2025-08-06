
import React from 'react';
import DashboardStats from '@/components/DashboardStats';
import RecentQuotations from '@/components/dashboard/RecentQuotations';
import UserActivityMonitor from '@/components/admin/UserActivityMonitor';
import UserLogsMonitor from '@/components/admin/UserLogsMonitor';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import ReportsCharts from '@/components/reports/ReportsCharts';
import PartnerDataFilter from '@/components/partner/PartnerDataFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useReportsData } from '@/hooks/useReportsData';

interface DashboardViewProps {
  user: User;
  users: User[];
  quotations: Quotation[];
  invoices: InvoiceData[];
  onTabChange: (tab: string) => void;
}

const DashboardView = ({ user, users, quotations, invoices, onTabChange }: DashboardViewProps) => {
  // Create users array for reports data
  const mockUsers: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Sales Director', email: 'director@example.com', role: 'sales_director', status: 'active', createdAt: new Date().toISOString() },
    { id: '3', name: 'Finance Officer', email: 'finance@example.com', role: 'finance_officer', status: 'active', createdAt: new Date().toISOString() }
  ];

  const { reportData } = useReportsData(quotations, invoices, mockUsers);

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Complete system oversight and user management';
      case 'sales_director':
        return 'Lead sales operations and strategic quotations';
      case 'sales_agent':
        return 'Manage customer relationships and quotations';
      case 'finance_officer':
        return 'Oversee financial operations and reporting';
      case 'partner':
        return 'Access comprehensive business insights and analytics';
      default:
        return 'Welcome to AWC Logistics Management System';
    }
  };

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
    <div className="space-y-8 animate-fade-in">
      <div className="relative overflow-hidden bg-gradient-subtle p-8 rounded-2xl border shadow-large">
        <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        <div className="relative z-10">
          <h1 className="heading-primary mb-3">
            Welcome, {user.name}
          </h1>
          <p className="text-body text-lg">
            {getRoleDescription(user.role)}
          </p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl"></div>
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
        <Card className="glass-effect hover-lift">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-display font-semibold text-foreground">
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
          <Card className="hover-lift bg-gradient-to-br from-success/5 to-success/10 border-success/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-semibold text-success">
                Monthly Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-success">
                ${invoices.reduce((sum, inv) => sum + inv.totalAmount, 0).toLocaleString()}
              </div>
              <p className="text-sm text-success/70 mt-2">
                Total from {invoices.length} invoices
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-semibold text-primary">
                Pending Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-primary">
                {invoices.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-sm text-primary/70 mt-2">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card className="hover-lift bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display font-semibold text-warning">
                Overdue Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-display text-warning">
                {invoices.filter(inv => inv.status === 'overdue').length}
              </div>
              <p className="text-sm text-warning/70 mt-2">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Partner Enhanced Analytics Dashboard */}
      {user.role === 'partner' && reportData && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Business Analytics & Reports
            </h2>
            <p className="text-muted-foreground">
              Full access to comprehensive business intelligence, data analysis, and PDF reporting with date interval filtering
            </p>
            <div className="flex gap-2 mt-4">
              <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
                ✓ Complete Data Analysis
              </div>
              <div className="px-3 py-1 bg-success/10 text-success text-sm rounded-full border border-success/20">
                ✓ PDF Export Reports
              </div>
              <div className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20">
                ✓ Date Range Filtering
              </div>
            </div>
          </div>

          {/* Partner Data Filter & Export */}
          <PartnerDataFilter
            user={user}
            quotations={quotations}
            invoices={invoices}
            users={users}
            title="Dashboard Data Analysis & Export"
          />

          {/* Financial Metrics Overview */}
          <FinancialMetricsCards metrics={reportData.metrics} />

          {/* Analytics Charts */}
          <ReportsCharts reportData={reportData} />

          {/* Additional Partner Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover-lift bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold text-primary">
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Active Quotations</span>
                  <span className="text-lg font-bold text-primary">{quotations.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-lg font-bold text-success">{reportData.metrics.winRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Deal Value</span>
                  <span className="text-lg font-bold text-accent">${reportData.metrics.avgDealSize.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardHeader>
                <CardTitle className="text-lg font-display font-semibold text-success">
                  Revenue Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-lg font-bold text-success">${reportData.metrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Profit</span>
                  <span className="text-lg font-bold text-primary">${reportData.metrics.totalProfit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Profit Margin</span>
                  <span className="text-lg font-bold text-accent">
                    {reportData.metrics.totalRevenue > 0 
                      ? ((reportData.metrics.totalProfit / reportData.metrics.totalRevenue) * 100).toFixed(1)
                      : '0'
                    }%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
