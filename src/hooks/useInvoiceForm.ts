
import { useState, useEffect, useCallback } from 'react';
import { InvoiceItem, InvoiceData, Client, InvoiceCharge } from '@/types/invoice';
import { Quotation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
  },
  { 
    id: '3', 
    companyName: 'Global Exports', 
    contactPerson: 'Jane Smith', 
    tinNumber: 'TIN789012', 
    address: '789 Trade Ave', 
    city: 'Nairobi', 
    country: 'Kenya', 
    phone: '+254712345678', 
    email: 'jane@globalexports.com' 
  }
];

export const useInvoiceForm = (quotation: Quotation) => {
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
  
  const [items, setItems] = useState<InvoiceItem[]>([]);

  const calculateItemsWithTotals = useCallback((currentItems: InvoiceItem[]) => {
    return currentItems.map(item => {
      const itemTotal = item.charges.reduce((sum, charge) => {
        const chargeRate = charge.rate || 0;
        const itemQty = item.quantityKg || 0;
        return sum + (itemQty * chargeRate);
      }, 0);
      return { ...item, total: itemTotal };
    });
  }, []);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      quantityKg: 0,
      commodity: '',
      charges: [{ id: `${Date.now().toString()}.1`, description: '', rate: 0 }],
      total: 0
    };
    setItems(prevItems => calculateItemsWithTotals([...prevItems, newItem]));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prevItems => calculateItemsWithTotals(prevItems.filter(item => item.id !== id)));
    }
  };

  const updateItemField = (itemId: string, field: 'quantityKg' | 'commodity', value: any) => {
    setItems(prevItems => {
        const newItems = prevItems.map(item => {
            if (item.id === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        });
        return calculateItemsWithTotals(newItems);
    });
  };

  const addCharge = (itemId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === itemId) {
          const newCharge: InvoiceCharge = {
            id: Date.now().toString(),
            description: '',
            rate: 0,
          };
          return { ...item, charges: [...item.charges, newCharge] };
        }
        return item;
      });
      return calculateItemsWithTotals(newItems);
    });
  };

  const removeCharge = (itemId: string, chargeId: string) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === itemId && item.charges.length > 1) {
          const updatedCharges = item.charges.filter(c => c.id !== chargeId);
          return { ...item, charges: updatedCharges };
        }
        return item;
      });
      return calculateItemsWithTotals(newItems);
    });
  };

  const updateCharge = (itemId: string, chargeId: string, field: keyof InvoiceCharge, value: string | number) => {
    setItems(prevItems => {
      const newItems = prevItems.map(item => {
        if (item.id === itemId) {
          const updatedCharges = item.charges.map(charge => {
            if (charge.id === chargeId) {
              const newV = (field === 'rate') ? parseFloat(value as string) || 0 : value;
              return { ...charge, [field]: newV };
            }
            return charge;
          });
          return { ...item, charges: updatedCharges };
        }
        return item;
      });
      return calculateItemsWithTotals(newItems);
    });
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

    const setItemsFromQuotationFallback = () => {
      const quantity = !isNaN(Number(quotation.volume)) ? Number(quotation.volume) : 1;
      const rate = quotation.clientQuote || 0;
      
      setItems([
        {
          id: '1',
          quantityKg: quantity,
          commodity: `Services as per Quotation ${quotation.id}`,
          charges: [
            {
              id: '1.1',
              description: '',
              rate: rate,
            }
          ],
          total: quantity * rate,
        }
      ]);
    };
    
    let parsedCommodities: any[] | null = null;
    if (quotation.volume) {
      try {
        const parsed = JSON.parse(quotation.volume);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedCommodities = parsed;
        }
      } catch (e) {
        // Not a JSON string with commodities, will use fallback.
      }
    }

    if (parsedCommodities) {
      const newItems: InvoiceItem[] = parsedCommodities.map((commodity: any) => {
        let charges: InvoiceCharge[];
        let itemTotal: number;

        if (commodity.charges && Array.isArray(commodity.charges)) { // Handle old quotations with charges
          charges = commodity.charges.map((c: any) => ({ ...c, id: uuidv4() }));
          itemTotal = (commodity.quantityKg || 0) * charges.reduce((sum, c) => sum + (c.rate || 0), 0);
        } else { // Handle new quotations with a single rate
          const clientRate = commodity.clientRate !== undefined ? commodity.clientRate : (commodity.rate || 0);
          charges = [{
            id: uuidv4(),
            description: `Charge for ${commodity.name || 'N/A'}`,
            rate: clientRate,
          }];
          itemTotal = (commodity.quantityKg || 0) * clientRate;
        }

        return {
          id: uuidv4(),
          quantityKg: commodity.quantityKg || 0,
          commodity: commodity.name || 'N/A',
          charges: charges,
          total: itemTotal,
        };
      });
      setItems(newItems);
    } else {
      // Fallback for when volume is not a JSON of commodities
      setItemsFromQuotationFallback();
    }
  }, [quotation]);

  const handleInvoiceDataChange = (field: string, value: string) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotals = useCallback(() => {
    const subTotal = items.reduce((sum, item) => sum + item.total, 0);
    const tva = subTotal * 0.18; // 18% VAT
    const total = subTotal + tva;
    return { subTotal, tva, total };
  }, [items]);

  return {
    clientsForSelection,
    selectedClient,
    onClientChange: setSelectedClient,
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
  };
};
