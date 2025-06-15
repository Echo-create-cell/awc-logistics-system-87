
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quotation } from "@/types";

interface QuotationDetailModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
}

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || 'N/A'}</p>
  </div>
);

const getStatusBadge = (status: 'won' | 'pending' | 'lost') => {
    const colors = {
      won: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      lost: 'bg-red-100 text-red-800'
    };
    const statusText = {
      won: 'Approved',
      pending: 'Pending',
      lost: 'Rejected'
    };
    return <Badge className={`${colors[status]} font-medium`}>{statusText[status]}</Badge>;
};

const QuotationDetailModal = ({ open, quotation, onClose }: QuotationDetailModalProps) => {
  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">Quotation Details</DialogTitle>
              <DialogDescription>
                Details for Quotation ID: {quotation.id}
              </DialogDescription>
            </div>
            {getStatusBadge(quotation.status)}
          </div>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 border-t pt-4">
                <DetailRow label="Client" value={quotation.clientName} />
                <DetailRow label="Destination" value={quotation.destination} />
                <DetailRow label="Volume" value={quotation.volume} />
                <DetailRow label="Door Delivery" value={quotation.doorDelivery} />
                <DetailRow label="Currency" value={quotation.currency} />
                <DetailRow label="Buy Rate" value={`${quotation.currency} ${quotation.buyRate.toLocaleString()}`} />
                <DetailRow label="Client Quote" value={`${quotation.currency} ${quotation.clientQuote.toLocaleString()}`} />
                <DetailRow label="Profit" value={<span className="text-green-600">{`${quotation.currency} ${quotation.profit.toLocaleString()}`}</span>} />
                <DetailRow label="Quote Sent By" value={quotation.quoteSentBy} />
                <DetailRow label="Created At" value={new Date(quotation.createdAt).toLocaleString()} />
                <DetailRow label="Approved By" value={quotation.approvedBy} />
                {quotation.approvedAt && <DetailRow label="Approved At" value={new Date(quotation.approvedAt).toLocaleString()} />}
                {quotation.linkedInvoiceIds && quotation.linkedInvoiceIds.length > 0 && (
                  <div className="lg:col-span-3">
                    <DetailRow label="Linked Invoices" value={quotation.linkedInvoiceIds.join(', ')} />
                  </div>
                )}
            </div>
            {quotation.remarks && (
                <div className="border-t pt-4">
                    <p className="text-sm text-gray-500">Remarks</p>
                    <p className="font-medium mt-1 p-2 bg-gray-50 rounded whitespace-pre-wrap">{quotation.remarks}</p>
                </div>
            )}
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationDetailModal;
