import { Quotation, User } from '@/types';
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
}: GetQuotationColumnsProps) => [
  {
    key: 'createdAt',
    label: 'Q Ref Date',
    render: (_: any, row: Quotation) => (
       <div className="text-sm">
        <div>{new Date(row.createdAt).toLocaleDateString()}</div>
       </div>
    )
  },
  { 
    key: 'clientName', 
    label: 'Client Name',
    render: (value: string) => (
      <div className="font-medium text-gray-900">{value || 'N/A'}</div>
    )
  },
  {
    key: 'freightMode',
    label: 'Freight Mode',
    render: (value: string) => <div className="text-gray-700">{value || 'N/A'}</div>
  },
  {
    key: 'cargoDescription',
    label: 'Cargo Description',
    render: (value: string) => <CargoDescriptionCell value={value} />
  },
  {
    key: 'requestType',
    label: 'Request Type',
    render: (value: string) => <div className="text-gray-700">{value || 'N/A'}</div>
  },
  {
    key: 'countryOfOrigin',
    label: 'Country of Origin',
    render: (value: string) => <div className="text-gray-700">{value || 'N/A'}</div>
  },
  { 
    key: 'destination', 
    label: 'Destination / Delivery',
    render: (_: any, row: Quotation) => <DestinationCell row={row} />
  },
  { 
    key: 'volume', 
    label: 'Volume / Commodities',
    render: (_: any, row: Quotation) => <VolumeCell row={row} />
  },
  {
    key: 'buyRate', 
    label: 'Total Buy Rate',
    render: (value: number, row: Quotation) => (
      <div className="font-medium">{row.currency} {value.toLocaleString()}</div>
    )
  },
  {
    key: 'clientQuote', 
    label: 'Client Quote (Sell Rate)',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-blue-600">{row.currency} {value.toLocaleString()}</div>
    )
  },
  {
    key: 'profit', 
    label: 'Profit',
    render: (value: number, row: Quotation) => (
      <div className="font-medium text-green-600">
        {row.currency} {value.toLocaleString()}
        {row.profitPercentage && <span className="text-xs ml-1">({row.profitPercentage})</span>}
      </div>
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
    label: 'Quotation Status',
    render: (_: any, row: Quotation) => <StatusCell row={row} />
  },
  {
    key: 'remarks',
    label: 'Follow-up & Remarks',
    render: (_: any, row: Quotation) => <RemarksCell row={row} />
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
