
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Printer, Calendar, Filter } from 'lucide-react';
import { useReportsData } from '@/hooks/useReportsData';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface ReportsViewProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
}

const ReportsView = ({ user, quotations, invoices }: ReportsViewProps) => {
  const [reportType, setReportType] = useState<'quotations' | 'financial' | 'users'>('financial');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedUser, setSelectedUser] = useState('__all__');
  const [selectedStatus, setSelectedStatus] = useState('__all__');

  // Create mock users array for the hook
  const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Sales Director', email: 'director@example.com', role: 'sales_director', status: 'active', createdAt: new Date().toISOString() },
    { id: '3', name: 'Finance Officer', email: 'finance@example.com', role: 'finance_officer', status: 'active', createdAt: new Date().toISOString() }
  ];

  const reportsData = useReportsData(quotations, invoices, users);

  // Extract data from the hook response
  const filteredData = reportsData.reportData?.metrics ? 
    [...quotations, ...invoices].filter(item => {
      // Apply basic filtering logic
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
    }) : [];

  const summary = reportsData.reportData?.metrics || {
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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Financial Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
            .report-info { text-align: right; }
            h1, h2 { color: #333; margin: 20px 0 10px 0; }
            .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
            .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; background: #f9f9f9; }
            .metric-title { font-size: 14px; color: #666; margin-bottom: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; }
            .revenue { color: #10b981; }
            .profit { color: #3b82f6; }
            .loss { color: #ef4444; }
            .rate { color: #8b5cf6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-won, .status-paid { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-lost, .status-overdue { background: #fee2e2; color: #991b1b; }
            @media print { body { margin: 0; } .no-print { display: none; } }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">AWC Logistics</div>
            <div class="report-info">
              <div><strong>Financial Report</strong></div>
              <div>Generated: ${new Date().toLocaleDateString()}</div>
              <div>By: ${user.name} (${user.role.replace('_', ' ')})</div>
            </div>
          </div>

          <h1>Executive Summary</h1>
          <p><strong>Report Period:</strong> ${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}</p>
          <p><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
          
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Total Revenue</div>
              <div class="metric-value revenue">$${summary.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Profit</div>
              <div class="metric-value profit">$${summary.totalProfit.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Total Loss</div>
              <div class="metric-value loss">$${summary.totalLoss.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Win Rate</div>
              <div class="metric-value rate">${summary.winRate.toFixed(1)}%</div>
            </div>
          </div>

          <h2>Invoice Statistics</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-title">Total Invoices</div>
              <div class="metric-value">${summary.totalInvoices}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Paid Invoices</div>
              <div class="metric-value revenue">${summary.paidInvoices}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Pending Invoices</div>
              <div class="metric-value" style="color: #f59e0b;">${summary.pendingInvoices}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Overdue Invoices</div>
              <div class="metric-value loss">${summary.overdueInvoices}</div>
            </div>
          </div>

          <h2>Recent Activity</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.slice(0, 25).map(item => {
                const isQuotation = 'clientQuote' in item;
                const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
                const statusClass = item.status === 'won' || item.status === 'paid' ? 'status-won' : 
                                  item.status === 'pending' ? 'status-pending' : 'status-lost';
                return `
                  <tr>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>${isQuotation ? 'Quotation' : 'Invoice'}</td>
                    <td>${item.clientName || 'N/A'}</td>
                    <td>$${amount.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was generated automatically by AWC Logistics Management System</p>
            <p>© ${new Date().getFullYear()} AWC Logistics. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'quotations') {
      csvContent = 'Date,Client,Destination,Volume,Buy Rate,Sell Rate,Profit,Status,Agent\n';
      quotations.forEach((item) => {
        const volume = item.totalVolumeKg || 0;
        csvContent += `${item.createdAt},${item.clientName || ''},${item.destination || ''},${volume},${item.buyRate},${item.clientQuote},${item.profit},${item.status},${item.quoteSentBy}\n`;
      });
      filename = `quotations-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (reportType === 'financial') {
      csvContent = 'Date,Type,Client,Amount,Currency,Status\n';
      filteredData.forEach((item: any) => {
        if ('clientQuote' in item) {
          const quotation = item as Quotation;
          csvContent += `${quotation.createdAt},Quotation,${quotation.clientName || ''},${quotation.clientQuote},${quotation.currency},${quotation.status}\n`;
        } else {
          const invoice = item as InvoiceData;
          csvContent += `${invoice.createdAt},Invoice,${invoice.clientName},${invoice.totalAmount},${invoice.currency},${invoice.status}\n`;
        }
      });
      filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Role-based access control
  if (user.role === 'sales_agent') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Sales agents do not have access to reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {user.role === 'finance_officer' ? 'Financial Reports' : 
             user.role === 'sales_director' ? 'Sales Reports' : 'Comprehensive Reports'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {user.role === 'finance_officer' 
              ? 'Comprehensive financial analysis and reporting dashboard'
              : user.role === 'sales_director'
              ? 'Sales performance and team analytics'
              : 'Complete business intelligence and analytics'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={20} />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="quotations">Quotations</SelectItem>
                  {(user.role === 'admin' || user.role === 'sales_director') && (
                    <SelectItem value="users">User Activity</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
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
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${summary.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {summary.totalInvoices} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${summary.totalProfit.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Win rate: {summary.winRate.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">${summary.avgDealSize.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Recent Activity ({filteredData.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.slice(0, 20).map((item, index) => {
                  const isQuotation = 'clientQuote' in item;
                  const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
                  return (
                    <tr key={`${isQuotation ? 'quotation' : 'invoice'}-${item.id || index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isQuotation ? 'Quotation' : 'Invoice'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.clientName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'won' || item.status === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsView;
