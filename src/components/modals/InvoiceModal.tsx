import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InvoiceModalProps {
  open: boolean;
  invoice: InvoiceData | null;
  onClose: () => void;
  onSave: (invoice: InvoiceData) => void;
  onPrint: (invoice: InvoiceData) => void;
}

const InvoiceModal = ({ open, invoice, onClose, onSave, onPrint }: InvoiceModalProps) => {
  const [form, setForm] = useState<InvoiceData | null>(invoice);
  const [isMarkedAsPaid, setIsMarkedAsPaid] = useState(false);

  useEffect(() => {
    setForm(invoice);
    setIsMarkedAsPaid(false);
  }, [invoice]);

  if (!form) return null;

  const isPaid = form.status === 'paid';

  const handleChange = (field: string, value: string | number) => {
    if (isPaid) return;
    setForm(f => ({ ...f!, [field]: value }));
  };

  const handleSave = () => {
    if (form && !isPaid) {
      const updatedInvoiceData = {
        ...form,
        status: isMarkedAsPaid ? 'paid' : form.status,
      } as InvoiceData;
      onSave(updatedInvoiceData);
    }
    onClose();
  };

  const handlePrint = () => {
    if (form) {
      onPrint(form);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{isPaid ? "View Invoice" : "Edit Invoice"}</DialogTitle>
          <DialogDescription>
            {isPaid ? "This invoice is paid and cannot be edited." : "Update invoice details. You can mark it as paid to finalize it."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={form.invoiceNumber}
                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                placeholder="Enter invoice number"
                disabled={isPaid}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="Enter client name"
                disabled={isPaid}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={form.currency} onValueChange={(value) => handleChange('currency', value)} disabled={isPaid}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                value={form.totalAmount}
                onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                disabled={isPaid}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={form.issueDate.split('T')[0]}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                disabled={isPaid}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate?.split('T')[0] || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                disabled={isPaid}
              />
            </div>
          </div>
          
          {!isPaid && (
            <div className="flex items-center space-x-3 pt-4 border-t mt-4">
              <Switch
                id="mark-as-paid"
                checked={isMarkedAsPaid}
                onCheckedChange={setIsMarkedAsPaid}
                aria-label="Mark as paid"
              />
              <Label htmlFor="mark-as-paid" className="text-sm font-medium text-gray-800 cursor-pointer">
                Mark Invoice as Paid to Finalize
              </Label>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end gap-2">
          {isPaid && (
            <Button onClick={handlePrint} variant="outline" className="bg-blue-50 hover:bg-blue-100">
              Print Invoice
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          {!isPaid && (
            <Button onClick={handleSave} className="bg-primary text-white">
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
