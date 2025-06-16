
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Quotation, User } from '@/types';

interface RecentQuotationsProps {
  quotations: Quotation[];
  userRole: User['role'];
  setActiveTab: (tab: string) => void;
}

const RecentQuotations = ({ quotations, userRole, setActiveTab }: RecentQuotationsProps) => {
  if (quotations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pending quotations to review.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {quotations.map((quotation, eventIdx) => (
          <li key={quotation.id}>
            <div className="relative pb-8">
              {eventIdx !== quotations.length - 1 ? (
                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3 items-start">
                <div>
                  <span className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
                    <Badge className="bg-yellow-100 text-yellow-800">{quotation.status}</Badge>
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      New quotation for <span className="font-medium text-gray-900">{quotation.clientName}</span>
                    </p>
                    <time dateTime={quotation.createdAt} className="whitespace-nowrap text-right text-sm text-gray-500">
                      {new Date(quotation.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <p>Amount: {quotation.currency} {quotation.clientQuote.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 flex gap-2">
                     {userRole === 'admin' && quotation.status === 'pending' && (
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('quotations')}>
                        <Eye className="mr-2 h-4 w-4" /> View Quotations
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentQuotations;
