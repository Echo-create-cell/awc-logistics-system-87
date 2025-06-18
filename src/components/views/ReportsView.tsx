
import React, { useRef } from 'react';
import { useReportsData } from '@/hooks/useReportsData';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import ReportFilters from '@/components/reports/ReportFilters';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import UserActivityTable from '@/components/reports/UserActivityTable';
import ReportsCharts from '@/components/reports/ReportsCharts';
import PrintableReport from '@/components/reports/PrintableReport';

const ReportsView = () => {
  const { user } = useAuth();
  const { quotations, invoices, users } = useAppData();
  const { toast } = useToast();
  const { reportData, filters, setFilters, canViewAllUsers } = useReportsData(quotations, invoices, users);
  const printRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    // Export JSON data
    const reportContent = {
      dateRange: filters.dateRange,
      metrics: reportData.metrics,
      userActivities: reportData.userActivities,
      monthlyTrends: reportData.monthlyTrends,
      topClients: reportData.topClients,
      generatedAt: new Date().toISOString(),
      generatedBy: user?.name,
      userRole: user?.role
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial-report-${filters.dateRange.from.toISOString().split('T')[0]}-to-${filters.dateRange.to.toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Report Exported",
      description: "Financial report has been downloaded successfully.",
    });
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printContent = printRef.current?.innerHTML;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>AWC Logistics - Financial Report</title>
              <style>
                body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
                @media print { 
                  body { padding: 0; }
                  .no-print { display: none !important; }
                }
                table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
                th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                th { background-color: #f9fafb; font-weight: 600; }
                .grid { display: grid; gap: 1rem; }
                .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
                .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: 700; }
                .font-semibold { font-weight: 600; }
                .text-green-600 { color: #059669; }
                .text-blue-600 { color: #2563eb; }
                .text-red-600 { color: #dc2626; }
                .text-purple-600 { color: #9333ea; }
                .text-yellow-600 { color: #d97706; }
                .bg-green-50 { background-color: #f0fdf4; }
                .bg-blue-50 { background-color: #eff6ff; }
                .bg-red-50 { background-color: #fef2f2; }
                .bg-purple-50 { background-color: #faf5ff; }
                .bg-gray-50 { background-color: #f9fafb; }
                .rounded-lg { border-radius: 0.5rem; }
                .p-4 { padding: 1rem; }
                .p-2 { padding: 0.5rem; }
                .mb-6 { margin-bottom: 1.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .mb-2 { margin-bottom: 0.5rem; }
                .space-y-2 > * + * { margin-top: 0.5rem; }
                .border-t { border-top: 1px solid #e5e7eb; }
                .border-b { border-bottom: 1px solid #e5e7eb; }
                .pb-4 { padding-bottom: 1rem; }
                .pt-4 { padding-top: 1rem; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }

    toast({
      title: "Report Printed",
      description: "Financial report has been sent to printer.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of your business performance with customizable date ranges.
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        users={users}
        canViewAllUsers={canViewAllUsers}
        onExport={handleExport}
      />

      <FinancialMetricsCards metrics={reportData.metrics} />

      <ReportsCharts reportData={reportData} />

      <UserActivityTable 
        userActivities={reportData.userActivities} 
        canViewAllUsers={canViewAllUsers}
      />

      {/* Hidden printable version */}
      <div className="hidden">
        <div ref={printRef}>
          <PrintableReport 
            reportData={reportData} 
            userRole={user?.role || ''} 
            userName={user?.name || ''} 
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
