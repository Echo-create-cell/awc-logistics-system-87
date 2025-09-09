import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  FileText, 
  Printer, 
  Eye, 
  Share2,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Building,
  Shield,
  Award,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { 
  operationalExpenses, 
  pendingClientPayments, 
  expenseSummary, 
  getTotalExpensesInUSD, 
  getUrgentPaymentsInUSD 
} from '@/data/operationalExpenses';

interface ProfessionalPDFReportsProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users?: User[];
}

const ProfessionalPDFReports = ({ user, quotations, invoices, users = [] }: ProfessionalPDFReportsProps) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  // Role-based report access configuration
  const getRoleBasedReports = () => {
    const baseReports = [
      {
        id: 'financial-summary',
        title: 'Financial Summary Report',
        description: 'Comprehensive financial overview with key metrics and trends',
        icon: DollarSign,
        color: 'emerald',
        access: ['admin', 'finance_officer', 'sales_director']
      },
      {
        id: 'operational-expenses',
        title: 'Operational Expenses Analysis',
        description: 'Detailed breakdown of September 2025 operational expenses',
        icon: BarChart3,
        color: 'blue',
        access: ['admin', 'finance_officer']
      },
      {
        id: 'cash-flow',
        title: 'Cash Flow Statement',
        description: 'Professional cash flow analysis and projections',
        icon: TrendingUp,
        color: 'purple',
        access: ['admin', 'finance_officer']
      }
    ];

    const roleSpecificReports = {
      admin: [
        {
          id: 'executive-dashboard',
          title: 'Executive Dashboard Report',
          description: 'High-level business performance and strategic insights',
          icon: Award,
          color: 'gold',
          access: ['admin']
        },
        {
          id: 'user-activity',
          title: 'System User Activity Report',
          description: 'Comprehensive user activity and system usage analytics',
          icon: Users,
          color: 'indigo',
          access: ['admin']
        },
        {
          id: 'compliance-audit',
          title: 'Compliance & Audit Report',
          description: 'Regulatory compliance and internal audit documentation',
          icon: Shield,
          color: 'red',
          access: ['admin']
        }
      ],
      finance_officer: [
        {
          id: 'accounts-receivable',
          title: 'Accounts Receivable Report',
          description: 'Detailed AR aging and collection status analysis',
          icon: Target,
          color: 'amber',
          access: ['admin', 'finance_officer']
        },
        {
          id: 'tax-reporting',
          title: 'Tax Compliance Report',
          description: 'VAT, tax obligations, and regulatory filings',
          icon: FileText,
          color: 'orange',
          access: ['admin', 'finance_officer']
        }
      ],
      sales_director: [
        {
          id: 'sales-performance',
          title: 'Sales Performance Report',
          description: 'Sales metrics, quotation conversions, and pipeline analysis',
          icon: TrendingUp,
          color: 'green',
          access: ['admin', 'sales_director']
        }
      ],
      sales_agent: [
        {
          id: 'client-portfolio',
          title: 'Client Portfolio Report',
          description: 'Personal client relationships and quotation history',
          icon: Users,
          color: 'cyan',
          access: ['admin', 'sales_director', 'sales_agent']
        }
      ],
      partner: [
        {
          id: 'partner-dashboard',
          title: 'Partner Performance Report',
          description: 'Collaborative metrics and partnership insights',
          icon: Building,
          color: 'teal',
          access: ['admin', 'partner']
        }
      ]
    };

    const userRoleReports = roleSpecificReports[user.role as keyof typeof roleSpecificReports] || [];
    return [...baseReports, ...userRoleReports].filter(report => 
      report.access.includes(user.role)
    );
  };

  const generatePDFReport = async (reportId: string, reportTitle: string) => {
    setIsGenerating(reportId);
    
    try {
      // Simulate PDF generation with actual data processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create comprehensive report data based on type
      const reportData = generateReportData(reportId);
      
      // Generate CSV for now (can be enhanced to actual PDF later)
      const csvContent = generateCSVContent(reportId, reportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const generateReportData = (reportId: string) => {
    const currentDate = new Date().toLocaleDateString();
    const totalExpenses = getTotalExpensesInUSD();
    const urgentPayments = getUrgentPaymentsInUSD();
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);

    const baseData = {
      generatedBy: user.name || user.email,
      generatedOn: currentDate,
      reportPeriod: `${reportPeriod.from} to ${reportPeriod.to}`,
      totalRevenue,
      pendingRevenue,
      totalExpenses,
      urgentPayments,
      netPosition: (totalRevenue + pendingRevenue) - totalExpenses,
      totalQuotations: quotations.length,
      wonQuotations: quotations.filter(q => q.status === 'won').length,
      totalInvoices: invoices.length,
      overdueInvoices: invoices.filter(i => i.status === 'overdue').length
    };

    switch (reportId) {
      case 'financial-summary':
        return {
          ...baseData,
          operationalExpenses: operationalExpenses.slice(0, 10),
          clientPayments: pendingClientPayments,
          financialRatios: {
            liquidityRatio: ((totalRevenue + pendingRevenue) / totalExpenses).toFixed(2),
            profitMargin: (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(2)
          }
        };
      case 'operational-expenses':
        return {
          ...baseData,
          detailedExpenses: operationalExpenses,
          expenseBreakdown: {
            fixedCosts: operationalExpenses.reduce((sum, e) => sum + e.fixedCostPerMonth, 0),
            operationalCosts: operationalExpenses.reduce((sum, e) => sum + e.operationCost, 0),
            urgentItems: operationalExpenses.filter(e => e.urgent > 0).length
          }
        };
      case 'executive-dashboard':
        return {
          ...baseData,
          systemUsers: users.length,
          activeUsers: users.filter(u => u.status === 'active').length,
          businessMetrics: {
            avgDealSize: quotations.length > 0 ? (quotations.reduce((sum, q) => sum + q.clientQuote, 0) / quotations.length).toFixed(2) : 0,
            conversionRate: quotations.length > 0 ? ((quotations.filter(q => q.status === 'won').length / quotations.length) * 100).toFixed(1) : 0
          }
        };
      default:
        return baseData;
    }
  };

  const generateCSVContent = (reportId: string, data: any) => {
    const header = [
      [`Professional ${reportId.replace(/-/g, ' ').toUpperCase()} REPORT`],
      [`Generated by: ${data.generatedBy}`],
      [`Generated on: ${data.generatedOn}`],
      [`Report Period: ${data.reportPeriod}`],
      [''],
      ['EXECUTIVE SUMMARY'],
      ['Metric', 'Value'],
      ['Total Revenue', `$${data.totalRevenue.toLocaleString()}`],
      ['Pending Revenue', `$${data.pendingRevenue.toLocaleString()}`],
      ['Total Expenses', `$${data.totalExpenses.toLocaleString()}`],
      ['Net Position', `$${data.netPosition.toLocaleString()}`],
      ['Total Quotations', data.totalQuotations],
      ['Won Quotations', data.wonQuotations],
      ['Total Invoices', data.totalInvoices],
      ['']
    ];

    let content = [];
    
    if (reportId === 'operational-expenses' && data.detailedExpenses) {
      content = [
        ['DETAILED OPERATIONAL EXPENSES'],
        ['Description', 'Fixed Cost', 'Operation Cost', 'Urgent Amount', 'Status', 'Due Date', 'Comments'],
        ...data.detailedExpenses.map((expense: any) => [
          expense.description,
          expense.fixedCostPerMonth,
          expense.operationCost,
          expense.urgent,
          expense.status,
          expense.dueDate || 'N/A',
          expense.comment || 'N/A'
        ])
      ];
    }

    const footer = [
      [''],
      ['CONFIDENTIAL BUSINESS REPORT'],
      [`Generated from AWC Logistics Management System`],
      [`Report ID: ${reportId}-${Date.now()}`]
    ];

    return [...header, ...content, ...footer]
      .map(row => row.join(','))
      .join('\n');
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
      blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
      purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
      gold: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700',
      indigo: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700',
      red: 'from-red-50 to-red-100 border-red-200 text-red-700',
      amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
      orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-700',
      green: 'from-green-50 to-green-100 border-green-200 text-green-700',
      cyan: 'from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700',
      teal: 'from-teal-50 to-teal-100 border-teal-200 text-teal-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const availableReports = getRoleBasedReports();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            Professional PDF Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate comprehensive business reports with professional formatting for {user.role.replace('_', ' ')} level access.
          </p>
        </div>
        
        {/* Report Period Selector */}
        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-2">
            <input
              type="date"
              value={reportPeriod.from}
              onChange={(e) => setReportPeriod(prev => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={reportPeriod.to}
              onChange={(e) => setReportPeriod(prev => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <Badge variant="secondary" className="text-sm">
          Access Level: {user.role.replace('_', ' ').toUpperCase()}
        </Badge>
        <span className="text-sm text-muted-foreground">
          • {availableReports.length} reports available
        </span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total Expenses</p>
                <p className="text-xl font-bold text-blue-700">
                  ${getTotalExpensesInUSD().toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">Expected Revenue</p>
                <p className="text-xl font-bold text-emerald-700">
                  ${expenseSummary.pendingClientPaymentsUSD.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Active Quotations</p>
                <p className="text-xl font-bold text-purple-700">
                  {quotations.filter(q => q.status !== 'lost').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600">Pending Invoices</p>
                <p className="text-xl font-bold text-amber-700">
                  {invoices.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableReports.map((report) => (
          <Card 
            key={report.id} 
            className={`bg-gradient-to-br ${getColorClasses(report.color)} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-white/50">
                  <report.icon className="h-6 w-6" />
                </div>
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4 leading-relaxed">
                {report.description}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => generatePDFReport(report.id, report.title)}
                  disabled={isGenerating === report.id}
                  className="flex-1 bg-white/20 hover:bg-white/30 border border-white/30"
                  variant="outline"
                >
                  {isGenerating === report.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>Generate PDF</span>
                    </div>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 border border-white/30"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status Alert */}
      {(user.role === 'admin' || user.role === 'finance_officer') && (
        <Alert className="border-blue-200 bg-blue-50">
          <Activity className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <div className="flex items-center justify-between">
              <span>
                <strong>September 2025 Financial Status:</strong> {operationalExpenses.filter(e => e.status === 'overdue').length} overdue items requiring attention.
                Total urgent payments: ${getUrgentPaymentsInUSD().toLocaleString()}
              </span>
              <Button variant="outline" size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300">
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProfessionalPDFReports;