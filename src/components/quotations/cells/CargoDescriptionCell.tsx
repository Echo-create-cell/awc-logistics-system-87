
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CargoDescriptionCellProps {
  value?: string;
}

const CargoDescriptionCell = ({ value }: CargoDescriptionCellProps) => {
  if (!value) return <span className="text-muted-foreground">N/A</span>;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-body-sm truncate cursor-pointer max-w-[150px] hover:text-foreground transition-colors">{value}</p>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-body max-w-[300px] whitespace-pre-wrap p-2">{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CargoDescriptionCell;
