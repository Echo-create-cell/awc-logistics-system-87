
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Quotation } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface QuotationModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSave: (q: Quotation) => void;
  onDelete: (id: string) => void;
  mode?: "view" | "edit";
}

const QuotationModal = ({ open, quotation, onClose, onSave, onDelete, mode="view" }: QuotationModalProps) => {
  const [form, setForm] = useState<Quotation | null>(quotation);

  React.useEffect(() => {
    setForm(quotation);
  }, [quotation]);

  if (!form) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f!, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (form) onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Quotation" : "Quotation Details"}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {mode === "view" ? (
            <div className="space-y-2">
              <div><strong>Client:</strong> {form.clientName}</div>
              <div><strong>Destination:</strong> {form.destination}</div>
              <div><strong>Status:</strong> {form.status}</div>
              <div><strong>Volume:</strong> {form.volume}</div>
              <div><strong>Profit:</strong> {form.profit}</div>
              {/* Add more as preferred */}
            </div>
          ) : (
            <form className="space-y-3">
              <Input value={form.clientName} name="clientName" onChange={handleChange} placeholder="Client Name" />
              <Input value={form.destination} name="destination" onChange={handleChange} placeholder="Destination" />
              {/* Expand input fields as needed */}
            </form>
          )}
        </DialogDescription>
        <DialogFooter>
          {mode === "edit" && (
            <Button onClick={handleSave} className="bg-primary text-white">Save</Button>
          )}
          <Button variant="destructive" onClick={() => { onDelete(form.id); onClose(); }}>Delete</Button>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default QuotationModal;
