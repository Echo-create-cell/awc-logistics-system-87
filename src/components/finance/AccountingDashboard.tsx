import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Building,
  PieChart,
  BarChart3,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { operationalExpenses, pendingClientPayments, expenseSummary, USD_TO_RWF_RATE } from '@/data/operationalExpenses';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { ReportData } from '@/types/reports';

interface AccountingDashboardProps {
  metrics: any;
  invoices: InvoiceData[];
  quotations: Quotation[];
  reportData?: ReportData;
  user: User;
}

const AccountingDashboard = ({ metrics, invoices, quotations, reportData, user }: AccountingDashboardProps) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  
  // Real operational alerts based on actual September 2025 data
  const overdueExpenses = operationalExpenses.filter(expense => expense.status === 'overdue');
  const urgentExpenses = operationalExpenses.filter(expense => expense.urgent > 0);
  
  const criticalAlerts = [
    ...(overdueExpenses.length > 0 ? [{
      type: 'critical' as const,
      message: `${overdueExpenses.length} overdue operational expenses totaling $${metrics.urgentPayments?.toLocaleString() || '0'}`,
      icon: AlertCircle
    }] : []),
    ...(urgentExpenses.length > 0 ? [{
      type: 'warning' as const,
      message: `${urgentExpenses.length} urgent payments require immediate attention`,
      icon: Clock
    }] : []),
    ...(metrics.currentRatio < 1.0 ? [{
      type: 'warning' as const,
      message: `Current ratio of ${metrics.currentRatio.toFixed(2)} indicates potential liquidity issues`,
      icon: TrendingDown
    }] : []),
    ...(metrics.cashFlow < 0 ? [{
      type: 'critical' as const,
      message: `Negative cash flow projection of $${Math.abs(metrics.cashFlow).toLocaleString()}`,
      icon: AlertCircle
    }] : [])
  ];
  
  // Real-time operational data analysis
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status === 'overdue') return true;
    if (invoice.status === 'pending' && invoice.dueDate) {
      return new Date(invoice.dueDate) < new Date();
    }
    return false;
  });

  const pendingInvoicesValue = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
  const paidInvoicesValue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueValue = overdueInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  
  // Calculate month-over-month growth from real data
  const currentMonth = new Date().getMonth();
  const currentMonthInvoices = invoices.filter(i => new Date(i.createdAt).getMonth() === currentMonth);
  const currentMonthRevenue = currentMonthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  
  // Won quotations this month for business pipeline analysis  
  const wonQuotations = quotations.filter(q => q.status === 'won');
  const currentMonthQuotations = wonQuotations.filter(q => new Date(q.createdAt).getMonth() === currentMonth);
  const quotationRevenue = currentMonthQuotations.reduce((sum, q) => sum + q.clientQuote, 0);

  const upcomingInvoices = invoices.filter(invoice => {
    if (invoice.status === 'pending' && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7 && daysDiff > 0;
    }
    return false;
  });

  // Real-time activity based on actual system data
  const recentTransactions = [...invoices, ...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15); // Show more recent transactions for better business insight

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="mb-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="space-y-2">
                {criticalAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <alert.icon className="h-4 w-4" />
                    <span>{alert.message}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentMonthRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">This month revenue</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(quotationRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                From {currentMonthQuotations.length} won quotations
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Outstanding AR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(pendingInvoicesValue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {invoices.filter(i => i.status === 'pending').length} pending invoices
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-purple-600" />
              Overdue Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(overdueValue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-3 w-3 text-red-500" />
              <span className="text-xs text-red-600">{overdueInvoices.length} overdue invoices</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Operational Expense Monitoring */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-purple-700">
              <BarChart3 className="h-5 w-5" />
              September 2025 Operational Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600">Total Expenses</span>
                <div className="text-right">
                  <div className="font-semibold text-purple-700">
                    ${metrics.operatingExpenses.toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-500">
                    RWF {expenseSummary.totalRWF.toLocaleString()}
                  </div>
                </div>
              </div>
              <Progress 
                value={Math.min(100, (metrics.urgentPayments / metrics.operatingExpenses) * 100)} 
                className="h-2"
              />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 bg-white/50 rounded">
                  <div className="text-xs text-purple-600">Urgent Payments</div>
                  <div className="font-semibold text-red-600">
                    ${metrics.urgentPayments?.toLocaleString() || '0'}
                  </div>
                </div>
                <div className="text-center p-2 bg-white/50 rounded">
                  <div className="text-xs text-purple-600">Overdue Count</div>
                  <div className="font-semibold text-amber-600">
                    {overdueExpenses.length} items
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/70 rounded-lg">
                <div className="text-xs text-purple-600 mb-2">Expected Receivables</div>
                <div className="font-semibold text-green-600">
                  ${expenseSummary.pendingClientPaymentsUSD.toLocaleString()}
                </div>
                <div className="text-xs text-purple-500">
                  From {pendingClientPayments.length} clients
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Invoices ({overdueInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No overdue invoices</p>
            ) : (
              <div className="space-y-2">
                {overdueInvoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium text-sm">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="destructive">{formatCurrency(invoice.totalAmount)}</Badge>
                  </div>
                ))}
                {overdueInvoices.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{overdueInvoices.length - 3} more overdue invoices
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Due Dates ({upcomingInvoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices due this week</p>
            ) : (
              <div className="space-y-2">
                {upcomingInvoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div>
                      <p className="font-medium text-sm">{invoice.clientName}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <Badge variant="secondary">{formatCurrency(invoice.totalAmount)}</Badge>
                  </div>
                ))}
                {upcomingInvoices.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{upcomingInvoices.length - 3} more due this week
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Financial Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Financial Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction, index) => {
              const isInvoice = 'totalAmount' in transaction;
              const amount = isInvoice ? transaction.totalAmount : transaction.clientQuote;
              const date = new Date(transaction.createdAt).toLocaleDateString();
              
              return (
                <div key={`${transaction.id}-${index}`} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isInvoice ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {isInvoice ? (
                        <FileText className="h-4 w-4 text-green-600" />
                      ) : (
                        <Users className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {isInvoice ? 'Invoice' : 'Quotation'} - {transaction.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">{date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(amount)}</p>
                    <Badge 
                      variant={
                        transaction.status === 'paid' || transaction.status === 'won' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Liquidity Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Ratio</span>
              <span className="font-medium">{(metrics.currentRatio || 1.0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quick Ratio</span>
              <span className="font-medium">{(paidInvoicesValue / (metrics.operatingExpenses + metrics.taxLiability || 1)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cash Position</span>
              <span className="font-medium">{formatCurrency(paidInvoicesValue - metrics.operatingExpenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profitability Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gross Margin</span>
              <span className="font-medium">{metrics.profitMargin?.toFixed(1) || '0.0'}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Operating Margin</span>
              <span className="font-medium">{((quotationRevenue - metrics.operatingExpenses) / quotationRevenue * 100 || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="font-medium">{((wonQuotations.length / quotations.length) * 100 || 0).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Efficiency Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Deal Size</span>
              <span className="font-medium">{formatCurrency(quotations.length > 0 ? quotations.reduce((sum, q) => sum + q.clientQuote, 0) / quotations.length : 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Collection Period</span>
              <span className="font-medium">{overdueInvoices.length > 0 ? Math.round(overdueInvoices.reduce((sum, inv) => {
                const daysDiff = (new Date().getTime() - new Date(inv.dueDate || inv.createdAt).getTime()) / (1000 * 3600 * 24);
                return sum + daysDiff;
              }, 0) / overdueInvoices.length) : 0} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Clients</span>
              <span className="font-medium">{[...new Set([...quotations.map(q => q.clientName), ...invoices.map(i => i.clientName)])].length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;