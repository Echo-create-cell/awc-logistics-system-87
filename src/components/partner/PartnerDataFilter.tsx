import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Printer, Download, Calendar } from 'lucide-react';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { generatePrintReport, generateCSVExport } from '@/components/reports/ReportExportUtils';

interface PartnerDataFilterProps {
  user: User;
  quotations: Quotation[];
  invoices: InvoiceData[];
  users?: User[];
  title?: string;
  onFilteredDataChange?: (data: any[]) => void;
}

const PartnerDataFilter = ({ 
  user, 
  quotations, 
  invoices, 
  users = [], 
  title = "Data Analysis & Export",
  onFilteredDataChange 
}: PartnerDataFilterProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [statusFilter, setStatusFilter] = useState('__all__');
  const [typeFilter, setTypeFilter] = useState('__all__');

  // Combine all data for filtering
  const allData = useMemo(() => {
    const combinedData = [
      ...quotations.map(q => ({ ...q, type: 'quotation' })),
      ...invoices.map(i => ({ ...i, type: 'invoice' }))
    ];
    return combinedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [quotations, invoices]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = allData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ('cargoDescription' in item && item.cargoDescription?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('invoiceNumber' in item && item.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ('quoteSentBy' in item && item.quoteSentBy?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Date range filter
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate >= fromDate && itemDate <= toDate;
      });
    }

    // Status filter
    if (statusFilter !== '__all__') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== '__all__') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }

    // Notify parent component of filtered data
    if (onFilteredDataChange) {
      onFilteredDataChange(filtered);
    }

    return filtered;
  }, [allData, searchTerm, dateRange, statusFilter, typeFilter, onFilteredDataChange]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const quotationData = filteredData.filter(item => item.type === 'quotation') as (Quotation & { type: string })[];
    const invoiceData = filteredData.filter(item => item.type === 'invoice') as (InvoiceData & { type: string })[];
    
    const totalRevenue = invoiceData.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalProfit = quotationData.reduce((sum, q) => sum + (q.status === 'won' ? q.profit : 0), 0);
    const totalLoss = quotationData.reduce((sum, q) => sum + (q.status === 'lost' ? q.profit : 0), 0);
    const wonQuotations = quotationData.filter(q => q.status === 'won').length;
    const winRate = quotationData.length > 0 ? (wonQuotations / quotationData.length) * 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      totalLoss,
      totalInvoices: invoiceData.length,
      paidInvoices: invoiceData.filter(i => i.status === 'paid').length,
      pendingInvoices: invoiceData.filter(i => i.status === 'pending').length,
      overdueInvoices: invoiceData.filter(i => i.status === 'overdue').length,
      avgDealSize: invoiceData.length > 0 ? totalRevenue / invoiceData.length : 0,
      winRate
    };
  }, [filteredData]);

  const handlePrintPDF = () => {
    generatePrintReport(filteredData, summary, dateRange, 'comprehensive', user);
  };

  const handleExportCSV = () => {
    const exportData = filteredData.map(item => ({
      Date: new Date(item.createdAt).toLocaleDateString(),
      Type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      Client: item.clientName,
      Amount: item.type === 'quotation' ? (item as any).clientQuote : (item as any).totalAmount,
      Status: item.status,
      ...(item.type === 'quotation' && { 'Sent By': (item as any).quoteSentBy }),
      ...(item.type === 'invoice' && { 'Invoice Number': (item as any).invoiceNumber })
    }));
    
    const csv = [
      Object.keys(exportData[0] || {}).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `partner-data-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
    setStatusFilter('__all__');
    setTypeFilter('__all__');
  };

  return (
    <Card className="hover-lift glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            {title}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button size="sm" onClick={handlePrintPDF} className="flex items-center gap-1">
              <Printer className="h-4 w-4" />
              PDF Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="Client, cargo, invoice..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">From Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">To Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Status</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <Label className="text-xs font-medium">Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Types</SelectItem>
                <SelectItem value="quotation">Quotations</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredData.length}</span> of {allData.length} items
            </span>
            {(searchTerm || dateRange.from || dateRange.to || statusFilter !== '__all__' || typeFilter !== '__all__') && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear Filters
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Revenue: <span className="font-medium text-success">${summary.totalRevenue.toLocaleString()}</span></span>
            <span>Profit: <span className="font-medium text-primary">${summary.totalProfit.toLocaleString()}</span></span>
            <span>Win Rate: <span className="font-medium text-accent">{summary.winRate.toFixed(1)}%</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerDataFilter;