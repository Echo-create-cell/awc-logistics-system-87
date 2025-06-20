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
}

export const getQuotationColumns = ({
  user, onApprove, onReject, onInvoiceFromQuotation, onEdit
}: GetQuotationColumnsProps): TableColumn[] => [
  {
    key: 'createdAt',
    label: 'Date',
    minWidth: '85px',
    render: (_: any, row: Quotation) => (
       <div className="text-xs font-medium">
        <div className="whitespace-nowrap">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
       </div>
    )
  },
  { 
    key: 'clientName', 
    label: 'Client',
    minWidth: '110px',
    render: (value: string) => (
      <div className="font-medium text-gray-900 text-xs truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  {
    key: 'freightMode',
    label: 'Mode',
    minWidth: '70px',
    render: (value: string) => (
      <div className="text-gray-700 text-xs truncate" title={value}>
        {value?.slice(0, 8) || 'N/A'}
      </div>
    )
  },
  {
    key: 'cargoDescription',
    label: 'Cargo',
    minWidth: '90px',
    render: (value: string) => (
      <div className="text-gray-700 text-xs truncate" title={value}>
        {value?.slice(0, 12) || 'N/A'}
      </div>
    )
  },
  {
    key: 'countryOfOrigin',
    label: 'Origin',
    minWidth: '70px',
    render: (value: string) => (
      <div className="text-gray-700 text-xs truncate" title={value}>
        {value?.slice(0, 8) || 'N/A'}
      </div>
    )
  },
  { 
    key: 'destination', 
    label: 'Destination',
    minWidth: '90px',
    render: (value: string) => (
      <div className="text-gray-700 text-xs truncate" title={value}>
        {value?.slice(0, 10) || 'N/A'}
      </div>
    )
  },
  { 
    key: 'volume', 
    label: 'Volume (kg)',
    minWidth: '80px',
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
        <div className="text-gray-700 text-xs font-medium" title={`${totalVolume} kg`}>
          {totalVolume.toLocaleString()}
        </div>
      );
    }
  },
  {
    key: 'buyRate', 
    label: 'Buy Rate',
    minWidth: '80px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-xs whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'clientQuote', 
    label: 'Sell Rate',
    minWidth: '80px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-blue-600 text-xs whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'profit', 
    label: 'Profit',
    minWidth: '70px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-green-600 text-xs whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  { 
    key: 'quoteSentBy', 
    label: 'Agent',
    minWidth: '70px',
    render: (value: string) => (
      <div className="text-gray-600 text-xs truncate" title={value}>
        {value?.split(' ')[0] || 'N/A'}
      </div>
    )
  },
  {
    key: 'status', 
    label: 'Status',
    minWidth: '70px',
    render: (_: any, row: Quotation) => <StatusCell row={row} />
  },
  {
    key: 'actions', 
    label: 'Actions',
    minWidth: '90px',
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
