
import { Badge } from '@/components/ui/badge';
import { Quotation, User } from '@/types';
import QuotationActions from './QuotationActions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { QuotationCommodity } from '@/types/invoice';

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
    label: 'Commodities',
    render: (value: string, row: Quotation) => {
      let commodities: QuotationCommodity[] = [];
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          commodities = parsed;
        }
      } catch (e) {
        return <div className="text-gray-700 max-w-[150px] truncate">{value}</div>;
      }

      if (commodities.length === 0) {
        return <div className="text-gray-700 max-w-[150px] truncate">{value}</div>;
      }
      
      const totalWeight = commodities.reduce((acc, comm) => acc + (Number(comm.quantityKg) || 0), 0);

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-gray-700 cursor-pointer text-left">
                <div>{commodities.length} item(s)</div>
                <div className="text-xs text-gray-500">{totalWeight.toFixed(2)} KG</div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-2 space-y-1">
                <h4 className="font-semibold">Commodities</h4>
                <ul className="list-disc list-inside">
                  {commodities.map(comm => (
                    <li key={comm.id} className="text-xs">
                      {comm.name} ({comm.quantityKg} KG @ {row.currency} {comm.rate}/KG)
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
  },
  { 
    key: 'destination', 
    label: 'Destination',
    render: (value: string, row: Quotation) => (
      <div>
        <div className="text-gray-700">{value || 'N/A'}</div>
        {row.doorDelivery && <div className="text-xs text-gray-500">Door: {row.doorDelivery}</div>}
      </div>
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
    key: 'createdAt',
    label: 'Dates',
    render: (_: any, row: Quotation) => (
       <div className="text-sm">
        <div>{new Date(row.createdAt).toLocaleDateString()}</div>
        {row.followUpDate && <div className="text-xs text-orange-600 mt-1">Follow-up: {new Date(row.followUpDate).toLocaleDateString()}</div>}
       </div>
    )
  },
  {
    key: 'status', 
    label: 'Status',
    render: (value: 'won' | 'pending' | 'lost', row: Quotation) => {
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
      return (
        <div>
          <Badge className={`${colors[value]} font-medium`}>{statusText[value] || value}</Badge>
          {row.status === 'won' && row.approvedBy && row.approvedAt && (
             <div className="text-xs text-gray-500 mt-1">
               by {row.approvedBy} on {new Date(row.approvedAt).toLocaleDateString()}
             </div>
          )}
        </div>
      );
    }
  },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (value: string) => {
      if (!value) return <span className="text-gray-400">N/A</span>;
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate cursor-pointer max-w-[150px]">{value}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[300px] whitespace-pre-wrap p-2">{value}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
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
