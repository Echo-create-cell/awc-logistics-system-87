import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { InvoiceData } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, FileText, Calendar, DollarSign } from "lucide-react";

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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isPaid ? 'bg-green-100' : 'bg-blue-100'}`}>
              <FileText className={`h-5 w-5 ${isPaid ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                {isPaid ? "View Invoice" : "Edit Invoice"}
                <Badge variant={isPaid ? "default" : "secondary"} className={isPaid ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                  {form.status}
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-1">
                {isPaid ? "This invoice is paid and cannot be edited." : "Update invoice details. You can mark it as paid to finalize it."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Invoice Information Section */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Invoice Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">
                    Invoice Number
                  </Label>
                  <Input
                    id="invoiceNumber"
                    value={form.invoiceNumber}
                    onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                    placeholder="AWC-YYYYMM-XXX"
                    disabled={isPaid}
                    className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">
                    Client Name
                  </Label>
                  <Input
                    id="clientName"
                    value={form.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="Enter client name"
                    disabled={isPaid}
                    className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Details Section */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Financial Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Currency
                  </Label>
                  <Select value={form.currency} onValueChange={(value) => handleChange('currency', value)} disabled={isPaid}>
                    <SelectTrigger className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700">
                    Total Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="totalAmount"
                      type="number"
                      value={form.totalAmount}
                      onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      disabled={isPaid}
                      className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-16`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-sm">{form.currency}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Information Section */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-900">Date Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="issueDate" className="text-sm font-medium text-gray-700">
                    Issue Date
                  </Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={form.issueDate.split('T')[0]}
                    onChange={(e) => handleChange('issueDate', e.target.value)}
                    disabled={isPaid}
                    className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={form.dueDate?.split('T')[0] || ''}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    disabled={isPaid}
                    className={`${isPaid ? 'bg-gray-50' : 'bg-white'} border-gray-300 focus:border-blue-500 focus:ring-blue-500`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Payment Status Section */}
          {!isPaid && (
            <Card className="border-warning/20 bg-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground mb-2">Payment Status</h3>
                    <div className="flex items-center space-x-3">
                      <Switch
                        id="mark-as-paid"
                        checked={isMarkedAsPaid}
                        onCheckedChange={setIsMarkedAsPaid}
                        aria-label="Mark as paid"
                      />
                      <Label htmlFor="mark-as-paid" className="text-sm font-medium text-warning cursor-pointer">
                        Mark Invoice as Paid to Finalize
                      </Label>
                    </div>
                    {isMarkedAsPaid && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            Invoice will be marked as paid and finalized
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <DialogFooter className="pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex justify-end gap-3 w-full">
            {isPaid && (
              <Button 
                onClick={handlePrint} 
                variant="outline" 
                className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                <FileText className="h-4 w-4 mr-2" />
                Print Invoice
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50">
                Cancel
              </Button>
            </DialogClose>
            {!isPaid && (
              <Button 
                onClick={handleSave} 
                className={`${isMarkedAsPaid ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isMarkedAsPaid ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Save & Mark Paid
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceModal;
