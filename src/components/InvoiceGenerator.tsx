import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Printer, Save } from 'lucide-react';
import { InvoiceItem, InvoiceData, Client } from '@/types/invoice';
import { Quotation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import ClientInformation from './invoice/ClientInformation';
import InvoiceDetails from './invoice/InvoiceDetails';
import InvoiceItems from './invoice/InvoiceItems';

// Mock clients data
const mockClients: Client[] = [
  {
    id: '1',
    companyName: 'Michel-TLC',
    contactPerson: 'Michel',
    tinNumber: '',
    address: 'Goma',
    city: 'Goma',
    country: 'DRC',
    phone: '',
    email: 'michel@tlc.com'
  },
  {
    id: '2',
    companyName: 'ABC Corporation',
    contactPerson: 'John Doe',
    tinNumber: 'TIN123456',
    address: '123 Business St',
    city: 'Kigali',
    country: 'Rwanda',
    phone: '+250788123456',
    email: 'john@abc.com'
  }
];

interface InvoiceGeneratorProps {
  quotation: Quotation;
  onSave?: (invoice: InvoiceData) => void;
  onPrint?: (invoice: InvoiceData) => void;
}

const InvoiceGenerator = ({ quotation, onSave, onPrint }: InvoiceGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clientsForSelection, setClientsForSelection] = useState<Client[]>(mockClients);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceData, setInvoiceData] = useState({
    destination: '',
    doorDelivery: '',
    deliverDate: '',
    paymentConditions: 'Net 30 days',
    validityDate: '',
    awbNumber: '',
    currency: 'USD'
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      quantityKg: 0,
      commodity: '',
      description: '',
      price: 0,
      total: 0
    }
  ]);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      quantityKg: 0,
      commodity: '',
      description: '',
      price: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantityKg' || field === 'price') {
          updated.total = updated.quantityKg * updated.price;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const tva = subTotal * 0.18; // 18% VAT
    const total = subTotal + tva;
    return { subTotal, tva, total };
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AWC-${year}${month}-${random}`;
  };

  useEffect(() => {
    const clientFromList = mockClients.find(c => c.companyName === quotation.clientName);

    if (clientFromList) {
      setSelectedClient(clientFromList);
      if (clientsForSelection.length > mockClients.length) {
          setClientsForSelection(mockClients);
      }
    } else {
      // Fallback for when client is not in the list
      const newClient: Client = {
        id: `custom-${quotation.id}`,
        companyName: quotation.clientName || 'N/A',
        contactPerson: '',
        tinNumber: '',
        address: quotation.doorDelivery || '',
        city: '',
        country: '',
        phone: '',
        email: ''
      };
      setClientsForSelection([newClient, ...mockClients]);
      setSelectedClient(newClient);
    }

    setInvoiceData(prev => ({
      ...prev,
      destination: quotation.destination || '',
      doorDelivery: quotation.doorDelivery || '',
      currency: quotation.currency || 'USD'
    }));
    setItems([
      {
        id: '1',
        quantityKg: !isNaN(Number(quotation.volume)) ? Number(quotation.volume) : 1,
        commodity: "Quoted Commodity",
        description: quotation.remarks || `As per Quotation ${quotation.id}`,
        price: quotation.clientQuote,
        total: quotation.clientQuote * (!isNaN(Number(quotation.volume)) ? Number(quotation.volume) : 1)
      }
    ]);
  }, [quotation]);

  const handleSave = () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client before saving the invoice.",
        variant: "destructive",
      });
      return;
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

    onSave?.(invoice);
    
    toast({
      title: "Invoice Saved",
      description: `Invoice ${invoice.invoiceNumber} has been created successfully.`,
    });
  };

  const handlePrint = () => {
    if (!selectedClient) {
      toast({
        title: "Client Required",
        description: "Please select a client before printing the invoice.",
        variant: "destructive",
      });
      return;
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

    onPrint?.(invoice);
  };

  const handleInvoiceDataChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
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
          onClientChange={setSelectedClient}
          disabled={true} // Client is set from quotation, so disable selection
        />
        <InvoiceDetails 
          invoiceData={invoiceData}
          onInvoiceDataChange={handleInvoiceDataChange}
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
        onUpdateItem={updateItem}
      />
    </div>
  );
};

export default InvoiceGenerator;
