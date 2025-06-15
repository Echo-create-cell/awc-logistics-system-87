
import React from 'react';
import { Quotation } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RemarksCellProps {
  row: Quotation;
}

const RemarksCell = ({ row }: RemarksCellProps) => {
  const value = row.remarks;
  if (!value && !row.followUpDate) return <span className="text-gray-400">N/A</span>;

  return (
    <div className='space-y-1'>
      {row.followUpDate && <div className="text-xs text-orange-600">Follow-up: {new Date(row.followUpDate).toLocaleDateString()}</div>}
      {value && (
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
      )}
    </div>
  );
};

export default RemarksCell;
