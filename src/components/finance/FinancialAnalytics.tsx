import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Calculator,
  Building
} from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { ReportData } from '@/types/reports';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

interface FinancialAnalyticsProps {
  reportData?: ReportData;
  metrics: any;
  invoices: InvoiceData[];
  quotations: Quotation[];
  user: User;
}

const FinancialAnalytics = ({ reportData, metrics, invoices, quotations, user }: FinancialAnalyticsProps) => {
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'trends' | 'performance' | 'forecasting'>('overview');
  const [timeframe, setTimeframe] = useState<'3m' | '6m' | '12m' | 'ytd'>('12m');

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Advanced financial ratios and metrics
  const advancedMetrics = useMemo(() => {
    const totalAssets = 975000; // Example value - would come from balance sheet
    const totalLiabilities = 315000; // Example value
    const totalEquity = totalAssets - totalLiabilities;
    const averageReceivables = metrics.accountsReceivable;
    const costOfGoodsSold = metrics.totalRevenue * 0.6; // Estimated

    return {
      // Liquidity Ratios
      currentRatio: metrics.currentRatio || 1.2,
      quickRatio: metrics.quickRatio || 0.8,
      cashRatio: 0.65,

      // Profitability Ratios
      grossProfitMargin: ((metrics.totalRevenue - costOfGoodsSold) / metrics.totalRevenue) * 100,
      netProfitMargin: (metrics.netIncome / metrics.totalRevenue) * 100,
      returnOnAssets: (metrics.netIncome / totalAssets) * 100,
      returnOnEquity: (metrics.netIncome / totalEquity) * 100,

      // Efficiency Ratios
      assetTurnover: metrics.totalRevenue / totalAssets,
      receivablesTurnover: metrics.totalRevenue / averageReceivables,
      receivablesDays: 365 / (metrics.totalRevenue / averageReceivables),
      
      // Leverage Ratios
      debtToAssets: totalLiabilities / totalAssets,
      debtToEquity: totalLiabilities / totalEquity,
      equityRatio: totalEquity / totalAssets,

      // Growth Metrics
      revenueGrowth: 15.2, // Example - would be calculated from historical data
      profitGrowth: 22.8,
      customerAcquisitionCost: 450,
      customerLifetimeValue: 12500
    };
  }, [metrics]);

  // Performance indicators
  const performanceIndicators = useMemo(() => {
    const indicators: Array<{
      metric: string;
      value: number;
      target: number;
      status: 'excellent' | 'good' | 'warning' | 'critical';
      trend: 'up' | 'down' | 'stable';
    }> = [
      {
        metric: 'Gross Profit Margin',
        value: advancedMetrics.grossProfitMargin,
        target: 35,
        status: advancedMetrics.grossProfitMargin >= 35 ? 'excellent' : advancedMetrics.grossProfitMargin >= 25 ? 'good' : 'warning',
        trend: 'up'
      },
      {
        metric: 'Current Ratio',
        value: advancedMetrics.currentRatio,
        target: 2.0,
        status: advancedMetrics.currentRatio >= 2.0 ? 'excellent' : advancedMetrics.currentRatio >= 1.5 ? 'good' : 'warning',
        trend: 'stable'
      },
      {
        metric: 'Receivables Days',
        value: advancedMetrics.receivablesDays,
        target: 30,
        status: advancedMetrics.receivablesDays <= 30 ? 'excellent' : advancedMetrics.receivablesDays <= 45 ? 'good' : 'warning',
        trend: 'down'
      },
      {
        metric: 'Debt to Equity',
        value: advancedMetrics.debtToEquity,
        target: 0.5,
        status: advancedMetrics.debtToEquity <= 0.5 ? 'excellent' : advancedMetrics.debtToEquity <= 1.0 ? 'good' : 'warning',
        trend: 'down'
      },
      {
        metric: 'ROE (%)',
        value: advancedMetrics.returnOnEquity,
        target: 15,
        status: advancedMetrics.returnOnEquity >= 15 ? 'excellent' : advancedMetrics.returnOnEquity >= 10 ? 'good' : 'warning',
        trend: 'up'
      }
    ];

    return indicators;
  }, [advancedMetrics]);

  // Trend analysis data
  const trendData = useMemo(() => {
    if (!reportData?.monthlyTrends) return [];

    return reportData.monthlyTrends.map(trend => ({
      ...trend,
      profitMargin: trend.revenue > 0 ? (trend.profit / trend.revenue) * 100 : 0,
      averageDealSize: trend.quotations > 0 ? trend.revenue / trend.quotations : 0
    }));
  }, [reportData]);

  // Revenue breakdown by category
  const revenueBreakdown = useMemo(() => {
    const breakdown = [
      { name: 'Freight Services', value: metrics.totalRevenue * 0.65, color: '#10b981' },
      { name: 'Logistics Consulting', value: metrics.totalRevenue * 0.20, color: '#3b82f6' },
      { name: 'Warehousing', value: metrics.totalRevenue * 0.10, color: '#f59e0b' },
      { name: 'Other Services', value: metrics.totalRevenue * 0.05, color: '#ef4444' }
    ];
    return breakdown;
  }, [metrics]);

  // Financial forecasting
  const forecastData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseRevenue = metrics.totalRevenue / 12;
    const growthRate = 0.08; // 8% monthly growth

    return months.map((month, index) => ({
      month,
      actualRevenue: index < 3 ? baseRevenue * (1 + (index * 0.05)) : null,
      forecastRevenue: baseRevenue * (1 + (index * growthRate)),
      conservativeRevenue: baseRevenue * (1 + (index * growthRate * 0.7)),
      optimisticRevenue: baseRevenue * (1 + (index * growthRate * 1.3))
    }));
  }, [metrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-600" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Financial Analytics & Intelligence
          </h2>
          <p className="text-muted-foreground mt-1">
            Advanced financial analysis and business intelligence dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={analyticsView} onValueChange={(value) => setAnalyticsView(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="forecasting">Forecasting</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">3 Months</SelectItem>
              <SelectItem value="6m">6 Months</SelectItem>
              <SelectItem value="12m">12 Months</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {analyticsView === 'overview' && (
        <>
          {/* Key Financial Ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
                  <Target className="h-4 w-4" />
                  Gross Profit Margin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {formatPercentage(advancedMetrics.grossProfitMargin)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Industry average: 30%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
                  <Calculator className="h-4 w-4" />
                  Return on Equity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatPercentage(advancedMetrics.returnOnEquity)}
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Target: 15%
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-700">
                  <Building className="h-4 w-4" />
                  Asset Turnover
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {advancedMetrics.assetTurnover.toFixed(2)}x
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  Asset efficiency
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-700">
                  <Award className="h-4 w-4" />
                  Receivables Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {advancedMetrics.receivablesDays.toFixed(0)}
                </div>
                <p className="text-xs text-orange-600 mt-1">
                  Collection period
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { metric: 'Liquidity', score: 85, color: 'bg-green-500' },
                    { metric: 'Profitability', score: 78, color: 'bg-blue-500' },
                    { metric: 'Efficiency', score: 92, color: 'bg-purple-500' },
                    { metric: 'Leverage', score: 74, color: 'bg-orange-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.metric}</span>
                        <span className="font-semibold">{item.score}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color}`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-700">Overall Score: 82/100</p>
                    <p className="text-xs text-green-600 mt-1">Strong financial position with room for improvement in leverage management</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {analyticsView === 'trends' && (
        <>
          {/* Trend Analysis Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue and Profitability Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      fill="#10b981"
                      fillOpacity={0.3}
                      stroke="#10b981"
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="profitMargin"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Profit Margin %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Trends */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  +{formatPercentage(advancedMetrics.revenueGrowth)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profit Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  +{formatPercentage(advancedMetrics.profitGrowth)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">CAC</p>
                    <p className="text-xl font-bold">{formatCurrency(advancedMetrics.customerAcquisitionCost)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LTV</p>
                    <p className="text-xl font-bold">{formatCurrency(advancedMetrics.customerLifetimeValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {analyticsView === 'performance' && (
        <>
          {/* Performance Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Performance Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getTrendIcon(indicator.trend)}
                        <span className="font-medium">{indicator.metric}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {indicator.metric.includes('%') ? formatPercentage(indicator.value) : indicator.value.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target: {indicator.metric.includes('%') ? formatPercentage(indicator.target) : indicator.target.toFixed(2)}
                        </p>
                      </div>
                      <Badge className={getStatusColor(indicator.status)}>
                        {indicator.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Alerts */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-700 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Performance Alerts & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded border">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-700">Strong Asset Utilization</p>
                    <p className="text-sm text-muted-foreground">
                      Asset turnover ratio of {advancedMetrics.assetTurnover.toFixed(2)}x indicates efficient use of assets
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded border">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-700">Collection Period Attention</p>
                    <p className="text-sm text-muted-foreground">
                      Receivables collection period of {advancedMetrics.receivablesDays.toFixed(0)} days could be improved
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded border">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-700">Growth Opportunity</p>
                    <p className="text-sm text-muted-foreground">
                      Consider expansion strategies to leverage current strong profitability
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {analyticsView === 'forecasting' && (
        <>
          {/* Revenue Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Revenue Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                    <Area
                      type="monotone"
                      dataKey="conservativeRevenue"
                      stackId="1"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.2}
                      name="Conservative"
                    />
                    <Area
                      type="monotone"
                      dataKey="forecastRevenue"
                      stackId="2"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Base Forecast"
                    />
                    <Area
                      type="monotone"
                      dataKey="optimisticRevenue"
                      stackId="3"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Optimistic"
                    />
                    <Line
                      type="monotone"
                      dataKey="actualRevenue"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      connectNulls={false}
                      name="Actual"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Forecast Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-green-700">Optimistic Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(forecastData.reduce((sum, item) => sum + item.optimisticRevenue, 0))}
                </div>
                <p className="text-sm text-muted-foreground">6-month projection</p>
                <p className="text-xs text-green-600 mt-1">+30% growth rate</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-blue-700">Base Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {formatCurrency(forecastData.reduce((sum, item) => sum + item.forecastRevenue, 0))}
                </div>
                <p className="text-sm text-muted-foreground">6-month projection</p>
                <p className="text-xs text-blue-600 mt-1">+8% monthly growth</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base text-red-700">Conservative Scenario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {formatCurrency(forecastData.reduce((sum, item) => sum + item.conservativeRevenue, 0))}
                </div>
                <p className="text-sm text-muted-foreground">6-month projection</p>
                <p className="text-xs text-red-600 mt-1">+5.6% growth rate</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancialAnalytics;