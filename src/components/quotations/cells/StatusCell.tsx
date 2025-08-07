
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Quotation } from '@/types';

interface StatusCellProps {
  row: Quotation;
}

const StatusCell = ({ row }: StatusCellProps) => {
  const value = row.status;
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
};

export default StatusCell;
