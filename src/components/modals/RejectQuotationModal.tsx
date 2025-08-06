
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Quotation } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, XCircle, FileText } from 'lucide-react';

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
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                Reject Quotation
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                Please provide a detailed reason for rejecting the quotation for <strong>"{quotation.clientName}"</strong>. 
                This information will be recorded and help improve future quotations.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Quotation Summary */}
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Quotation Summary</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div>Client: <strong>{quotation.clientName}</strong></div>
                <div>Amount: <strong>{quotation.currency} {quotation.clientQuote?.toLocaleString()}</strong></div>
                <div>Agent: <strong>{quotation.quoteSentBy}</strong></div>
              </div>
            </CardContent>
          </Card>

          {/* Rejection Reason */}
          <Card className="border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <h3 className="font-medium text-gray-900">Reason for Rejection</h3>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="rejection-reason" className="text-sm font-medium text-gray-700">
                  Detailed Explanation <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejection-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a specific reason:&#10;• Price was too high compared to competitors&#10;• Client requirements changed&#10;• Lost to competitor due to timing&#10;• Project was cancelled or postponed&#10;• Service scope didn't match client needs&#10;• Other (please specify)..."
                  className="min-h-[140px] text-sm border-gray-300 focus:border-orange-500 focus:ring-orange-500 resize-none"
                  rows={7}
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Minimum 10 characters required for detailed feedback</span>
                  <span className={reason.length >= 10 ? "text-green-600" : "text-orange-600"}>
                    {reason.length}/10 characters
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warning Notice */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Important:</strong> This action will permanently mark the quotation as "lost" and cannot be undone. 
                  The rejection reason will be recorded for analysis and future improvements.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={onClose} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirm} 
              disabled={!reason.trim() || reason.trim().length < 10}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Confirm Rejection
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectQuotationModal;
