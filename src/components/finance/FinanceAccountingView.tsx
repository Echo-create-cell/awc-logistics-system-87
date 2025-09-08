import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useReportsData } from '@/hooks/useReportsData';
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  PieChart, 
  DollarSign, 
  Building, 
  Receipt,
  Download,
  Printer,
  FileBarChart,
  Users,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import FinancialStatements from './FinancialStatements';
import AccountingDashboard from './AccountingDashboard';
import TaxReporting from './TaxReporting';
import AuditTrail from './AuditTrail';
import CashFlowManagement from './CashFlowManagement';
import FinancialAnalytics from './FinancialAnalytics';
import { generateAccountingReport, generateTaxReport, generateAuditReport } from './AccountingReportUtils';
import { 
  operationalExpenses, 
  pendingClientPayments, 
  expenseSummary, 
  getTotalExpensesInUSD, 
  getUrgentPaymentsInUSD, 
  getOverdueExpenses, 
  getCashFlowProjection,
  USD_TO_RWF_RATE 
} from '@/data/operationalExpenses';

interface FinanceAccountingViewProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users?: User[];
}

const FinanceAccountingView = ({ user, quotations, invoices, users = [] }: FinanceAccountingViewProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportPeriod, setReportPeriod] = useState({
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const { reportData } = useReportsData(quotations, invoices, users);

  // Enhanced financial metrics using real operational data
  const totalRevenue = reportData?.metrics?.totalRevenue || 0;
  const totalProfit = reportData?.metrics?.totalProfit || 0;
  const accountsReceivable = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0);
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.totalAmount, 0);
  
  // Real operational expenses from September 2025 data
  const operatingExpensesUSD = getTotalExpensesInUSD();
  const urgentPaymentsUSD = getUrgentPaymentsInUSD();
  const overdueExpenses = getOverdueExpenses();
  const expectedReceivables = expenseSummary.pendingClientPaymentsUSD;
  const cashFlowProjection = getCashFlowProjection();
  
  const taxLiability = totalRevenue * 0.18; // 18% VAT rate
  
  const accountingMetrics = {
    ...reportData?.metrics,
    accountsReceivable: accountsReceivable + expectedReceivables,
    accountsPayable: urgentPaymentsUSD,
    currentRatio: accountsReceivable > 0 ? (paidAmount + accountsReceivable + expectedReceivables) / (operatingExpensesUSD + taxLiability) : 1.2,
    quickRatio: accountsReceivable > 0 ? (paidAmount + expectedReceivables) / (operatingExpensesUSD + taxLiability) : 0.8,
    debtToEquity: operatingExpensesUSD > 0 ? operatingExpensesUSD / (totalRevenue + accountsReceivable + expectedReceivables) : 0.3,
    profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
    operatingExpenses: operatingExpensesUSD,
    netIncome: totalProfit - taxLiability,
    taxLiability,
    overdueAmount: overdueAmount + urgentPaymentsUSD,
    paidAmount,
    cashFlow: cashFlowProjection,
    workingCapital: (accountsReceivable + expectedReceivables) - operatingExpensesUSD,
    revenueGrowth: 12.5,
    expenseRatio: totalRevenue > 0 ? (operatingExpensesUSD / totalRevenue) * 100 : 0,
    // Additional real operational metrics
    totalExpensesRWF: expenseSummary.totalRWF,
    totalExpensesUSD: expenseSummary.totalUSD,
    urgentPayments: urgentPaymentsUSD,
    overdueExpensesCount: overdueExpenses.length,
    pendingClientPaymentsAmount: expectedReceivables,
    operationalExpenses,
    pendingClientPayments: pendingClientPayments
  };

  const handleExportAccountingReport = async () => {
    await generateAccountingReport(invoices, quotations, reportData, user, reportPeriod);
  };

  const handleExportTaxReport = async () => {
    await generateTaxReport(invoices, quotations, accountingMetrics, user, reportPeriod);
  };

  const handleExportAuditReport = async () => {
    await generateAuditReport(invoices, quotations, users, user, reportPeriod);
  };

  // Role-based access control
  if (user.role !== 'finance_officer' && user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">Only Finance Officers and Administrators can access the accounting system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Calculator className="h-8 w-8 text-primary" />
            Finance & Accounting System
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional financial accounting, reporting, and analysis dashboard for comprehensive business management.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAccountingReport} className="flex items-center gap-2">
            <FileBarChart size={16} />
            Accounting Report
          </Button>
          <Button variant="outline" onClick={handleExportTaxReport} className="flex items-center gap-2">
            <Receipt size={16} />
            Tax Report
          </Button>
          <Button variant="outline" onClick={handleExportAuditReport} className="flex items-center gap-2">
            <Users size={16} />
            Audit Trail
          </Button>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-700">
              <DollarSign className="h-4 w-4" />
              Net Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              ${accountingMetrics.netIncome.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600 mt-1">
              Profit margin: {accountingMetrics.profitMargin.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <Building className="h-4 w-4" />
              Accounts Receivable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              ${accountingMetrics.accountsReceivable.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {invoices.filter(i => i.status === 'pending').length} pending invoices
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
              <TrendingUp className="h-4 w-4" />
              Current Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {accountingMetrics.currentRatio.toFixed(2)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Financial health indicator
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
              <PieChart className="h-4 w-4" />
              Debt-to-Equity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">
              {accountingMetrics.debtToEquity.toFixed(2)}
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Leverage ratio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Accounting Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="statements" className="flex items-center gap-2">
            <FileBarChart className="h-4 w-4" />
            Statements
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Tax Reporting
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
          <AccountingDashboard 
            metrics={accountingMetrics}
            invoices={invoices}
            quotations={quotations}
            reportData={reportData}
            user={user}
          />
        </TabsContent>

        <TabsContent value="statements" className="mt-6">
          <FinancialStatements 
            metrics={accountingMetrics}
            invoices={invoices}
            quotations={quotations}
            reportPeriod={reportPeriod}
            onPeriodChange={setReportPeriod}
            user={user}
          />
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <CashFlowManagement 
            invoices={invoices}
            quotations={quotations}
            metrics={accountingMetrics}
            reportPeriod={reportPeriod}
            user={user}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <FinancialAnalytics 
            reportData={reportData}
            metrics={accountingMetrics}
            invoices={invoices}
            quotations={quotations}
            user={user}
          />
        </TabsContent>

        <TabsContent value="tax" className="mt-6">
          <TaxReporting 
            invoices={invoices}
            quotations={quotations}
            metrics={accountingMetrics}
            reportPeriod={reportPeriod}
            onPeriodChange={setReportPeriod}
            user={user}
          />
        </TabsContent>

        <TabsContent value="audit" className="mt-6">
          <AuditTrail 
            invoices={invoices}
            quotations={quotations}
            users={users}
            reportPeriod={reportPeriod}
            user={user}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinanceAccountingView;