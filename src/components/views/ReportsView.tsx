
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

  const { filteredData, summary, chartData } = useReportsData({
    quotations,
    invoices,
    dateRange,
    selectedUser,
    selectedStatus,
    reportType,
    user
  });

  const handlePrint = () => {
    setShowPrintPreview(true);
    // Small delay to ensure the component renders before printing
    setTimeout(() => {
      window.print();
      setShowPrintPreview(false);
    }, 100);
  };

  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'quotations') {
      csvContent = 'Date,Client,Destination,Buy Rate,Sell Rate,Profit,Status,Agent\n';
      filteredData.forEach((item: any) => {
        const quotation = item as Quotation;
        csvContent += `${quotation.createdAt},${quotation.clientName || ''},${quotation.destination || ''},${quotation.buyRate},${quotation.clientQuote},${quotation.profit},${quotation.status},${quotation.quoteSentBy}\n`;
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

  if (showPrintPreview) {
    return (
      <PrintableReport
        reportType={reportType}
        data={filteredData}
        summary={summary}
        dateRange={dateRange}
        user={user}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial analysis and reporting dashboard
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

      <ReportFilters
        reportType={reportType}
        setReportType={setReportType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        user={user}
      />

      <FinancialMetricsCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsCharts chartData={chartData} reportType={reportType} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityTable data={filteredData.slice(0, 10)} reportType={reportType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReportsView;
