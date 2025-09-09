import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  Building2,
  PieChart,
  BarChart3,
  Target,
  Clock
} from 'lucide-react';
import { 
  operationalExpenses, 
  pendingClientPayments, 
  expenseSummary, 
  USD_TO_RWF_RATE,
  getOverdueExpenses,
  getCashFlowProjection,
  getTotalExpensesInUSD,
  getUrgentPaymentsInUSD
} from '@/data/operationalExpenses';

const FinancialAnalysisReport = () => {
  const formatCurrency = (amount: number, currency = 'USD') => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    return `RWF ${amount.toLocaleString('en-US')}`;
  };

  // Calculate financial metrics
  const totalExpensesUSD = getTotalExpensesInUSD();
  const urgentPaymentsUSD = getUrgentPaymentsInUSD();
  const overdueExpenses = getOverdueExpenses();
  const cashFlowProjection = getCashFlowProjection();
  
  // Cash position analysis
  const expectedReceivables = expenseSummary.pendingClientPaymentsUSD;
  const netCashPosition = expectedReceivables - totalExpensesUSD;
  const liquidityRatio = expectedReceivables / totalExpensesUSD;
  
  // Urgency analysis
  const urgentPaymentRatio = (urgentPaymentsUSD / totalExpensesUSD) * 100;
  const overduePaymentRatio = (overdueExpenses.length / operationalExpenses.length) * 100;
  
  // Export functionality
  const handleExcelExport = () => {
    const csvContent = [
      ['September 2025 Financial Analysis Report'],
      ['Generated on:', new Date().toLocaleDateString()],
      [''],
      ['Expense Category', 'Amount (USD)', 'Amount (RWF)', 'Status', 'Due Date', 'Comments'],
      ...operationalExpenses.map(expense => [
        expense.description,
        expense.currency === 'USD' ? expense.fixedCostPerMonth + expense.operationCost : (expense.fixedCostPerMonth + expense.operationCost) / USD_TO_RWF_RATE,
        expense.currency === 'RWF' ? expense.fixedCostPerMonth + expense.operationCost : (expense.fixedCostPerMonth + expense.operationCost) * USD_TO_RWF_RATE,
        expense.status,
        expense.dueDate || 'N/A',
        expense.comment || 'N/A'
      ]),
      [''],
      ['Client Receivables'],
      ['Client Name', 'Amount (USD)', 'Status'],
      ...pendingClientPayments.map(payment => [
        payment.clientName,
        payment.amountUSD,
        payment.status
      ]),
      [''],
      ['Financial Summary'],
      ['Total Expenses (USD)', totalExpensesUSD.toFixed(2)],
      ['Expected Receivables (USD)', expectedReceivables.toFixed(2)],
      ['Net Cash Position (USD)', netCashPosition.toFixed(2)],
      ['Liquidity Ratio', liquidityRatio.toFixed(2)],
      ['Urgent Payments (USD)', urgentPaymentsUSD.toFixed(2)],
      ['Overdue Items Count', overdueExpenses.length]
    ];
    
    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Financial_Analysis_Report_September_2025.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Analysis Report</h1>
          <p className="text-muted-foreground">September 2025 Operational Cash Flow Analysis</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExcelExport}
            className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border-green-200"
          >
            <FileSpreadsheet size={16} />
            Export Analysis
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            Export PDF
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {(overdueExpenses.length > 0 || netCashPosition < 0) && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <div className="space-y-2">
              {overdueExpenses.length > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span><strong>{overdueExpenses.length} overdue payments</strong> requiring immediate attention totaling {formatCurrency(urgentPaymentsUSD)}</span>
                </div>
              )}
              {netCashPosition < 0 && (
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4" />
                  <span><strong>Negative cash position:</strong> {formatCurrency(Math.abs(netCashPosition))} shortfall expected</span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Executive Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200/50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <Building2 className="h-4 w-4" />
              Total Operating Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-blue-700">
                {formatCurrency(totalExpensesUSD)}
              </div>
              <div className="text-xs text-blue-600">
                RWF {expenseSummary.totalRWF.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-blue-600">
                  {operationalExpenses.length} expense items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Expected Receivables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(expectedReceivables)}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-green-600">
                  From {pendingClientPayments.length} clients
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netCashPosition >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200/50' : 'from-red-50 to-red-100 border-red-200/50'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium flex items-center gap-2 ${netCashPosition >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {netCashPosition >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              Net Cash Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className={`text-2xl font-bold ${netCashPosition >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatCurrency(Math.abs(netCashPosition))}
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs ${netCashPosition >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {netCashPosition >= 0 ? 'Surplus' : 'Deficit'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200/50 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              Urgent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-amber-700">
                {formatCurrency(urgentPaymentsUSD)}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-amber-600">
                  {overdueExpenses.length} overdue items
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Cash Flow Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Liquidity Ratio</span>
                <div className="text-right">
                  <span className="font-semibold">{liquidityRatio.toFixed(2)}</span>
                  <div className="text-xs text-muted-foreground">
                    {liquidityRatio >= 1 ? 'Healthy' : 'At Risk'}
                  </div>
                </div>
              </div>
              <Progress 
                value={Math.min(100, liquidityRatio * 100)} 
                className="h-2"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Payment Urgency</span>
                <div className="text-right">
                  <span className="font-semibold">{urgentPaymentRatio.toFixed(1)}%</span>
                  <div className="text-xs text-muted-foreground">
                    Of total expenses
                  </div>
                </div>
              </div>
              <Progress 
                value={urgentPaymentRatio} 
                className="h-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Overdue Rate</span>
                <div className="text-right">
                  <span className="font-semibold">{overduePaymentRatio.toFixed(1)}%</span>
                  <div className="text-xs text-muted-foreground">
                    Of all items
                  </div>
                </div>
              </div>
              <Progress 
                value={overduePaymentRatio} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency(expenseSummary.totalRWF / USD_TO_RWF_RATE)}
                </div>
                <div className="text-xs text-muted-foreground">Fixed Costs</div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-foreground">
                  {formatCurrency((expenseSummary.totalUSD - (expenseSummary.totalRWF / USD_TO_RWF_RATE)))}
                </div>
                <div className="text-xs text-muted-foreground">Variable Costs</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Suppliers Payable</span>
                <span className="font-medium">{formatCurrency(expenseSummary.suppliersRWF / USD_TO_RWF_RATE)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Staff Costs</span>
                <span className="font-medium">{formatCurrency((4609387 + 1440614) / USD_TO_RWF_RATE)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Tax Obligations</span>
                <span className="font-medium">{formatCurrency((2853026 + 3925125) / USD_TO_RWF_RATE)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Overdue Analysis */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Overdue Items ({overdueExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {overdueExpenses.map(expense => (
              <div key={expense.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-red-200">
                <div className="flex-1">
                  <div className="font-medium text-sm">{expense.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {expense.dueDate && `Due: ${expense.dueDate}`}
                    {expense.comment && ` • ${expense.comment}`}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive" className="mb-1">
                    {expense.currency === 'USD' 
                      ? formatCurrency(expense.fixedCostPerMonth + expense.operationCost + expense.urgent) 
                      : formatCurrency((expense.fixedCostPerMonth + expense.operationCost + expense.urgent) / USD_TO_RWF_RATE)
                    }
                  </Badge>
                  <div className="text-xs text-red-600">Overdue</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Client Receivables Analysis */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200/50">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Expected Client Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingClientPayments.map(payment => (
              <div key={payment.id} className="flex justify-between items-center p-3 bg-white/70 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-green-800">{payment.clientName}</div>
                  <div className="text-xs text-green-600">{payment.status}</div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {formatCurrency(payment.amountUSD)}
                </Badge>
              </div>
            ))}
            <div className="border-t border-green-200 pt-3 mt-3">
              <div className="flex justify-between items-center font-semibold">
                <span className="text-green-700">Total Expected</span>
                <span className="text-green-700">{formatCurrency(expectedReceivables)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200/50">
        <CardHeader>
          <CardTitle className="text-purple-700 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {netCashPosition < 0 && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Immediate Action Required:</strong> Cash flow deficit of {formatCurrency(Math.abs(netCashPosition))} needs attention. Prioritize collection of receivables.
                </AlertDescription>
              </Alert>
            )}
            
            {urgentPaymentRatio > 50 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>High Urgency:</strong> {urgentPaymentRatio.toFixed(1)}% of expenses are urgent. Consider payment prioritization strategy.
                </AlertDescription>
              </Alert>
            )}
            
            {liquidityRatio < 1 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <strong>Liquidity Concern:</strong> Current ratio of {liquidityRatio.toFixed(2)} indicates potential cash flow challenges.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialAnalysisReport;