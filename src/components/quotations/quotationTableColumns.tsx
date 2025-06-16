import { Quotation, User } from '@/types';
import { TableColumn } from '@/types/table';
import QuotationActions from './QuotationActions';
import CargoDescriptionCell from './cells/CargoDescriptionCell';
import DestinationCell from './cells/DestinationCell';
import RemarksCell from './cells/RemarksCell';
import StatusCell from './cells/StatusCell';
import VolumeCell from './cells/VolumeCell';

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
    label: 'Q Ref Date',
    minWidth: '120px',
    render: (_: any, row: Quotation) => (
       <div className="text-sm font-medium">
        <div className="whitespace-nowrap">{new Date(row.createdAt).toLocaleDateString()}</div>
       </div>
    )
  },
  { 
    key: 'clientName', 
    label: 'Client Name',
    minWidth: '150px',
    render: (value: string) => (
      <div className="font-medium text-gray-900 truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  {
    key: 'freightMode',
    label: 'Freight Mode',
    minWidth: '120px',
    render: (value: string) => (
      <div className="text-gray-700 truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  {
    key: 'cargoDescription',
    label: 'Cargo Description',
    minWidth: '160px',
    render: (value: string) => <CargoDescriptionCell value={value} />
  },
  {
    key: 'requestType',
    label: 'Request Type',
    minWidth: '130px',
    render: (value: string) => (
      <div className="text-gray-700 truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  {
    key: 'countryOfOrigin',
    label: 'Country of Origin',
    minWidth: '140px',
    render: (value: string) => (
      <div className="text-gray-700 truncate" title={value}>
        {value || 'N/A'}
      </div>
    )
  },
  { 
    key: 'destination', 
    label: 'Destination / Delivery',
    minWidth: '180px',
    render: (_: any, row: Quotation) => <DestinationCell row={row} />
  },
  { 
    key: 'volume', 
    label: 'Volume / Commodities',
    minWidth: '160px',
    render: (_: any, row: Quotation) => <VolumeCell row={row} />
  },
  {
    key: 'buyRate', 
    label: 'Total Buy Rate',
    minWidth: '140px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'clientQuote', 
    label: 'Client Quote (Sell Rate)',
    minWidth: '160px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-blue-600 whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
      </div>
    )
  },
  {
    key: 'profit', 
    label: 'Profit',
    minWidth: '120px',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-green-600 whitespace-nowrap">
        {row.currency} {value.toLocaleString()}
        {row.profitPercentage && <span className="text-xs ml-1">({row.profitPercentage})</span>}
      </div>
    )
  },
  { 
    key: 'quoteSentBy', 
    label: 'Quote Sent By',
    minWidth: '140px',
    render: (value: string) => (
      <div className="text-gray-600 truncate" title={value}>
        {value}
      </div>
    )
  },
  {
    key: 'status', 
    label: 'Quotation Status',
    minWidth: '140px',
    render: (_: any, row: Quotation) => <StatusCell row={row} />
  },
  {
    key: 'remarks',
    label: 'Follow-up & Remarks',
    minWidth: '180px',
    render: (_: any, row: Quotation) => <RemarksCell row={row} />
  },
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
      />
    ),
  }
];
