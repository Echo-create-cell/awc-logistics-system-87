import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Calculator, 
  Users, 
  Building, 
  FileText, 
  Download,
  Printer,
  Eye,
  Settings,
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  Shield,
  Award,
  Target
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import ProfessionalPDFReports from '@/components/reports/ProfessionalPDFReports';
import FinanceAccountingView from '@/components/finance/FinanceAccountingView';

interface ProfessionalRoleDashboardProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users?: User[];
}

const ProfessionalRoleDashboard = ({ user, quotations, invoices, users = [] }: ProfessionalRoleDashboardProps) => {
  const [activeView, setActiveView] = useState('overview');

  // Role-based dashboard configuration
  const getRoleConfig = () => {
    const configs = {
      admin: {
        title: 'Executive Administration Dashboard',
        subtitle: 'Complete system oversight and strategic management',
        icon: Crown,
        color: 'from-violet-500 to-purple-600',
        tabs: [
          { id: 'overview', label: 'Executive Overview', icon: Award },
          { id: 'reports', label: 'Professional Reports', icon: FileText },
          { id: 'finance', label: 'Financial Control', icon: Calculator },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'settings', label: 'System Settings', icon: Settings }
        ]
      },
      finance_officer: {
        title: 'Financial Management Dashboard',
        subtitle: 'Comprehensive financial analysis and reporting',
        icon: Calculator,
        color: 'from-emerald-500 to-green-600',
        tabs: [
          { id: 'overview', label: 'Financial Overview', icon: DollarSign },
          { id: 'reports', label: 'Financial Reports', icon: FileText },
          { id: 'finance', label: 'Accounting System', icon: Calculator },
          { id: 'analysis', label: 'Financial Analysis', icon: BarChart3 }
        ]
      },
      sales_director: {
        title: 'Sales Leadership Dashboard',
        subtitle: 'Sales performance and team management',
        icon: Target,
        color: 'from-blue-500 to-cyan-600',
        tabs: [
          { id: 'overview', label: 'Sales Overview', icon: TrendingUp },
          { id: 'reports', label: 'Sales Reports', icon: FileText },
          { id: 'team', label: 'Team Performance', icon: Users }
        ]
      },
      partner: {
        title: 'Partner Collaboration Dashboard',
        subtitle: 'Partnership insights and collaborative tools',
        icon: Building,
        color: 'from-teal-500 to-cyan-600',
        tabs: [
          { id: 'overview', label: 'Partner Overview', icon: Building },
          { id: 'reports', label: 'Partnership Reports', icon: FileText },
          { id: 'activity', label: 'Collaborative Activity', icon: Activity }
        ]
      }
    };

    return configs[user.role as keyof typeof configs] || configs.partner;
  };

  const config = getRoleConfig();

  // Calculate role-specific metrics
  const getMetrics = () => {
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
    const wonQuotations = quotations.filter(q => q.status === 'won');
    
    return {
      totalRevenue,
      pendingRevenue,
      quotationsWon: wonQuotations.length,
      totalQuotations: quotations.length,
      conversionRate: quotations.length > 0 ? (wonQuotations.length / quotations.length * 100) : 0,
      averageDealSize: wonQuotations.length > 0 ? wonQuotations.reduce((sum, q) => sum + q.clientQuote, 0) / wonQuotations.length : 0,
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length
    };
  };

  const metrics = getMetrics();

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Hero Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${metrics.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">Realized income</p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600 font-medium">Pending Revenue</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    ${metrics.pendingRevenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-500 mt-1">Expected income</p>
                </div>
                <TrendingUp className="h-10 w-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {metrics.conversionRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-purple-500 mt-1">Quotation success</p>
                </div>
                <Target className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {user.role === 'admin' && (
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-amber-700">
                      {metrics.activeUsers}
                    </p>
                    <p className="text-xs text-amber-500 mt-1">System users</p>
                  </div>
                  <Users className="h-10 w-10 text-amber-500" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Actions for {user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.replace('_', ' ').slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border-blue-200"
                onClick={() => setActiveView('reports')}
              >
                <FileText className="h-6 w-6" />
                <span>Generate Report</span>
              </Button>
              
              {(user.role === 'admin' || user.role === 'finance_officer') && (
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col gap-2 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 border-emerald-200"
                  onClick={() => setActiveView('finance')}
                >
                  <Calculator className="h-6 w-6" />
                  <span>Financial System</span>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border-purple-200"
              >
                <Printer className="h-6 w-6" />
                <span>Print Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role-specific insights */}
        {user.role === 'admin' && (
          <Card className="bg-gradient-to-br from-violet-50 to-purple-100 border-purple-200/50">
            <CardHeader>
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Executive Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{metrics.totalUsers}</p>
                  <p className="text-sm text-purple-600">Total System Users</p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">{metrics.totalQuotations}</p>
                  <p className="text-sm text-purple-600">Total Quotations</p>
                </div>
                <div className="text-center p-4 bg-white/50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-700">${metrics.averageDealSize.toLocaleString()}</p>
                  <p className="text-sm text-purple-600">Average Deal Size</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className={`bg-gradient-to-r ${config.color} text-white p-6 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <config.icon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{config.title}</h1>
                <p className="text-white/90">{config.subtitle}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {user.role.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 mb-8">
          {config.tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="reports">
          <ProfessionalPDFReports 
            user={user}
            quotations={quotations}
            invoices={invoices}
            users={users}
          />
        </TabsContent>

        {(user.role === 'admin' || user.role === 'finance_officer') && (
          <TabsContent value="finance">
            <FinanceAccountingView 
              user={user}
              quotations={quotations}
              invoices={invoices}
              users={users}
            />
          </TabsContent>
        )}

        {config.tabs.map((tab) => 
          !['overview', 'reports', 'finance'].includes(tab.id) && (
            <TabsContent key={tab.id} value={tab.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    {tab.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {tab.label} content will be implemented based on specific requirements.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )
        )}
      </Tabs>
    </div>
  );
};

export default ProfessionalRoleDashboard;