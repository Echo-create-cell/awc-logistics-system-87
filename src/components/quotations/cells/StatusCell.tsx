
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Quotation } from '@/types';

interface StatusCellProps {
  row: Quotation;
}

const StatusCell = ({ row }: StatusCellProps) => {
  const value = row.status;
  const colors = {
    won: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    lost: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
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
         <div className="text-xs text-muted-foreground mt-1">
           by {row.approvedBy} on {new Date(row.approvedAt).toLocaleDateString()}
         </div>
      )}
    </div>
  );
};

export default StatusCell;
