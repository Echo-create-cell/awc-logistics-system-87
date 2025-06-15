
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Quotation } from '@/types';

interface RejectQuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const RejectQuotationModal = ({ open, quotation, onClose, onConfirm }: RejectQuotationModalProps) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
    }
  };

  if (!quotation) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Quotation</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting the quotation for "{quotation.clientName}". This will be recorded in the remarks.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="rejection-reason">Reason for Loss</Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Price too high, client chose competitor, project cancelled..."
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!reason.trim()}>Confirm Rejection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectQuotationModal;
