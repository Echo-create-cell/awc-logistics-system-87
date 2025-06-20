import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Save, AlertCircle } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';
import { Quotation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ClientInformation from './invoice/ClientInformation';
import InvoiceDetails from './invoice/InvoiceDetails';
import InvoiceItems from './invoice/InvoiceItems';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';

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
    }
    
    if (!invoiceData.destination.trim()) {
      errors.push("Destination is required");
    }
    
    if (!invoiceData.doorDelivery.trim()) {
      errors.push("Door delivery address is required");
    }
    
    if (!invoiceData.deliverDate) {
      errors.push("Delivery date is required");
    }
    
    if (!invoiceData.validityDate) {
      errors.push("Validity date is required");
    }
    
    if (!invoiceData.awbNumber.trim()) {
      errors.push("AWB number is required");
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

  const handleSave = () => {
    const invoice = getInvoicePayload();
    if (invoice) {
      onSave?.(invoice);
      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoice.invoiceNumber} has been created successfully with all required information.`,
      });
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Generate Invoice</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Quotation Volume: <span className="font-medium">{getTotalVolume().toLocaleString()} kg</span>
          </p>
          {validationErrors.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
              <AlertCircle size={16} />
              <span>{validationErrors.length} required field{validationErrors.length > 1 ? 's' : ''} missing</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSave} 
            className="bg-green-600 hover:bg-green-700"
            disabled={validationErrors.length > 0}
          >
            <Save size={16} className="mr-2" />
            Save Invoice
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="outline"
            disabled={validationErrors.length > 0}
          >
            <Printer size={16} className="mr-2" />
            Print Preview
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClientInformation
          clientsForSelection={clientsForSelection}
          selectedClient={selectedClient}
          onClientChange={onClientChange}
          disabled={true}
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
