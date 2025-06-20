
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportsCharts from '@/components/reports/ReportsCharts';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import UserActivityTable from '@/components/reports/UserActivityTable';
import PrintableReport from '@/components/reports/PrintableReport';
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
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const reportsData = useReportsData({
    quotations,
    invoices,
    dateRange,
    selectedUser,
    selectedStatus,
    reportType,
    user
  });

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

  const chartData = reportsData.reportData?.monthlyTrends || [];

  const handlePrint = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Financial Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1, h2 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Financial Report</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <p>Report Type: ${reportType.toUpperCase()}</p>
          <p>Date Range: ${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}</p>
          
          <div class="metrics">
            <div class="metric-card">
              <h3>Total Revenue</h3>
              <p>$${summary.totalRevenue.toLocaleString()}</p>
            </div>
            <div class="metric-card">
              <h3>Total Profit</h3>
              <p>$${summary.totalProfit.toLocaleString()}</p>
            </div>
            <div class="metric-card">
              <h3>Win Rate</h3>
              <p>${summary.winRate.toFixed(1)}%</p>
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
              ${filteredData.slice(0, 20).map(item => {
                const isQuotation = 'clientQuote' in item;
                return `
                  <tr>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>${isQuotation ? 'Quotation' : 'Invoice'}</td>
                    <td>${item.clientName || 'N/A'}</td>
                    <td>$${isQuotation ? (item as Quotation).clientQuote.toLocaleString() : (item as InvoiceData).totalAmount.toLocaleString()}</td>
                    <td>${item.status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
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
      csvContent = 'Date,Client,Destination,Buy Rate,Sell Rate,Profit,Status,Agent\n';
      filteredData.forEach((item: any) => {
        if ('clientQuote' in item) {
          const quotation = item as Quotation;
          csvContent += `${quotation.createdAt},${quotation.clientName || ''},${quotation.destination || ''},${quotation.buyRate},${quotation.clientQuote},${quotation.profit},${quotation.status},${quotation.quoteSentBy}\n`;
        }
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

  // Sales directors can only see quotation reports
  if (user.role === 'sales_director' && reportType !== 'quotations') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Quotations Report</h2>
            <p className="text-muted-foreground mt-1">
              View quotation performance and analytics
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

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Sales Directors can only view quotation reports. Set the report type to "Quotations" to view data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {user.role === 'finance_officer' ? 'Financial Reports' : 'Quotations Report'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {user.role === 'finance_officer' 
              ? 'Comprehensive financial analysis and reporting dashboard'
              : 'View quotation performance and analytics'
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

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-gray-900">${summary.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
            <p className="text-2xl font-bold text-green-600">${summary.totalProfit.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
            <p className="text-2xl font-bold text-blue-600">{summary.winRate.toFixed(1)}%</p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Avg Deal Size</h3>
            <p className="text-2xl font-bold text-purple-600">${summary.avgDealSize.toLocaleString()}</p>
          </div>
        </div>

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
                  {filteredData.slice(0, 10).map((item, index) => {
                    const isQuotation = 'clientQuote' in item;
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
                          ${isQuotation ? (item as Quotation).clientQuote.toLocaleString() : (item as InvoiceData).totalAmount.toLocaleString()}
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
    </div>
  );
};

export default ReportsView;
