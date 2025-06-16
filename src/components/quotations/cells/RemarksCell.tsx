
import React from 'react';
import { Quotation } from '@/types';

interface RemarksCellProps {
  row: Quotation;
}

const RemarksCell = ({ row }: RemarksCellProps) => {
  const value = row.remarks;
  if (!value && !row.followUpDate) return <span className="text-gray-400">N/A</span>;

  return (
    <div className='space-y-1 text-sm'>
      {row.followUpDate && <div className="text-xs text-orange-600 font-semibold">Follow-up: {new Date(row.followUpDate).toLocaleDateString()}</div>}
      {value && (
        <p className="whitespace-pre-wrap max-w-sm text-gray-700">{value}</p>
      )}
    </div>
  );
};

export default RemarksCell;
