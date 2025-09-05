import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, FileDown, Printer, BarChart3, TrendingUp } from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { useReportsData } from '@/hooks/useReportsData';
import { generatePDFReport, generateCSVExport, generatePrintReport } from '@/components/reports/ReportExportUtils';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import ReportsCharts from '@/components/reports/ReportsCharts';

interface SalesDirectorAnalyticsProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users: User[];
}

const SalesDirectorAnalytics = ({ user, quotations, invoices, users }: SalesDirectorAnalyticsProps) => {
  const [reportType, setReportType] = useState<'quotations' | 'financial' | 'users'>('financial');
  const [dateRange, setDateRange] = useState({ 
    from: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], 
    to: new Date().toISOString().split('T')[0] 
  });
  const [selectedStatus, setSelectedStatus] = useState('__all__');

  const { reportData, filters, setFilters } = useReportsData(quotations, invoices, users);

  // Apply filtering logic based on current selections
  const filteredData = [...quotations, ...invoices].filter(item => {
    if (selectedStatus !== '__all__') {
      if ('status' in item && item.status !== selectedStatus) return false;
    }
    if (dateRange.from && dateRange.to) {
      const itemDate = new Date(item.createdAt);
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      if (itemDate < fromDate || itemDate > toDate) return false;
    }
    return true;
  });

  const summary = reportData?.metrics || {
    totalRevenue: 0,
    totalProfit: 0,
    totalLoss: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    avgDealSize: 0,
    winRate: 0
  };

  const handlePrint = () => {
    generatePrintReport(filteredData, summary, dateRange, reportType, user, reportData);
  };

  const handleExportCSV = () => {
    generateCSVExport(reportType, quotations, filteredData);
  };

  const handleExportPDF = async () => {
    try {
      await generatePDFReport(filteredData, summary, dateRange, reportType, user, reportData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Update the hook filters when local state changes
  React.useEffect(() => {
    setFilters({
      ...filters,
      dateRange: {
        from: new Date(dateRange.from),
        to: new Date(dateRange.to)
      }
    });
  }, [dateRange.from, dateRange.to]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Sales Analytics & Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Advanced business intelligence with date range filtering and professional PDF exports
          </p>
          <div className="flex gap-2 mt-3">
            <div className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20">
              ✓ Date Range Analysis
            </div>
            <div className="px-3 py-1 bg-success/10 text-success text-sm rounded-full border border-success/20">
              ✓ PDF Export
            </div>
            <div className="px-3 py-1 bg-accent/10 text-accent text-sm rounded-full border border-accent/20">
              ✓ Real-time Insights
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700">
            <FileDown size={16} />
            Export PDF
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Analysis Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: 'quotations' | 'financial' | 'users') => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="quotations">Quotations Review</SelectItem>
                  <SelectItem value="users">Team Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Statuses</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>Analysis Period:</strong> {dateRange.from} to {dateRange.to} | 
              <strong> Total Records:</strong> {filteredData.length} items | 
              <strong> Report Type:</strong> {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <FinancialMetricsCards metrics={summary} />

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="hover-lift bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sales Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Active Quotations</span>
              <span className="text-xl font-bold text-primary">{quotations.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Win Rate</span>
              <span className="text-xl font-bold text-success">{summary.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Avg Deal Size</span>
              <span className="text-xl font-bold text-primary">${summary.avgDealSize.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-success">
              Revenue Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Revenue</span>
              <span className="text-xl font-bold text-success">${summary.totalRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Profit</span>
              <span className="text-xl font-bold text-primary">${summary.totalProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Profit Margin</span>
              <span className="text-xl font-bold text-primary">
                {summary.totalRevenue > 0 
                  ? ((summary.totalProfit / summary.totalRevenue) * 100).toFixed(1)
                  : '0'
                }%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-accent">
              Invoice Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Invoices</span>
              <span className="text-xl font-bold text-accent">{summary.totalInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Paid</span>
              <span className="text-xl font-bold text-success">{summary.paidInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overdue</span>
              <span className="text-xl font-bold text-destructive">{summary.overdueInvoices}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {reportData && <ReportsCharts reportData={reportData} />}

      {/* Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="p-4 bg-success/5 rounded-lg">
              <div className="text-2xl font-bold text-success">{reportData?.topClients.length || 0}</div>
              <div className="text-sm text-muted-foreground">Active Clients</div>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg">
              <div className="text-2xl font-bold text-accent">{reportData?.monthlyTrends.length || 0}</div>
              <div className="text-sm text-muted-foreground">Months Analyzed</div>
            </div>
            <div className="p-4 bg-warning/5 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {Math.round((new Date(dateRange.to).getTime() - new Date(dateRange.from).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-muted-foreground">Days Period</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDirectorAnalytics;