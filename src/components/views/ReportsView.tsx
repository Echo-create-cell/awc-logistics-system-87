
import React from 'react';
import { useReportsData } from '@/hooks/useReportsData';
import { useAppData } from '@/hooks/useAppData';
import { useToast } from '@/hooks/use-toast';
import ReportFilters from '@/components/reports/ReportFilters';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import UserActivityTable from '@/components/reports/UserActivityTable';
import ReportsCharts from '@/components/reports/ReportsCharts';

const ReportsView = () => {
  const { quotations, invoices, users } = useAppData();
  const { toast } = useToast();
  const { reportData, filters, setFilters, canViewAllUsers } = useReportsData(quotations, invoices, users);

  const handleExport = () => {
    // In a real app, this would generate and download a report file
    const reportContent = {
      dateRange: filters.dateRange,
      metrics: reportData.metrics,
      userActivities: reportData.userActivities,
      monthlyTrends: reportData.monthlyTrends,
      topClients: reportData.topClients,
      generatedAt: new Date().toISOString()
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Reports</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive analysis of your business performance with customizable date ranges.
          </p>
        </div>
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
    </div>
  );
};

export default ReportsView;
