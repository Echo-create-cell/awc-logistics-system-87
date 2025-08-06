
import React, { useState } from 'react';
import { useReportsData } from '@/hooks/useReportsData';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import ReportFiltersCard from '@/components/reports/ReportFiltersCard';
import FinancialMetricsCards from '@/components/reports/FinancialMetricsCards';
import ReportDataTable from '@/components/reports/ReportDataTable';
import ReportsCharts from '@/components/reports/ReportsCharts';
import UserActivityTable from '@/components/reports/UserActivityTable';
import { generatePrintReport, generateCSVExport } from '@/components/reports/ReportExportUtils';

interface ReportsViewProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users?: User[];
}

const ReportsView = ({ user, quotations, invoices, users: propUsers }: ReportsViewProps) => {
  const [reportType, setReportType] = useState<'quotations' | 'financial' | 'users'>('financial');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedStatus, setSelectedStatus] = useState('__all__');

  // Use provided users or fallback to default users
  const users: User[] = propUsers || [
    { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: new Date().toISOString() },
    { id: '2', name: 'Sales Director', email: 'director@example.com', role: 'sales_director', status: 'active', createdAt: new Date().toISOString() },
    { id: '3', name: 'Finance Officer', email: 'finance@example.com', role: 'finance_officer', status: 'active', createdAt: new Date().toISOString() }
  ];

  const { reportData, canViewAllUsers } = useReportsData(quotations, invoices, users);

  // Apply filtering logic
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

  // Role-based access control - Only sales agents are restricted
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
      <ReportFiltersCard
        reportType={reportType}
        onReportTypeChange={setReportType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        userRole={user.role}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
      />

      <FinancialMetricsCards metrics={summary} />

      {reportData && <ReportsCharts reportData={reportData} />}

      {reportType === 'users' && (
        <UserActivityTable 
          userActivities={reportData?.userActivities || []} 
          canViewAllUsers={canViewAllUsers}
        />
      )}

      <ReportDataTable filteredData={filteredData} />
    </div>
  );
};

export default ReportsView;
