import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpDown, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Building,
  CreditCard
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CashFlowManagementProps {
  invoices: InvoiceData[];
  quotations: Quotation[];
  metrics: any;
  reportPeriod: { from: string; to: string };
  user: User;
}

interface CashFlowItem {
  date: string;
  type: 'inflow' | 'outflow';
  category: string;
  description: string;
  amount: number;
  status: 'actual' | 'projected';
  source: string;
}

const CashFlowManagement = ({ invoices, quotations, metrics, reportPeriod, user }: CashFlowManagementProps) => {
  const [viewType, setViewType] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [cashFlowType, setCashFlowType] = useState<'all' | 'inflow' | 'outflow'>('all');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  // Generate cash flow data
  const cashFlowData = useMemo((): CashFlowItem[] => {
    const items: CashFlowItem[] = [];

    // Add invoice inflows (actual payments)
    invoices.forEach(invoice => {
      if (invoice.status === 'paid') {
        items.push({
          date: invoice.issueDate,
          type: 'inflow',
          category: 'Revenue',
          description: `Payment from ${invoice.clientName}`,
          amount: invoice.totalAmount,
          status: 'actual',
          source: 'invoice'
        });
      } else if (invoice.status === 'pending') {
        // Project future inflows based on due dates
        const dueDate = invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        items.push({
          date: dueDate,
          type: 'inflow',
          category: 'Accounts Receivable',
          description: `Expected payment from ${invoice.clientName}`,
          amount: invoice.totalAmount,
          status: 'projected',
          source: 'invoice'
        });
      }
    });

    // Add quotation projections (won quotations)
    quotations.forEach(quotation => {
      if (quotation.status === 'won') {
        items.push({
          date: quotation.createdAt,
          type: 'inflow',
          category: 'New Business',
          description: `Revenue from ${quotation.clientName}`,
          amount: quotation.clientQuote || 0,
          status: 'actual',
          source: 'quotation'
        });
      } else if (quotation.status === 'pending') {
        // Project potential inflows
        const projectedDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        items.push({
          date: projectedDate,
          type: 'inflow',
          category: 'Pipeline',
          description: `Potential revenue from ${quotation.clientName}`,
          amount: (quotation.clientQuote || 0) * 0.6, // 60% probability
          status: 'projected',
          source: 'quotation'
        });
      }
    });

    // Add estimated outflows
    const monthlyExpenses = [
      { category: 'Operating Expenses', amount: 25000, description: 'General operations' },
      { category: 'Payroll', amount: 45000, description: 'Employee salaries' },
      { category: 'Transportation', amount: 15000, description: 'Vehicle and fuel costs' },
      { category: 'Insurance', amount: 8000, description: 'Business insurance' },
      { category: 'Facilities', amount: 12000, description: 'Rent and utilities' },
      { category: 'Equipment', amount: 5000, description: 'Equipment lease' }
    ];

    // Generate monthly outflows for the next 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      const dateStr = date.toISOString().split('T')[0];

      monthlyExpenses.forEach(expense => {
        items.push({
          date: dateStr,
          type: 'outflow',
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          status: i === 0 ? 'actual' : 'projected',
          source: 'expense'
        });
      });
    }

    return items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [invoices, quotations]);

  // Filter cash flow data
  const filteredCashFlow = useMemo(() => {
    const filtered = cashFlowData.filter(item => {
      const itemDate = new Date(item.date);
      const fromDate = new Date(reportPeriod.from);
      const toDate = new Date(reportPeriod.to);
      
      if (itemDate < fromDate || itemDate > toDate) return false;
      if (cashFlowType !== 'all' && item.type !== cashFlowType) return false;
      
      return true;
    });

    return filtered;
  }, [cashFlowData, reportPeriod, cashFlowType]);

  // Aggregate data for charts
  const chartData = useMemo(() => {
    const aggregated = new Map<string, { period: string; inflow: number; outflow: number; net: number }>();

    filteredCashFlow.forEach(item => {
      let period: string;
      const date = new Date(item.date);

      switch (viewType) {
        case 'weekly':
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          period = weekStart.toISOString().split('T')[0];
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          period = `${date.getFullYear()}-Q${quarter}`;
          break;
        default: // monthly
          period = date.toISOString().slice(0, 7);
      }

      const existing = aggregated.get(period) || { period, inflow: 0, outflow: 0, net: 0 };
      
      if (item.type === 'inflow') {
        existing.inflow += item.amount;
      } else {
        existing.outflow += item.amount;
      }
      
      existing.net = existing.inflow - existing.outflow;
      aggregated.set(period, existing);
    });

    return Array.from(aggregated.values()).sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredCashFlow, viewType]);

  // Calculate key metrics
  const cashFlowMetrics = useMemo(() => {
    const totalInflow = filteredCashFlow.filter(i => i.type === 'inflow').reduce((sum, i) => sum + i.amount, 0);
    const totalOutflow = filteredCashFlow.filter(i => i.type === 'outflow').reduce((sum, i) => sum + i.amount, 0);
    const netCashFlow = totalInflow - totalOutflow;
    
    const actualInflow = filteredCashFlow.filter(i => i.type === 'inflow' && i.status === 'actual').reduce((sum, i) => sum + i.amount, 0);
    const projectedInflow = filteredCashFlow.filter(i => i.type === 'inflow' && i.status === 'projected').reduce((sum, i) => sum + i.amount, 0);
    
    const currentCash = 150000; // Assumed current cash position
    const projectedCash = currentCash + netCashFlow;

    return {
      totalInflow,
      totalOutflow,
      netCashFlow,
      actualInflow,
      projectedInflow,
      currentCash,
      projectedCash,
      burnRate: totalOutflow / chartData.length || 1, // Monthly burn rate
      runway: currentCash / (totalOutflow / chartData.length || 1) // Months of runway
    };
  }, [filteredCashFlow, chartData]);

  // Identify cash flow risks
  const cashFlowRisks = useMemo(() => {
    const risks = [];
    
    if (cashFlowMetrics.projectedCash < 50000) {
      risks.push({
        type: 'critical',
        message: 'Projected cash balance is critically low',
        recommendation: 'Accelerate collections and reduce expenses'
      });
    }
    
    if (cashFlowMetrics.runway < 6) {
      risks.push({
        type: 'warning',
        message: `Only ${cashFlowMetrics.runway.toFixed(1)} months of runway remaining`,
        recommendation: 'Secure additional funding or increase revenue'
      });
    }
    
    const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.totalAmount, 0);
    if (overdueAmount > 0) {
      risks.push({
        type: 'warning',
        message: `${formatCurrency(overdueAmount)} in overdue receivables`,
        recommendation: 'Prioritize collection of overdue invoices'
      });
    }

    return risks;
  }, [cashFlowMetrics, invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            Cash Flow Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Monitor and project cash flows for optimal financial planning
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewType} onValueChange={(value) => setViewType(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cashFlowType} onValueChange={(value) => setCashFlowType(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              <SelectItem value="inflow">Inflows Only</SelectItem>
              <SelectItem value="outflow">Outflows Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Total Inflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(cashFlowMetrics.totalInflow)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Actual: {formatCurrency(cashFlowMetrics.actualInflow)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
              <TrendingDown className="h-4 w-4" />
              Total Outflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {formatCurrency(cashFlowMetrics.totalOutflow)}
            </div>
            <p className="text-xs text-red-600 mt-1">
              Burn rate: {formatCurrency(cashFlowMetrics.burnRate)}/month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
              <ArrowUpDown className="h-4 w-4" />
              Net Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cashFlowMetrics.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(cashFlowMetrics.netCashFlow)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              For selected period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
              <Building className="h-4 w-4" />
              Cash Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {formatCurrency(cashFlowMetrics.currentCash)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Runway: {cashFlowMetrics.runway.toFixed(1)} months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Risks */}
      {cashFlowRisks.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Cash Flow Alerts ({cashFlowRisks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cashFlowRisks.map((risk, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border">
                  {risk.type === 'critical' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${risk.type === 'critical' ? 'text-red-700' : 'text-amber-700'}`}>
                      {risk.message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recommendation: {risk.recommendation}
                    </p>
                  </div>
                  <Badge variant={risk.type === 'critical' ? 'destructive' : 'secondary'}>
                    {risk.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Flow Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Cash Flow Trend ({viewType})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                  labelFormatter={(label) => `Period: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="inflow" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Inflows"
                />
                <Line 
                  type="monotone" 
                  dataKey="outflow" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Outflows"
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Net Cash Flow"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflow vs Outflow Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                  <Bar dataKey="inflow" fill="#10b981" name="Inflows" />
                  <Bar dataKey="outflow" fill="#ef4444" name="Outflows" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(
                filteredCashFlow.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = { inflow: 0, outflow: 0 };
                  if (item.type === 'inflow') {
                    acc[item.category].inflow += item.amount;
                  } else {
                    acc[item.category].outflow += item.amount;
                  }
                  return acc;
                }, {} as Record<string, { inflow: number; outflow: number }>)
              ).map(([category, amounts]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{category}</p>
                    <p className="text-sm text-muted-foreground">
                      Net: {formatCurrency(amounts.inflow - amounts.outflow)}
                    </p>
                  </div>
                  <div className="text-right">
                    {amounts.inflow > 0 && (
                      <p className="text-sm text-green-600">+{formatCurrency(amounts.inflow)}</p>
                    )}
                    {amounts.outflow > 0 && (
                      <p className="text-sm text-red-600">-{formatCurrency(amounts.outflow)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Cash Flow Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Cash Flow Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCashFlow
              .filter(item => new Date(item.date) > new Date())
              .slice(0, 10)
              .map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {item.type === 'inflow' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()} • {item.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${item.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                      {item.type === 'inflow' ? '+' : '-'}{formatCurrency(item.amount)}
                    </span>
                    <Badge variant={item.status === 'actual' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlowManagement;