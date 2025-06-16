
import React from 'react';
import { Quotation } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DestinationCellProps {
  row: Quotation;
}

const DestinationCell = ({ row }: DestinationCellProps) => {
  return (
    <div>
      <div className="text-gray-700">{row.destination || 'N/A'}</div>
      {row.doorDelivery && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="truncate cursor-pointer max-w-[150px] text-gray-600 text-xs">{row.doorDelivery}</p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-[300px] whitespace-pre-wrap p-2">{row.doorDelivery}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default DestinationCell;
