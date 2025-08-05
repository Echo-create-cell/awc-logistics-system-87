
import React from 'react';
import { Quotation } from '@/types';

interface RemarksCellProps {
  row: Quotation;
}

const RemarksCell = ({ row }: RemarksCellProps) => {
  const value = row.remarks;
  if (!value && !row.followUpDate) return <span className="text-muted-foreground">N/A</span>;

  return (
    <div className='space-y-1'>
      {row.followUpDate && <div className="text-caption text-warning">Follow-up: {new Date(row.followUpDate).toLocaleDateString()}</div>}
      {value && (
        <p className="text-body-sm whitespace-pre-wrap max-w-sm">{value}</p>
      )}
    </div>
  );
};

export default RemarksCell;
