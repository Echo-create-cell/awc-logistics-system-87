import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, FileText, Printer, Save } from 'lucide-react';
import { InvoiceItem, InvoiceData, Client } from '@/types/invoice';
import { Quotation } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

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
  quotation?: Quotation;
  onSave?: (invoice: InvoiceData) => void;
  onPrint?: (invoice: InvoiceData) => void;
}

const InvoiceGenerator = ({ quotation, onSave, onPrint }: InvoiceGeneratorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
    if (quotation) {
      setSelectedClient({
        id: 'custom',
        companyName: quotation.clientName || '',
        contactPerson: '',
        tinNumber: '',
        address: quotation.doorDelivery || '',
        city: '',
        country: '',
        phone: '',
        email: ''
      });
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
          description: quotation.remarks || "As per Quotation",
          price: quotation.clientQuote,
          total: quotation.clientQuote * (!isNaN(Number(quotation.volume)) ? Number(quotation.volume) : 1)
        }
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="client">Select Client</Label>
              <Select onValueChange={(value) => {
                const client = mockClients.find(c => c.id === value);
                setSelectedClient(client || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.companyName} - {client.contactPerson}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedClient && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <p><strong>Company:</strong> {selectedClient.companyName}</p>
                <p><strong>Contact:</strong> {selectedClient.contactPerson}</p>
                <p><strong>TIN:</strong> {selectedClient.tinNumber || 'N/A'}</p>
                <p><strong>Address:</strong> {selectedClient.address}, {selectedClient.city}, {selectedClient.country}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={invoiceData.destination}
                  onChange={(e) => setInvoiceData({...invoiceData, destination: e.target.value})}
                  placeholder="Destination"
                />
              </div>
              <div>
                <Label htmlFor="doorDelivery">Door Delivery</Label>
                <Input
                  id="doorDelivery"
                  value={invoiceData.doorDelivery}
                  onChange={(e) => setInvoiceData({...invoiceData, doorDelivery: e.target.value})}
                  placeholder="Door delivery address"
                />
              </div>
              <div>
                <Label htmlFor="deliverDate">Delivery Date</Label>
                <Input
                  id="deliverDate"
                  type="date"
                  value={invoiceData.deliverDate}
                  onChange={(e) => setInvoiceData({...invoiceData, deliverDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="validityDate">Validity Date</Label>
                <Input
                  id="validityDate"
                  type="date"
                  value={invoiceData.validityDate}
                  onChange={(e) => setInvoiceData({...invoiceData, validityDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="awbNumber">AWB Number</Label>
                <Input
                  id="awbNumber"
                  value={invoiceData.awbNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, awbNumber: e.target.value})}
                  placeholder="Air Waybill number"
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={invoiceData.currency} onValueChange={(value) => setInvoiceData({...invoiceData, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RWF">RWF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="paymentConditions">Payment Conditions</Label>
              <Textarea
                id="paymentConditions"
                value={invoiceData.paymentConditions}
                onChange={(e) => setInvoiceData({...invoiceData, paymentConditions: e.target.value})}
                placeholder="Payment terms and conditions"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invoice Items</CardTitle>
            <Button onClick={addItem} size="sm">
              <Plus size={16} className="mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
                <div className="col-span-2">
                  <Label className="text-xs">Quantity (KG)</Label>
                  <Input
                    type="number"
                    value={item.quantityKg}
                    onChange={(e) => updateItem(item.id, 'quantityKg', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Commodity</Label>
                  <Input
                    value={item.commodity}
                    onChange={(e) => updateItem(item.id, 'commodity', e.target.value)}
                    placeholder="Item name"
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                <div className="col-span-1">
                  <Label className="text-xs">Total</Label>
                  <p className="p-2 bg-gray-50 rounded text-sm font-medium">
                    {item.total.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Sub Total:</span>
              <span className="font-bold">{invoiceData.currency} {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">TVA (18%):</span>
              <span className="font-bold">{invoiceData.currency} {tva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-lg border-t pt-2">
              <span className="font-bold">Total Amount:</span>
              <span className="font-bold text-green-600">{invoiceData.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceGenerator;
