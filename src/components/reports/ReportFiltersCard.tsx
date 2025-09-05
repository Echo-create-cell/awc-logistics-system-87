
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, Download, Printer, FileDown } from 'lucide-react';

interface ReportFiltersCardProps {
  reportType: 'quotations' | 'financial' | 'users';
  onReportTypeChange: (value: 'quotations' | 'financial' | 'users') => void;
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  userRole: string;
  onPrint: () => void;
  onExportCSV: () => void;
  onExportPDF?: () => Promise<void>;
}

const ReportFiltersCard = ({
  reportType,
  onReportTypeChange,
  dateRange,
  onDateRangeChange,
  selectedStatus,
  onStatusChange,
  userRole,
  onPrint,
  onExportCSV,
  onExportPDF
}: ReportFiltersCardProps) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {userRole === 'finance_officer' ? 'Financial Reports' : 
             userRole === 'sales_director' ? 'Sales Reports' : 
             userRole === 'partner' ? 'Partner Analytics & Reports' : 'Comprehensive Reports'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {userRole === 'finance_officer' 
              ? 'Comprehensive financial analysis and reporting dashboard'
              : userRole === 'sales_director'
              ? 'Sales performance and team analytics'
              : userRole === 'partner'
              ? 'Full business intelligence with PDF export and date filtering capabilities'
              : 'Complete business intelligence and analytics'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExportCSV} className="flex items-center gap-2">
            <Download size={16} />
            Export CSV
          </Button>
          {(userRole === 'sales_director' || userRole === 'admin' || userRole === 'partner' || userRole === 'finance_officer') && onExportPDF && (
            <Button variant="outline" onClick={onExportPDF} className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700">
              <FileDown size={16} />
              Export PDF
            </Button>
          )}
          <Button onClick={onPrint} className="flex items-center gap-2">
            <Printer size={16} />
            Print Report
          </Button>
        </div>
      </div>

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
              <Select value={reportType} onValueChange={onReportTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="quotations">Quotations</SelectItem>
                   {(userRole === 'admin' || userRole === 'sales_director' || userRole === 'partner' || userRole === 'finance_officer') && (
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
                onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status Filter</Label>
              <Select value={selectedStatus} onValueChange={onStatusChange}>
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
    </>
  );
};

export default ReportFiltersCard;
