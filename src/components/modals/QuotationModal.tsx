
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Quotation, User } from "@/types";
import { Button } from "@/components/ui/button";
import QuotationForm from "./quotation/QuotationForm";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
  user: User;
}

const QuotationModal = ({ open, quotation, onClose, onSave, user }: QuotationModalProps) => {
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
      // Recalculate profit and profit percentage when saving
      const profit = form.clientQuote - form.buyRate;
      const profitPercentage = form.buyRate > 0 ? `${((profit / form.buyRate) * 100).toFixed(2)}%` : form.profitPercentage;

      const updatedForm: Quotation = {
        ...form,
        profit,
        profitPercentage,
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
        
        <QuotationForm
          form={form}
          user={user}
          handleChange={handleChange}
        />
        
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
