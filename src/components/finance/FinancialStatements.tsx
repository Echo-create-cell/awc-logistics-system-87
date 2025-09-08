import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileBarChart, 
  TrendingUp, 
  Building, 
  DollarSign,
  Download,
  Printer,
  Calculator
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { generateFinancialStatements } from './AccountingReportUtils';

interface FinancialStatementsProps {
  metrics: any;
  invoices: InvoiceData[];
  quotations: Quotation[];
  reportPeriod: { from: string; to: string };
  onPeriodChange: (period: { from: string; to: string }) => void;
  user: User;
}

const FinancialStatements = ({ 
  metrics, 
  invoices, 
  quotations, 
  reportPeriod, 
  onPeriodChange, 
  user 
}: FinancialStatementsProps) => {
  const [statementType, setStatementType] = useState<'balance' | 'income' | 'cashflow'>('income');
  
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Filter data by period
  const filteredInvoices = invoices.filter(invoice => {
    const date = new Date(invoice.issueDate);
    return date >= new Date(reportPeriod.from) && date <= new Date(reportPeriod.to);
  });

  const filteredQuotations = quotations.filter(quotation => {
    const date = new Date(quotation.createdAt);
    return date >= new Date(reportPeriod.from) && date <= new Date(reportPeriod.to);
  });

  // Calculate statement data
  const incomeStatementData = {
    revenue: filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    costOfRevenue: filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.subTotal), 0),
    grossProfit: filteredQuotations.filter(q => q.status === 'won').reduce((sum, q) => sum + q.profit, 0),
    operatingExpenses: filteredInvoices.reduce((sum, inv) => sum + (inv.tva || 0), 0),
    netIncome: 0 // Will be calculated
  };
  incomeStatementData.netIncome = incomeStatementData.grossProfit - incomeStatementData.operatingExpenses;

  const balanceSheetData = {
    currentAssets: {
      cash: 150000,
      accountsReceivable: metrics.accountsReceivable,
      inventory: 75000,
      prepaidExpenses: 25000
    },
    fixedAssets: {
      equipment: 200000,
      vehicles: 150000,
      propertyPlantEquipment: 500000,
      accumulatedDepreciation: -100000
    },
    currentLiabilities: {
      accountsPayable: 45000,
      shortTermDebt: 30000,
      accruedExpenses: 15000
    },
    longTermLiabilities: {
      longTermDebt: 200000,
      deferredTax: 25000
    },
    equity: {
      retainedEarnings: metrics.netIncome,
      commonStock: 100000
    }
  };

  const totalCurrentAssets = Object.values(balanceSheetData.currentAssets).reduce((sum, val) => sum + val, 0);
  const totalFixedAssets = Object.values(balanceSheetData.fixedAssets).reduce((sum, val) => sum + val, 0);
  const totalAssets = totalCurrentAssets + totalFixedAssets;
  
  const totalCurrentLiabilities = Object.values(balanceSheetData.currentLiabilities).reduce((sum, val) => sum + val, 0);
  const totalLongTermLiabilities = Object.values(balanceSheetData.longTermLiabilities).reduce((sum, val) => sum + val, 0);
  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
  
  const totalEquity = Object.values(balanceSheetData.equity).reduce((sum, val) => sum + val, 0);

  const cashFlowData = {
    operatingActivities: {
      netIncome: incomeStatementData.netIncome,
      depreciation: 15000,
      changesInReceivables: -25000,
      changesInPayables: 10000
    },
    investingActivities: {
      equipmentPurchases: -50000,
      vehiclePurchases: -25000
    },
    financingActivities: {
      loanProceeds: 0,
      loanPayments: -15000,
      dividends: -20000
    }
  };

  const operatingCashFlow = Object.values(cashFlowData.operatingActivities).reduce((sum, val) => sum + val, 0);
  const investingCashFlow = Object.values(cashFlowData.investingActivities).reduce((sum, val) => sum + val, 0);
  const financingCashFlow = Object.values(cashFlowData.financingActivities).reduce((sum, val) => sum + val, 0);
  const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

  const handleExportStatements = async () => {
    await generateFinancialStatements({
      incomeStatement: incomeStatementData,
      balanceSheet: balanceSheetData,
      cashFlow: cashFlowData,
      period: reportPeriod,
      user,
      type: statementType
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileBarChart className="h-6 w-6 text-primary" />
            Financial Statements
          </h2>
          <p className="text-muted-foreground mt-1">
            Professional financial statements for accounting and reporting purposes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportStatements} className="flex items-center gap-2">
            <Download size={16} />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      {/* Date Range Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reporting Period</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={reportPeriod.from}
                onChange={(e) => onPeriodChange({ ...reportPeriod, from: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={reportPeriod.to}
                onChange={(e) => onPeriodChange({ ...reportPeriod, to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Statements Tabs */}
      <Tabs value={statementType} onValueChange={(value) => setStatementType(value as 'balance' | 'income' | 'cashflow')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Income Statement
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Balance Sheet
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cash Flow
          </TabsTrigger>
        </TabsList>

        {/* Income Statement */}
        <TabsContent value="income" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Income Statement
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For the period from {new Date(reportPeriod.from).toLocaleDateString()} to {new Date(reportPeriod.to).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Revenue</h4>
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-medium">{formatCurrency(incomeStatementData.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Less: Cost of Revenue</span>
                    <span className="font-medium">({formatCurrency(incomeStatementData.costOfRevenue)})</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Gross Profit</span>
                    <span>{formatCurrency(incomeStatementData.grossProfit)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2">Operating Expenses</h4>
                  <div className="flex justify-between">
                    <span>Tax and Duties</span>
                    <span className="font-medium">{formatCurrency(incomeStatementData.operatingExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>General & Administrative</span>
                    <span className="font-medium">{formatCurrency(25000)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Operating Expenses</span>
                    <span>{formatCurrency(incomeStatementData.operatingExpenses + 25000)}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between text-lg font-bold text-green-700">
                    <span>Net Income</span>
                    <span>{formatCurrency(incomeStatementData.netIncome - 25000)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Net Margin</span>
                    <span>{((incomeStatementData.netIncome - 25000) / incomeStatementData.revenue * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet */}
        <TabsContent value="balance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                As of {new Date(reportPeriod.to).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Assets */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold border-b-2 pb-2">ASSETS</h3>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-blue-700">Current Assets</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Cash & Cash Equivalents</span>
                        <span>{formatCurrency(balanceSheetData.currentAssets.cash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accounts Receivable</span>
                        <span>{formatCurrency(balanceSheetData.currentAssets.accountsReceivable)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inventory</span>
                        <span>{formatCurrency(balanceSheetData.currentAssets.inventory)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Prepaid Expenses</span>
                        <span>{formatCurrency(balanceSheetData.currentAssets.prepaidExpenses)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Current Assets</span>
                        <span>{formatCurrency(totalCurrentAssets)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-blue-700">Fixed Assets</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Property, Plant & Equipment</span>
                        <span>{formatCurrency(balanceSheetData.fixedAssets.propertyPlantEquipment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Equipment</span>
                        <span>{formatCurrency(balanceSheetData.fixedAssets.equipment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicles</span>
                        <span>{formatCurrency(balanceSheetData.fixedAssets.vehicles)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Less: Accumulated Depreciation</span>
                        <span>({formatCurrency(Math.abs(balanceSheetData.fixedAssets.accumulatedDepreciation))})</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Fixed Assets</span>
                        <span>{formatCurrency(totalFixedAssets)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between text-xl font-bold text-blue-700">
                      <span>TOTAL ASSETS</span>
                      <span>{formatCurrency(totalAssets)}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities & Equity */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold border-b-2 pb-2">LIABILITIES & EQUITY</h3>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-red-700">Current Liabilities</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Accounts Payable</span>
                        <span>{formatCurrency(balanceSheetData.currentLiabilities.accountsPayable)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Short-term Debt</span>
                        <span>{formatCurrency(balanceSheetData.currentLiabilities.shortTermDebt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Accrued Expenses</span>
                        <span>{formatCurrency(balanceSheetData.currentLiabilities.accruedExpenses)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Current Liabilities</span>
                        <span>{formatCurrency(totalCurrentLiabilities)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-red-700">Long-term Liabilities</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Long-term Debt</span>
                        <span>{formatCurrency(balanceSheetData.longTermLiabilities.longTermDebt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Deferred Tax Liability</span>
                        <span>{formatCurrency(balanceSheetData.longTermLiabilities.deferredTax)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Long-term Liabilities</span>
                        <span>{formatCurrency(totalLongTermLiabilities)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg text-green-700">Shareholders' Equity</h4>
                    <div className="space-y-2 ml-4">
                      <div className="flex justify-between">
                        <span>Common Stock</span>
                        <span>{formatCurrency(balanceSheetData.equity.commonStock)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Retained Earnings</span>
                        <span>{formatCurrency(balanceSheetData.equity.retainedEarnings)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-semibold">
                        <span>Total Equity</span>
                        <span>{formatCurrency(totalEquity)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between text-xl font-bold text-green-700">
                      <span>TOTAL LIABILITIES & EQUITY</span>
                      <span>{formatCurrency(totalLiabilities + totalEquity)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Statement */}
        <TabsContent value="cashflow" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cash Flow Statement
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                For the period from {new Date(reportPeriod.from).toLocaleDateString()} to {new Date(reportPeriod.to).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2 text-blue-700">Operating Activities</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Net Income</span>
                      <span>{formatCurrency(cashFlowData.operatingActivities.netIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Depreciation & Amortization</span>
                      <span>{formatCurrency(cashFlowData.operatingActivities.depreciation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Changes in Accounts Receivable</span>
                      <span>({formatCurrency(Math.abs(cashFlowData.operatingActivities.changesInReceivables))})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Changes in Accounts Payable</span>
                      <span>{formatCurrency(cashFlowData.operatingActivities.changesInPayables)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Net Cash from Operating Activities</span>
                      <span>{formatCurrency(operatingCashFlow)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2 text-purple-700">Investing Activities</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Equipment Purchases</span>
                      <span>({formatCurrency(Math.abs(cashFlowData.investingActivities.equipmentPurchases))})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Vehicle Purchases</span>
                      <span>({formatCurrency(Math.abs(cashFlowData.investingActivities.vehiclePurchases))})</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Net Cash from Investing Activities</span>
                      <span>({formatCurrency(Math.abs(investingCashFlow))})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-lg border-b pb-2 text-green-700">Financing Activities</h4>
                  <div className="space-y-2 ml-4">
                    <div className="flex justify-between">
                      <span>Loan Payments</span>
                      <span>({formatCurrency(Math.abs(cashFlowData.financingActivities.loanPayments))})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dividends Paid</span>
                      <span>({formatCurrency(Math.abs(cashFlowData.financingActivities.dividends))})</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-semibold">
                      <span>Net Cash from Financing Activities</span>
                      <span>({formatCurrency(Math.abs(financingCashFlow))})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex justify-between text-xl font-bold text-blue-700">
                    <span>Net Change in Cash</span>
                    <span>{formatCurrency(netCashFlow)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600 mt-2">
                    <span>Cash at Beginning of Period</span>
                    <span>{formatCurrency(balanceSheetData.currentAssets.cash - netCashFlow)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Cash at End of Period</span>
                    <span>{formatCurrency(balanceSheetData.currentAssets.cash)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialStatements;