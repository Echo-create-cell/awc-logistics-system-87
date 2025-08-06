
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-destructive">
            Reject Quotation
          </DialogTitle>
          <DialogDescription className="text-base">
            Please provide a detailed reason for rejecting the quotation for <strong>"{quotation.clientName}"</strong>. 
            This information will be recorded and help improve future quotations.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <Label htmlFor="rejection-reason" className="text-base font-medium">
            Reason for Rejection <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a specific reason:&#10;• Price was too high compared to competitors&#10;• Client requirements changed&#10;• Lost to competitor due to timing&#10;• Project was cancelled or postponed&#10;• Service scope didn't match client needs&#10;• Other (please specify)..."
            className="mt-3 min-h-[120px] text-base border-2 focus:border-destructive"
            rows={6}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Minimum 10 characters required for detailed feedback
          </p>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!reason.trim() || reason.trim().length < 10}
            className="px-6"
          >
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectQuotationModal;
