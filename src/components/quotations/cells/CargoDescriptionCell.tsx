
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CargoDescriptionCellProps {
  value?: string;
}

const CargoDescriptionCell = ({ value }: CargoDescriptionCellProps) => {
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
};

export default CargoDescriptionCell;
