
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Quotation } from '@/types';
import { AlertTriangle, XCircle, FileText } from 'lucide-react';
import { ModalWrapper } from '@/components/ui/modal-wrapper';
import { FormSection } from '@/components/ui/form-section';
import { ActionButtonGroup } from '@/components/ui/action-button-group';

interface RejectQuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  onSave?: (reason: string) => void;
}

const RejectQuotationModal = ({ open, quotation, onClose, onConfirm, onSave }: RejectQuotationModalProps) => {
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

  const handleSave = () => {
    if (reason.trim() && onSave) {
      onSave(reason);
    }
  };

  if (!quotation) return null;

  const actionButtons = [
    {
      label: 'Cancel',
      onClick: onClose,
      variant: 'outline' as const
    },
    ...(onSave ? [{
      label: 'Save Draft',
      onClick: handleSave,
      variant: 'secondary' as const,
      icon: FileText,
      disabled: !reason.trim() || reason.trim().length < 10
    }] : []),
    {
      label: 'Confirm Rejection',
      onClick: handleConfirm,
      variant: 'destructive' as const,
      icon: XCircle,
      disabled: !reason.trim() || reason.trim().length < 10
    }
  ];

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Reject Quotation"
      description={`Please provide a detailed reason for rejecting the quotation for "${quotation.clientName}". This information will be recorded and help improve future quotations.`}
      icon={XCircle}
      iconVariant="destructive"
      size="lg"
    >
      <div className="space-y-6">
        {/* Quotation Summary */}
        <FormSection
          title="Quotation Summary"
          icon={FileText}
          variant="info"
        >
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex justify-between">
              <span>Client:</span>
              <span className="font-medium text-foreground">{quotation.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium text-foreground">
                {quotation.currency} {quotation.clientQuote?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Agent:</span>
              <span className="font-medium text-foreground">{quotation.quoteSentBy}</span>
            </div>
          </div>
        </FormSection>

        {/* Rejection Reason */}
        <FormSection
          title="Reason for Rejection"
          description="Provide a detailed explanation to help improve future quotations."
          icon={AlertTriangle}
          variant="warning"
        >
          <div className="space-y-3">
            <Label htmlFor="rejection-reason" className="text-sm font-medium text-foreground">
              Detailed Explanation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="rejection-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a specific reason:&#10;• Price was too high compared to competitors&#10;• Client requirements changed&#10;• Lost to competitor due to timing&#10;• Project was cancelled or postponed&#10;• Service scope didn't match client needs&#10;• Other (please specify)..."
              className="min-h-[140px] text-sm resize-none focus:ring-warning/20 focus:border-warning"
              rows={7}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Minimum 10 characters required for detailed feedback</span>
              <span className={reason.length >= 10 ? "text-success" : "text-warning"}>
                {reason.length}/10 characters
              </span>
            </div>
          </div>
        </FormSection>

        {/* Warning Notice */}
        <FormSection
          title="Important Notice"
          icon={AlertTriangle}
          variant="error"
        >
          <p className="text-sm text-destructive/80 leading-relaxed">
            This action will permanently mark the quotation as "lost" and cannot be undone. 
            The rejection reason will be recorded for analysis and future improvements.
          </p>
        </FormSection>
      </div>
      
      <div className="pt-6 border-t border-border/10">
        <ActionButtonGroup
          buttons={actionButtons}
          alignment="between"
        />
      </div>
    </ModalWrapper>
  );
};

export default RejectQuotationModal;
