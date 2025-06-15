
import { useState, useEffect, useCallback } from 'react';
import { Quotation, Client, User } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';
import { mockUsers } from '@/data/mockData';

const mockClients: Client[] = [
  { id: '1', companyName: 'Michel-TLC', contactPerson: 'Michel', tinNumber: '', address: 'Goma', city: 'Goma', country: 'DRC', phone: '', email: 'michel@tlc.com' },
  { id: '2', companyName: 'ABC Corporation', contactPerson: 'John Doe', tinNumber: 'TIN123456', address: '123 Business St', city: 'Kigali', country: 'Rwanda', phone: '+250788123456', email: 'john@abc.com' },
  { id: '3', companyName: 'Global Exports', contactPerson: 'Jane Smith', tinNumber: 'TIN789012', address: '789 Trade Ave', city: 'Nairobi', country: 'Kenya', phone: '+254712345678', email: 'jane@globalexports.com' }
];

export const useQuotationForm = (initialQuotation: Quotation | null = null, user: User) => {
  const [clients] = useState<Client[]>(mockClients);
  const [userList] = useState<User[]>(mockUsers);
  const [clientName, setClientName] = useState(initialQuotation?.clientName || '');
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
          const totalQuantity = parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
          const avgClientRate = totalQuantity > 0 && initialQuotation.clientQuote ? initialQuotation.clientQuote / totalQuantity : 0;

          const commoditiesWithRate = parsed.map((c: any) => ({
            id: c.id || uuidv4(),
            name: c.name || '',
            quantityKg: c.quantityKg || 0,
            // Handle both old format (with charges) and new format (with rate)
            rate: c.rate !== undefined ? c.rate : (c.charges ? c.charges.reduce((sum: number, charge: any) => sum + (Number(charge.rate) || 0), 0) : 0),
            clientRate: c.clientRate !== undefined ? c.clientRate : avgClientRate,
          }));
          setCommodities(commoditiesWithRate);
        }
      } catch (e) {
        console.error("Failed to parse commodities from quotation volume", e);
        setCommodities([]);
      }
    } else {
        addCommodity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuotation]);

  const calculateTotals = useCallback(() => {
    const totalBuyRate = commodities.reduce((sum, commodity) => {
      const commodityRate = Number(commodity.rate) || 0;
      const quantity = Number(commodity.quantityKg) || 0;
      return sum + (commodityRate * quantity);
    }, 0);
    setBuyRate(totalBuyRate);
    
    const totalClientQuote = commodities.reduce((sum, commodity) => {
        const commodityClientRate = Number(commodity.clientRate) || 0;
        const quantity = Number(commodity.quantityKg) || 0;
        return sum + (commodityClientRate * quantity);
    }, 0);
    setClientQuote(totalClientQuote);

    const p = totalClientQuote - totalBuyRate;
    const pp = totalBuyRate > 0 ? (p / totalBuyRate) * 100 : 0;
    setProfit(p);
    setProfitPercentage(pp);
  }, [commodities]);

  useEffect(() => {
    calculateTotals();
  }, [commodities, calculateTotals]);
  
  const addCommodity = () => {
    const newCommodity: QuotationCommodity = { id: uuidv4(), name: '', quantityKg: 0, rate: 0, clientRate: 0 };
    setCommodities(prev => [...prev, newCommodity]);
  };

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) setCommodities(prev => prev.filter(c => c.id !== id));
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg' | 'rate' | 'clientRate', value: string | number) => {
    setCommodities(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    switch (id) {
        case 'destination': setDestination(value); break;
        case 'doorDelivery': setDoorDelivery(value); break;
        case 'countryOfOrigin': setCountryOfOrigin(value); break;
        case 'cargoDescription': setCargoDescription(value); break;
    }
  };

  const handleSelectChange = (field: string, value: string) => {
      switch (field) {
        case 'currency': setCurrency(value); break;
        case 'freightMode': setFreightMode(value as Quotation['freightMode']); break;
        case 'requestType': setRequestType(value as Quotation['requestType']); break;
        case 'quoteSentBy': setQuoteSentBy(value); break;
      }
  };

  const getQuotationPayload = (): Quotation => {
    const client = clients.find(c => c.companyName.toLowerCase().trim() === clientName.toLowerCase().trim());
    const baseQuotation = {
        ...initialQuotation,
        id: initialQuotation?.id || uuidv4(),
        clientId: client?.id,
        clientName: clientName,
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
    setClientName('');
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
    clientName,
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
    userList,
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
    setClientName,
    setClientQuote,
    setRemarks,
    setFollowUpDate,
    addCommodity,
    removeCommodity,
    updateCommodity,
    handleDetailsChange,
    handleSelectChange,
    getQuotationPayload,
    resetForm,
  };
};

