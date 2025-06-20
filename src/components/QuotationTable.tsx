
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Quotation } from '@/types';

interface QuotationTableProps {
  quotations: Quotation[];
  userRole: string;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onEdit?: (quotation: Quotation) => void;
  onDelete?: (id: string) => void;
}

const QuotationTable = ({ 
  quotations, 
  userRole, 
  onApprove, 
  onReject, 
  onEdit, 
  onDelete 
}: QuotationTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return <Badge className="bg-green-100 text-green-800">Won</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'lost':
        return <Badge className="bg-red-100 text-red-800">Lost</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatVolume = (quotation: Quotation) => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Destination
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Door Delivery
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Buy Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Client Quote
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Profit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Quote Sent By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Approved By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.clientName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                  {formatVolume(quotation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.destination || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.doorDelivery || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.currency} {quotation.buyRate.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.currency} {quotation.clientQuote.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.currency} {quotation.profit.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.quoteSentBy}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(quotation.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {quotation.approvedBy ? (
                    <div>
                      <div>{quotation.approvedBy}</div>
                      {quotation.approvedAt && (
                        <div className="text-xs text-slate-400">
                          {new Date(quotation.approvedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {userRole === 'admin' && quotation.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onApprove?.(quotation.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircle size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReject?.(quotation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle size={16} />
                      </Button>
                    </>
                  )}
                  {userRole === 'sales_director' && quotation.status === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(quotation)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(quotation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationTable;
