
import React from 'react';
import { Quotation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecentQuotationsProps {
  quotations: Quotation[];
}

const getStatusClass = (status: Quotation['status']) => {
  switch (status) {
    case 'won': return 'bg-green-100 text-green-800 border-green-200';
    case 'lost': return 'bg-red-100 text-red-800 border-red-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const RecentQuotations = ({ quotations }: RecentQuotationsProps) => {
  if (quotations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-10">
        <p>No recent quotations to display.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {quotations.map((q) => (
        <Card key={q.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-base font-semibold leading-tight">{q.clientName}</CardTitle>
              <Badge className={cn("text-xs", getStatusClass(q.status))}>
                {q.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {new Date(q.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quote</span>
                <span className="font-medium">{`${q.currency} ${q.clientQuote.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Profit</span>
                <span className="font-medium text-green-600">{`${q.currency} ${q.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentQuotations;

