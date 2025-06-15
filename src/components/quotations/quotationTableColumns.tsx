
import { Badge } from '@/components/ui/badge';
import { Quotation, User } from '@/types';
import QuotationActions from './QuotationActions';

interface GetQuotationColumnsProps {
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
}

export const getQuotationColumns = ({
  user, onApprove, onReject, onInvoiceFromQuotation, onEdit
}: GetQuotationColumnsProps) => [
  { 
    key: 'clientName', 
    label: 'Client',
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value || 'N/A'}</div>
    )
  },
  { 
    key: 'volume', 
    label: 'Volume',
    render: (value: string) => (
      <div className="text-gray-700">{value}</div>
    )
  },
  { 
    key: 'destination', 
    label: 'Destination',
    render: (value: string) => (
      <div className="text-gray-700">{value || 'N/A'}</div>
    )
  },
  {
    key: 'buyRate', 
    label: 'Buy Rate',
    render: (value: number, row: Quotation) => (
      <div className="font-medium">{row.currency} {value.toLocaleString()}</div>
    )
  },
  {
    key: 'clientQuote', 
    label: 'Client Quote',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-blue-600">{row.currency} {value.toLocaleString()}</div>
    )
  },
  {
    key: 'profit', 
    label: 'Profit',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-green-600">{row.currency} {value.toLocaleString()}</div>
    )
  },
  { 
    key: 'quoteSentBy', 
    label: 'Quote Sent By',
    render: (value: string) => (
      <div className="text-gray-600">{value}</div>
    )
  },
  {
    key: 'status', 
    label: 'Status',
    render: (value: 'won' | 'pending' | 'lost') => {
      const colors = {
        won: 'bg-green-100 text-green-800 hover:bg-green-200',
        pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        lost: 'bg-red-100 text-red-800 hover:bg-red-200'
      };
      const statusText = {
        won: 'Approved',
        pending: 'Pending',
        lost: 'Rejected'
      };
      return <Badge className={`${colors[value]} font-medium`}>{statusText[value] || value}</Badge>;
    }
  },
  {
    key: 'approvedBy', 
    label: 'Approved By',
    render: (value: string, row: Quotation) => (
      <div className="text-sm">
        {value && row.approvedAt
          ? (
            <div>
              <div className="font-medium text-gray-900">{value}</div>
              <div className="text-gray-500">{new Date(row.approvedAt).toLocaleDateString()}</div>
            </div>
          )
          : <span className="text-gray-400">N/A</span>
        }
      </div>
    )
  },
  {
    key: 'actions', 
    label: 'Actions',
    render: (_: any, row: Quotation) => (
      <QuotationActions 
        quotation={row}
        user={user}
        onApprove={onApprove}
        onReject={onReject}
        onInvoiceFromQuotation={onInvoiceFromQuotation}
        onEdit={onEdit}
      />
    ),
  }
];
