
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Quotation } from '@/types';

interface StatusCellProps {
  row: Quotation;
}

const StatusCell = ({ row }: StatusCellProps) => {
  const value = row.status;
  const colors = {
    won: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
    pending: 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/20',
    lost: 'bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20'
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
};

export default StatusCell;
