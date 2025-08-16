
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';

interface ReportDataTableProps {
  filteredData: (Quotation | InvoiceData)[];
}

const ReportDataTable = ({ filteredData }: ReportDataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatVolume = (item: Quotation | InvoiceData) => {
    const isQuotation = 'clientQuote' in item;
    
    if (isQuotation) {
      const quotation = item as Quotation;
      if (quotation.totalVolumeKg) {
        return `${quotation.totalVolumeKg.toLocaleString()} kg`;
      }
      
      // Try to parse volume from JSON
      try {
        const parsed = JSON.parse(quotation.volume);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
          return `${total.toLocaleString()} kg`;
        }
      } catch (e) {
        // Fallback to direct volume if it's a number
        const vol = Number(quotation.volume);
        if (!isNaN(vol)) {
          return `${vol.toLocaleString()} kg`;
        }
      }
      return quotation.volume || 'N/A';
    } else {
      // For invoices, calculate total from items
      const invoice = item as InvoiceData;
      const totalKg = invoice.items?.reduce((sum, item) => sum + (item.quantityKg || 0), 0) || 0;
      return `${totalKg.toLocaleString()} kg`;
    }
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText size={20} />
          Recent Activity ({filteredData.length} items)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Volume</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {paginatedData.map((item, index) => {
                const isQuotation = 'clientQuote' in item;
                const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
                return (
                  <tr key={`${isQuotation ? 'quotation' : 'invoice'}-${item.id || index}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {isQuotation ? 'Quotation' : 'Invoice'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {item.clientName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {formatVolume(item)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      ${amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'won' || item.status === 'paid' 
                          ? 'bg-success/10 text-success border-success/20'
                          : item.status === 'pending'
                          ? 'bg-warning/10 text-warning border-warning/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="px-3 py-1 text-sm font-medium bg-muted text-muted-foreground rounded-md">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReportDataTable;
