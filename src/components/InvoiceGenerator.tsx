import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Save } from 'lucide-react';
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

  const getInvoicePayload = () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client before proceeding.",
        variant: "destructive",
      });
      return null;
    }

    const { subTotal, tva, total } = calculateTotals();
    
    const invoice: InvoiceData = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      quotationId: quotation?.id || '',
      clientName: selectedClient.companyName,
      clientAddress: `${selectedClient.address}, ${selectedClient.city}, ${selectedClient.country}`,
      clientTin: selectedClient.tinNumber,
      destination: invoiceData.destination,
      doorDelivery: invoiceData.doorDelivery,
      salesperson: user?.name || '',
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
        description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Generate Invoice</h2>
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save size={16} className="mr-2" />
            Save Invoice
          </Button>
          <Button onClick={handlePrint} variant="outline">
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
          disabled={true} // Client is set from quotation, so disable selection
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
