
import { useState } from 'react';
import { Quotation, Client, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useCommodityManager } from './useCommodityManager';
import { useQuotationCalculations } from './useQuotationCalculations';

const mockClients: Client[] = [
  { id: '1', companyName: 'Michel-TLC', contactPerson: 'Michel', tinNumber: '', address: 'Goma', city: 'Goma', country: 'DRC', phone: '', email: 'michel@tlc.com' },
  { id: '2', companyName: 'ABC Corporation', contactPerson: 'John Doe', tinNumber: 'TIN123456', address: '123 Business St', city: 'Kigali', country: 'Rwanda', phone: '+250788123456', email: 'john@abc.com' },
  { id: '3', companyName: 'Global Exports', contactPerson: 'Jane Smith', tinNumber: 'TIN789012', address: '789 Trade Ave', city: 'Nairobi', country: 'Kenya', phone: '+254712345678', email: 'jane@globalexports.com' }
];

export const useQuotationForm = (initialQuotation: Quotation | null = null, user: User) => {
  const [clients] = useState<Client[]>(mockClients);
  const [clientName, setClientName] = useState(initialQuotation?.clientName || '');
  
  const { commodities, setCommodities, addCommodity, removeCommodity, updateCommodity } = useCommodityManager(initialQuotation);
  const { buyRate, clientQuote, profit, profitPercentage } = useQuotationCalculations(commodities);
  
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

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    switch (id) {
        case 'destination': setDestination(value); break;
        case 'doorDelivery': setDoorDelivery(value); break;
        case 'countryOfOrigin': setCountryOfOrigin(value); break;
        case 'cargoDescription': setCargoDescription(value); break;
        case 'quoteSentBy': setQuoteSentBy(value); break;
    }
  };

  const handleSelectChange = (field: string, value: string) => {
      switch (field) {
        case 'currency': setCurrency(value); break;
        case 'freightMode': setFreightMode(value as Quotation['freightMode']); break;
        case 'requestType': setRequestType(value as Quotation['requestType']); break;
      }
  };

  // Calculate total volume from commodities
  const getTotalVolume = () => {
    return commodities.reduce((total, commodity) => total + (commodity.quantityKg || 0), 0);
  };

  const getQuotationPayload = (): Quotation => {
    const client = clients.find(c => c.companyName.toLowerCase().trim() === clientName.toLowerCase().trim());
    const totalVolume = getTotalVolume();
    
    const baseQuotation = {
        ...initialQuotation,
        id: initialQuotation?.id || uuidv4(),
        clientId: client?.id,
        clientName: clientName,
        volume: JSON.stringify(commodities), // Store commodities as JSON for detailed breakdown
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
        // Add total volume for easy access
        totalVolumeKg: totalVolume,
    };
    return baseQuotation as Quotation;
  };

  const resetForm = () => {
    setClientName('');
    setCommodities([]);
    setRemarks('');
    setDestination('');
    setDoorDelivery('');
    setCurrency('USD');
    setFreightMode('Air Freight');
    setCargoDescription('');
    setRequestType('Import');
    setCountryOfOrigin('');
    setQuoteSentBy(user.name);
    setFollowUpDate('');
    addCommodity();
  };

  return {
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
    setClientName,
    setRemarks,
    setFollowUpDate,
    addCommodity,
    removeCommodity,
    updateCommodity,
    handleDetailsChange,
    handleSelectChange,
    getQuotationPayload,
    resetForm,
    getTotalVolume,
  };
};
