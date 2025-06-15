
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";

interface InvoiceModalProps {
  open: boolean;
  invoice: InvoiceData | null;
  onClose: () => void;
  onPrint: (invoice: InvoiceData) => void;
  // If you want to add edit/delete here, you can expand the interface.
}

const InvoiceModal = ({ open, invoice, onClose, onPrint }: InvoiceModalProps) => {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="space-y-2">
            <div><strong>Invoice #:</strong> {invoice.invoiceNumber}</div>
            <div><strong>Client:</strong> {invoice.clientName}</div>
            <div><strong>Status:</strong> {invoice.status}</div>
            <div><strong>Total Amount:</strong> {invoice.currency} {invoice.totalAmount}</div>
            {/* Add more as preferred */}
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button onClick={() => onPrint(invoice)}>Print</Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
