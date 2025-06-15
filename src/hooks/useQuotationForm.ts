
import { useState, useEffect, useCallback } from 'react';
import { Quotation, Client, User } from '@/types';
import { QuotationCommodity, InvoiceCharge } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

const mockClients: Client[] = [
  { id: '1', companyName: 'Michel-TLC', contactPerson: 'Michel', tinNumber: '', address: 'Goma', city: 'Goma', country: 'DRC', phone: '', email: 'michel@tlc.com' },
  { id: '2', companyName: 'ABC Corporation', contactPerson: 'John Doe', tinNumber: 'TIN123456', address: '123 Business St', city: 'Kigali', country: 'Rwanda', phone: '+250788123456', email: 'john@abc.com' }
];

export const useQuotationForm = (initialQuotation: Quotation | null = null, user: User) => {
  const [clients] = useState<Client[]>(mockClients);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(initialQuotation?.clientId);
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([]);
  const [buyRate, setBuyRate] = useState(0);
  const [clientQuote, setClientQuote] = useState(initialQuotation?.clientQuote || 0);
  const [profit, setProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [remarks, setRemarks] = useState(initialQuotation?.remarks || '');
  const [destination, setDestination] = useState(initialQuotation?.destination || '');
  const [doorDelivery, setDoorDelivery] = useState(initialQuotation?.doorDelivery || '');
  const [currency, setCurrency] = useState(initialQuotation?.currency || 'USD');
  const [freightMode, setFreightMode] = useState<Quotation['freightMode']>(initialQuotation?.freightMode || 'Air Freight');
  const [cargoDescription, setCargoDescription] = useState(initialQuotation?.cargoDescription || '');
  const [requestType, setRequestType] = useState<Quotation['requestType']>(initialQuotation?.requestType || 'Import');
  const [countryOfOrigin, setCountryOfOrigin] = useState(initialQuotation?.countryOfOrigin || '');
  const [quoteSentBy, setQuoteSentBy] = useState(initialQuotation?.quoteSentBy || user.name);
  const [followUpDate, setFollowUpDate] = useState(initialQuotation?.followUpDate ? new Date(initialQuotation.followUpDate).toISOString().split('T')[0] : '');

  useEffect(() => {
    if (initialQuotation) {
      try {
        const parsed = JSON.parse(initialQuotation.volume);
        if (Array.isArray(parsed)) {
          const commoditiesWithCharges = parsed.map((c: any) => ({
            ...c,
            id: c.id || uuidv4(),
            charges: c.charges && c.charges.length > 0 ? c.charges.map((ch: any) => ({...ch, id: ch.id || uuidv4()})) : [{ id: uuidv4(), description: '', rate: 0 }],
          }));
          setCommodities(commoditiesWithCharges);
        }
      } catch (e) {
        console.error("Failed to parse commodities from quotation volume", e);
        setCommodities([]);
      }
    } else {
        addCommodity();
    }
  }, [initialQuotation]);

  const calculateTotals = useCallback(() => {
    const totalBuyRate = commodities.reduce((sum, commodity) => {
      const commodityRate = commodity.charges.reduce((chargeSum, charge) => chargeSum + (Number(charge.rate) || 0), 0);
      const quantity = Number(commodity.quantityKg) || 0;
      return sum + (commodityRate * quantity);
    }, 0);
    setBuyRate(totalBuyRate);
    
    const p = (clientQuote || 0) - totalBuyRate;
    const pp = totalBuyRate > 0 ? (p / totalBuyRate) * 100 : 0;
    setProfit(p);
    setProfitPercentage(pp);
  }, [commodities, clientQuote]);

  useEffect(() => {
    calculateTotals();
  }, [commodities, clientQuote, calculateTotals]);
  
  const addCommodity = () => {
    const newCommodity: QuotationCommodity = { id: uuidv4(), name: '', quantityKg: 0, charges: [{ id: uuidv4(), description: '', rate: 0 }] };
    setCommodities(prev => [...prev, newCommodity]);
  };

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) setCommodities(prev => prev.filter(c => c.id !== id));
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg', value: string | number) => {
    setCommodities(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const addCharge = (commodityId: string) => {
    setCommodities(prev => prev.map(c => c.id === commodityId ? { ...c, charges: [...c.charges, { id: uuidv4(), description: '', rate: 0 }] } : c));
  };

  const removeCharge = (commodityId: string, chargeId: string) => {
    setCommodities(prev => prev.map(c => (c.id === commodityId && c.charges.length > 1) ? { ...c, charges: c.charges.filter(ch => ch.id !== chargeId) } : c));
  };
  
  const updateCharge = (commodityId: string, chargeId: string, field: keyof Omit<InvoiceCharge, 'id'>, value: string | number) => {
    setCommodities(prev => prev.map(c => c.id === commodityId ? { ...c, charges: c.charges.map(ch => ch.id === chargeId ? { ...ch, [field]: value } : ch) } : c));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    switch (id) {
        case 'destination': setDestination(value); break;
        case 'doorDelivery': setDoorDelivery(value); break;
        case 'quoteSentBy': setQuoteSentBy(value); break;
        case 'countryOfOrigin': setCountryOfOrigin(value); break;
        case 'cargoDescription': setCargoDescription(value); break;
    }
  };

  const handleSelectChange = (field: string, value: string) => {
      switch (field) {
        case 'currency': setCurrency(value); break;
        case 'freightMode': setFreightMode(value as Quotation['freightMode']); break;
        case 'requestType': setRequestType(value as Quotation['requestType']); break;
      }
  };

  const getQuotationPayload = (): Quotation => {
    const clientName = clients.find(c => c.id === selectedClientId)?.companyName;
    const baseQuotation = {
        ...initialQuotation,
        id: initialQuotation?.id || uuidv4(),
        clientId: selectedClientId,
        clientName: clientName || initialQuotation?.clientName || '',
        volume: JSON.stringify(commodities),
        currency,
        buyRate,
        clientQuote,
        profit,
        profitPercentage: `${profitPercentage.toFixed(2)}%`,
        remarks,
        destination,
        doorDelivery,
        quoteSentBy,
        followUpDate,
        freightMode,
        requestType,
        countryOfOrigin,
        cargoDescription,
        status: initialQuotation?.status || 'pending',
        createdAt: initialQuotation?.createdAt || new Date().toISOString(),
    };
    return baseQuotation as Quotation;
  };

  const resetForm = () => {
    setSelectedClientId(undefined);
    setCommodities([]);
    setClientQuote(0);
    setRemarks('');
    setDestination('');
    setDoorDelivery('');
    setCurrency('USD');
    setFreightMode('Air Freight');
    setCargoDescription('');
    setRequestType('Import');
    setCountryOfOrigin('');
    setQuoteSentBy(user.name);
    addCommodity();
  };

  return {
    // State
    clients,
    selectedClientId,
    commodities,
    buyRate,
    clientQuote,
    profit,
    profitPercentage,
    remarks,
    destination,
    doorDelivery,
    currency,
    freightMode,
    cargoDescription,
    requestType,
    countryOfOrigin,
    quoteSentBy,
    followUpDate,
    quotationData: {
      currency,
      destination,
      doorDelivery,
      quoteSentBy,
      freightMode,
      requestType,
      countryOfOrigin,
      cargoDescription,
    },
    // Handlers
    setSelectedClientId,
    setClientQuote,
    setRemarks,
    setFollowUpDate,
    addCommodity,
    removeCommodity,
    updateCommodity,
    addCharge,
    removeCharge,
    updateCharge,
    handleDetailsChange,
    handleSelectChange,
    getQuotationPayload,
    resetForm,
  };
};

