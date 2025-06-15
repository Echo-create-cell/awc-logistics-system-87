
import React from 'react';
import { Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VolumeCellProps {
  row: Quotation;
}

const VolumeCell = ({ row }: VolumeCellProps) => {
  let commodities: QuotationCommodity[] = [];
  const value = row.volume;

  try {
    if (value) {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        commodities = parsed;
      }
    }
  } catch (e) {
    return <div className="text-gray-700 max-w-[150px] truncate">{value}</div>;
  }

  if (commodities.length === 0) {
    return <div className="text-gray-700 max-w-[150px] truncate">{value || 'N/A'}</div>;
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
};

export default VolumeCell;
