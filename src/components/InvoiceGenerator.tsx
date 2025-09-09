import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { Quotation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ClientInformation from './invoice/ClientInformation';
import InvoiceDetails from './invoice/InvoiceDetails';
import InvoiceItems from './invoice/InvoiceItems';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { ProfessionalSaveButton } from '@/components/ui/professional-save-button';

interface InvoiceGeneratorProps {
  quotation: Quotation;
  onSave?: (invoice: InvoiceData) => void;
  onPrint?: (invoice: InvoiceData) => void;
}

const InvoiceGenerator = ({ quotation, onSave, onPrint }: InvoiceGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    clientsForSelection,
    selectedClient,
    onClientChange,
    handleClientInfoChange,
    invoiceData,
    handleInvoiceDataChange,
    items,
    addItem,
    removeItem,
    updateItemField,
    addCharge,
    removeCharge,
    updateCharge,
    calculateTotals,
  } = useInvoiceForm(quotation);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AWC-${year}${month}-${random}`;
  };

  const validateRequiredFields = () => {
    const errors = [];
    
    if (!selectedClient) {
      errors.push("Client must be selected");
    } else {
      // Focus on the three specific fields
      if (!selectedClient.tinNumber || !selectedClient.tinNumber.trim()) {
        errors.push("Client TIN number is required");
      }
      
      if (!selectedClient.email || !selectedClient.email.trim()) {
        errors.push("Client email is required");
      }
    }
    
    if (!invoiceData.paymentConditions.trim()) {
      errors.push("Payment conditions are required");
    }
    
    // Validate that at least one item exists with proper details
    if (items.length === 0) {
      errors.push("At least one invoice item is required");
    } else {
      items.forEach((item, index) => {
        if (!item.commodity.trim()) {
          errors.push(`Item ${index + 1}: Commodity description is required`);
        }
        if (!item.quantityKg || item.quantityKg <= 0) {
          errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        item.charges.forEach((charge, chargeIndex) => {
          if (!charge.description.trim()) {
            errors.push(`Item ${index + 1}, Charge ${chargeIndex + 1}: Description is required`);
          }
          if (!charge.rate || charge.rate <= 0) {
            errors.push(`Item ${index + 1}, Charge ${chargeIndex + 1}: Rate must be greater than 0`);
          }
        });
      });
    }
    
    return errors;
  };

  const getInvoicePayload = () => {
    const validationErrors = validateRequiredFields();
    
    if (validationErrors.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: (
          <div className="space-y-1">
            <p className="font-medium">Please fill in the following required fields:</p>
            <ul className="list-disc list-inside text-sm">
              {validationErrors.slice(0, 3).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {validationErrors.length > 3 && (
                <li>...and {validationErrors.length - 3} more</li>
              )}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return null;
    }

    const { subTotal, tva, total } = calculateTotals();
    
    const invoice: InvoiceData = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      quotationId: quotation?.id || '',
      quotationData: quotation,
      clientName: selectedClient!.companyName,
      clientAddress: `${selectedClient!.address}, ${selectedClient!.city}, ${selectedClient!.country}`,
      clientContactPerson: selectedClient!.contactPerson || '',
      clientTin: selectedClient!.tinNumber || '',
      destination: invoiceData.destination,
      doorDelivery: invoiceData.doorDelivery,
      salesperson: user?.name || 'N/A',
      deliverDate: invoiceData.deliverDate,
      paymentConditions: invoiceData.paymentConditions,
      validityDate: invoiceData.validityDate,
      awbNumber: invoiceData.awbNumber,
      items: items,
      subTotal,
      tva,
      totalAmount: total,
      currency: invoiceData.currency,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      createdBy: user?.id || '',
      createdAt: new Date().toISOString()
    };
    return invoice;
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const invoice = getInvoicePayload();
    if (invoice) {
      try {
        setIsSaving(true);
        await onSave?.(invoice);
        
        // Professional success notification with animation
        toast({
          title: "✅ Invoice Created Successfully",
          description: (
            <div className="space-y-2">
              <p className="font-medium text-green-800">
                Invoice #{invoice.invoiceNumber} has been generated
              </p>
              <div className="text-sm text-green-700">
                <p>• Client: {invoice.clientName}</p>
                <p>• Amount: {invoice.currency} {invoice.totalAmount.toLocaleString()}</p>
                <p>• Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          ),
          className: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "❌ Invoice Save Failed",
          description: (
            <div className="space-y-2">
              <p className="font-medium">
                {error instanceof Error ? error.message : "An unexpected error occurred while saving the invoice."}
              </p>
              <p className="text-sm opacity-90">Please check all required fields and try again.</p>
            </div>
          ),
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handlePrint = () => {
    const invoice = getInvoicePayload();
    if (invoice) {
      onPrint?.(invoice);
    }
  };

  const { subTotal, tva, total } = calculateTotals();
  const validationErrors = validateRequiredFields();

  // Calculate total volume from quotation for display
  const getTotalVolume = () => {
    if (quotation.totalVolumeKg) {
      return quotation.totalVolumeKg;
    }
    
    try {
      const parsed = JSON.parse(quotation.volume);
      if (Array.isArray(parsed)) {
        return parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
      }
    } catch (e) {
      const vol = Number(quotation.volume);
      if (!isNaN(vol)) {
        return vol;
      }
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Generate Professional Invoice
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <CheckCircle size={18} className="text-blue-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">From Approved Quotation #{quotation.id}</p>
                <p className="text-blue-700">
                  Volume: <span className="font-medium">{getTotalVolume().toLocaleString()} kg</span> • 
                  <span className="capitalize ml-2">{quotation.freightMode?.toLowerCase() || 'freight'}</span> • 
                  <span className="font-medium text-green-600 ml-2">{quotation.status.toUpperCase()}</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-medium">Service Route:</span>
              {quotation.requestType} from {quotation.countryOfOrigin || 'Origin'} to {quotation.destination}
            </p>
          </div>
          {validationErrors.length > 0 && (
            <div className="flex items-start gap-3 mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
              <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800">Complete Required Fields</p>
                <div className="text-sm text-amber-700">
                  <p>{validationErrors.length} field{validationErrors.length > 1 ? 's' : ''} need{validationErrors.length === 1 ? 's' : ''} attention:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {validationErrors.slice(0, 3).map((error, index) => (
                      <li key={index} className="text-xs">{error}</li>
                    ))}
                    {validationErrors.length > 3 && (
                      <li className="text-xs text-amber-600">+ {validationErrors.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-3">
          <ProfessionalSaveButton
            isLoading={isSaving}
            disabled={validationErrors.length > 0}
            onClick={handleSave}
            variant="success"
            loadingText="Creating Invoice..."
            className="min-w-[160px]"
          >
            Create Invoice
          </ProfessionalSaveButton>
          
          <Button 
            onClick={handlePrint} 
            variant="outline"
            className="border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 font-medium px-6 py-3"
            disabled={validationErrors.length > 0}
            size="lg"
          >
            <Printer size={18} className="mr-2" />
            Print Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientInformation
          clientsForSelection={clientsForSelection}
          selectedClient={selectedClient}
          onClientChange={onClientChange}
          onClientInfoChange={handleClientInfoChange}
          disabled={false}
        />
        <InvoiceDetails 
          invoiceData={invoiceData}
          onInvoiceDataChange={handleInvoiceDataChange}
          currencyDisabled={true}
        />
      </div>

      <InvoiceItems
        items={items}
        currency={invoiceData.currency}
        subTotal={subTotal}
        tva={tva}
        total={total}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onUpdateItemField={updateItemField}
        onAddCharge={addCharge}
        onRemoveCharge={removeCharge}
        onUpdateCharge={updateCharge}
      />
    </div>
  );
};

export default InvoiceGenerator;
