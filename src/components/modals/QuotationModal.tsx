import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Quotation } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
}

const QuotationModal = ({ open, quotation, onClose, onSave }: QuotationModalProps) => {
  const [form, setForm] = useState<Quotation | null>(quotation);

  React.useEffect(() => {
    setForm(quotation);
  }, [quotation]);

  if (!form) return null;

  const handleChange = (field: string, value: string | number) => {
    setForm(f => ({ ...f!, [field]: value }));
  };

  const handleSave = () => {
    if (form) {
      // Recalculate profit when saving
      const updatedForm = {
        ...form,
        profit: form.clientQuote - form.buyRate
      };
      onSave(updatedForm);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Quotation</DialogTitle>
          <DialogDescription>
            Update quotation details. Profit will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={form.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="Enter client name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={form.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="Enter destination"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                value={form.volume}
                onChange={(e) => handleChange('volume', e.target.value)}
                placeholder="Enter volume"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doorDelivery">Door Delivery</Label>
              <Input
                id="doorDelivery"
                value={form.doorDelivery}
                onChange={(e) => handleChange('doorDelivery', e.target.value)}
                placeholder="Enter door delivery details"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={form.currency} onValueChange={(value) => handleChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyRate">Buy Rate</Label>
              <Input
                id="buyRate"
                type="number"
                value={form.buyRate}
                onChange={(e) => handleChange('buyRate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientQuote">Client Quote</Label>
              <Input
                id="clientQuote"
                type="number"
                value={form.clientQuote}
                onChange={(e) => handleChange('clientQuote', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Calculated Profit</Label>
              <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                {form.currency} {(form.clientQuote - form.buyRate).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quoteSentBy">Quote Sent By</Label>
            <Input
              id="quoteSentBy"
              value={form.quoteSentBy}
              onChange={(e) => handleChange('quoteSentBy', e.target.value)}
              placeholder="Enter sender name"
            />
          </div>
        </div>
        
        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} className="bg-primary text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationModal;
