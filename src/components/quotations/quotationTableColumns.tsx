import { Quotation, User } from '@/types';
import { TableColumn } from '@/types/table';
import QuotationActions from './QuotationActions';
import StatusCell from './cells/StatusCell';

interface GetQuotationColumnsProps {
  user: User;
  onApprove?: (id: string) => void;
  onReject?: (quotation: Quotation) => void;
  onInvoiceFromQuotation?: (quotation: Quotation) => void;
  onEdit?: (quotation: Quotation) => void;
  onView?: (quotation: Quotation) => void;
}

export const getQuotationColumns = ({
  user, onApprove, onReject, onInvoiceFromQuotation, onEdit, onView
}: GetQuotationColumnsProps): TableColumn[] => [
  // Actions column moved to first position for easy access
  {
    key: 'actions', 
    label: 'Actions',
    minWidth: '120px',
    render: (_: any, row: Quotation) => (
      <QuotationActions 
        quotation={row}
        user={user}
        onApprove={onApprove}
        onReject={onReject}
        onInvoiceFromQuotation={onInvoiceFromQuotation}
        onEdit={onEdit}
        onView={onView}
      />
    ),
  },
  {
    key: 'status', 
    label: 'Status',
    minWidth: '85px',
    render: (_: any, row: Quotation) => <StatusCell row={row} />
  },
  { 
    key: 'clientName', 
    label: 'Client',
    minWidth: '120px',
    render: (value: string) => (
      <div className="font-medium text-gray-900 text-sm truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  {
    key: 'cargoDescription',
    label: 'Cargo',
    minWidth: '100px',
    render: (value: string) => (
      <div className="text-gray-700 text-sm truncate" title={value}>
        {value?.slice(0, 15) || 'N/A'}
      </div>
    )
  },
  {
    key: 'countryOfOrigin',
    label: 'Origin',
    minWidth: '85px',
    render: (value: string) => (
      <div className="text-gray-700 text-sm truncate" title={value}>
        {value?.slice(0, 10) || 'N/A'}
      </div>
    )
  },
  { 
    key: 'destination', 
    label: 'Destination',
    minWidth: '100px',
    render: (value: string) => (
      <div className="text-gray-700 text-sm truncate" title={value}>
        {value?.slice(0, 12) || 'N/A'}
      </div>
    )
  },
  { 
    key: 'volume', 
    label: 'Volume (kg)',
    minWidth: '85px',
    render: (value: string, row: Quotation) => {
      let totalVolume = 0;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          totalVolume = parsed.reduce((sum: number, item: any) => sum + (Number(item.quantityKg) || 0), 0);
        }
      } catch {
        // If not JSON, try to parse as number
        totalVolume = Number(value) || 0;
      }
      
      return (
        <div className="text-gray-700 text-sm font-medium text-center" title={`${totalVolume} kg`}>
          {totalVolume.toLocaleString()}
        </div>
      );
    }
  },
  {
    key: 'buyRate', 
    label: 'Buy Rate',
    minWidth: '90px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-sm whitespace-nowrap text-right">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'clientQuote', 
    label: 'Sell Rate',
    minWidth: '90px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-blue-600 text-sm whitespace-nowrap text-right">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'profit', 
    label: 'Profit',
    minWidth: '85px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-green-600 text-sm whitespace-nowrap text-right">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  { 
    key: 'quoteSentBy', 
    label: 'Agent',
    minWidth: '75px',
    render: (value: string) => (
      <div className="text-gray-600 text-sm truncate" title={value}>
        {value?.split(' ')[0] || 'N/A'}
      </div>
    )
  },
  {
    key: 'freightMode',
    label: 'Mode',
    minWidth: '80px',
    render: (value: string) => (
      <div className="text-gray-700 text-sm truncate" title={value}>
        {value?.replace('Freight', '').trim() || 'N/A'}
      </div>
    )
  },
  {
    key: 'createdAt',
    label: 'Date',
    minWidth: '85px',
    render: (_: any, row: Quotation) => (
       <div className="text-sm font-medium text-gray-600">
        <div className="whitespace-nowrap">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
       </div>
    )
  }
];
