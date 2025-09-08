import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Building,
  Users,
  Calendar
} from 'lucide-react';
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
  
  const overdueInvoices = invoices.filter(invoice => {
    if (invoice.status === 'overdue') return true;
    if (invoice.status === 'pending' && invoice.dueDate) {
      return new Date(invoice.dueDate) < new Date();
    }
    return false;
  });

  const upcomingInvoices = invoices.filter(invoice => {
    if (invoice.status === 'pending' && invoice.dueDate) {
      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      const daysDiff = (dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7 && daysDiff > 0;
    }
    return false;
  });

  const recentTransactions = [...invoices, ...quotations]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
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
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">+12.5% from last month</span>
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
              {formatCurrency(metrics.totalProfit)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                Margin: {metrics.profitMargin?.toFixed(1)}%
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
              {formatCurrency(metrics.accountsReceivable)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-muted-foreground">
                {metrics.pendingInvoices} pending invoices
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4 text-purple-600" />
              Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics.operatingExpenses)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">-3.2% from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <span className="font-medium">{metrics.currentRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Quick Ratio</span>
              <span className="font-medium">{metrics.quickRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cash Ratio</span>
              <span className="font-medium">0.65</span>
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
              <span className="font-medium">{metrics.profitMargin?.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Net Margin</span>
              <span className="font-medium">8.3%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ROE</span>
              <span className="font-medium">15.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Efficiency Ratios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Asset Turnover</span>
              <span className="font-medium">1.4x</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Receivables Days</span>
              <span className="font-medium">32 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="font-medium">{metrics.winRate?.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountingDashboard;