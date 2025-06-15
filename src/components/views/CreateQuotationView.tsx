import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Quotation, Client, User } from '@/types';
import { QuotationCommodity, InvoiceCharge } from '@/types/invoice';
import CommodityList from '../quotations/CommodityList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import QuotationFormDetails from '../quotations/QuotationFormDetails';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

// Defining mock clients locally to resolve import issue
const mockClients: Client[] = [
  { id: '1', companyName: 'Michel-TLC', contactPerson: 'Michel', tinNumber: '', address: 'Goma', city: 'Goma', country: 'DRC', phone: '', email: 'michel@tlc.com' },
  { id: '2', companyName: 'ABC Corporation', contactPerson: 'John Doe', tinNumber: 'TIN123456', address: '123 Business St', city: 'Kigali', country: 'Rwanda', phone: '+250788123456', email: 'john@abc.com' }
];

interface CreateQuotationViewProps {
  onQuotationCreated: (quotation: Quotation) => void;
  setActiveTab?: (tab: string) => void;
  user: User;
}

const CreateQuotationView = ({ onQuotationCreated, setActiveTab, user }: CreateQuotationViewProps) => {
  const { toast } = useToast();
  const [clients] = useState<Client[]>(mockClients);
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([]);
  const [buyRate, setBuyRate] = useState(0);
  const [clientQuote, setClientQuote] = useState(0);
  const [profit, setProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [destination, setDestination] = useState('');
  const [doorDelivery, setDoorDelivery] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [freightMode, setFreightMode] = useState<Quotation['freightMode']>('Air Freight');
  const [cargoDescription, setCargoDescription] = useState('');
  const [requestType, setRequestType] = useState<Quotation['requestType']>('Import');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [quoteSentBy, setQuoteSentBy] = useState(user.name);
  
  useEffect(() => {
    addCommodity();
  }, []);

  const addCommodity = () => {
    const newCommodity: QuotationCommodity = {
      id: uuidv4(),
      name: '',
      quantityKg: 0,
      charges: [{ id: uuidv4(), description: '', rate: 0 }]
    };
    setCommodities([...commodities, newCommodity]);
  };

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) {
      setCommodities(commodities.filter(c => c.id !== id));
    }
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg', value: string | number) => {
    setCommodities(commodities.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));
  };
  
  const addCharge = (commodityId: string) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        const newCharge: InvoiceCharge = { id: uuidv4(), description: '', rate: 0 };
        return { ...c, charges: [...c.charges, newCharge] };
      }
      return c;
    }));
  };

  const removeCharge = (commodityId: string, chargeId: string) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        if (c.charges.length > 1) {
          return { ...c, charges: c.charges.filter(charge => charge.id !== chargeId) };
        }
      }
      return c;
    }));
  };
  
  const updateCharge = (commodityId: string, chargeId: string, field: keyof Omit<InvoiceCharge, 'id'>, value: string | number) => {
    setCommodities(commodities.map(c => {
      if (c.id === commodityId) {
        return {
          ...c,
          charges: c.charges.map(charge =>
            charge.id === chargeId ? { ...charge, [field]: value } : charge
          )
        };
      }
      return c;
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [commodities, clientQuote]);

  const calculateTotals = () => {
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
  };
  
  const handleSaveQuotation = () => {
    if (!selectedClientName || clientQuote <= 0 || !buyRate || !currency) {
      toast({
        title: "Missing Fields",
        description: "Please select a client, and fill in commodities and pricing details.",
        variant: "destructive",
      });
      return;
    }

    const newQuotation: Quotation = {
      id: uuidv4(),
      clientId: clients.find(c => c.companyName === selectedClientName)?.id,
      clientName: selectedClientName,
      volume: JSON.stringify(commodities),
      currency,
      buyRate,
      clientQuote,
      profit,
      profitPercentage: `${profitPercentage.toFixed(2)}%`,
      remarks,
      destination,
      doorDelivery,
      status: 'pending',
      quoteSentBy: quoteSentBy,
      createdAt: new Date().toISOString(),
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      freightMode: freightMode,
      requestType: requestType,
      countryOfOrigin: countryOfOrigin,
      cargoDescription: cargoDescription,
    };
    
    onQuotationCreated(newQuotation);
    setCommodities([{ id: uuidv4(), name: '', quantityKg: 0, charges: [{id: uuidv4(), description: '', rate: 0}] }]);
    setSelectedClientName('');
    setClientQuote(0);
    setBuyRate(0);
    setProfit(0);
    setProfitPercentage(0);
    setRemarks('');
    setDestination('');
    setDoorDelivery('');
    setCurrency('USD');
    setFreightMode('Air Freight');
    setCargoDescription('');
    setRequestType('Import');
    setCountryOfOrigin('');
    setQuoteSentBy(user.name);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Quotation</h2>
          <p className="text-muted-foreground mt-1">Fill in the details to generate a new quotation for a client.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select onValueChange={setSelectedClientName} value={selectedClientName}>
                    <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(client => <SelectItem key={client.id} value={client.companyName}>{client.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <QuotationFormDetails
                quotationData={{
                  currency,
                  destination,
                  doorDelivery,
                  quoteSentBy,
                  freightMode,
                  requestType,
                  countryOfOrigin,
                  cargoDescription,
                }}
                onQuotationChange={(e) => {
                  const { id, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
                  switch (id) {
                    case 'destination': setDestination(value); break;
                    case 'doorDelivery': setDoorDelivery(value); break;
                    case 'quoteSentBy': setQuoteSentBy(value); break;
                    case 'countryOfOrigin': setCountryOfOrigin(value); break;
                    case 'cargoDescription': setCargoDescription(value); break;
                  }
                }}
                onSelectChange={(field, value) => {
                  switch (field) {
                    case 'currency': setCurrency(value); break;
                    case 'freightMode': setFreightMode(value as Quotation['freightMode']); break;
                    case 'requestType': setRequestType(value as Quotation['requestType']); break;
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Commodities</CardTitle></CardHeader>
            <CardContent>
              <CommodityList
                commodities={commodities}
                onUpdateCommodity={updateCommodity}
                onRemoveCommodity={removeCommodity}
                onAddCharge={addCharge}
                onRemoveCharge={removeCharge}
                onUpdateCharge={updateCharge}
                currency={currency}
              />
              <Button onClick={addCommodity} variant="outline" className="mt-4">
                Add Another Commodity
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-10">
          <Card>
            <CardHeader><CardTitle>Pricing Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Buy Rate ({currency})</Label>
                <Input value={buyRate.toFixed(2)} disabled />
              </div>
              <div>
                <Label>Client Quote ({currency})</Label>
                <Input type="number" value={clientQuote} onChange={e => setClientQuote(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label>Profit ({currency})</Label>
                <Input value={profit.toFixed(2)} disabled />
              </div>
              <div>
                <Label>Profit Margin (%)</Label>
                <Input value={profitPercentage.toFixed(2)} disabled />
              </div>
              <div>
                <Label>Remarks</Label>
                <Textarea value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4 mt-6 border-t">
        <Button variant="outline" onClick={() => setActiveTab && setActiveTab("quotations")}>Cancel</Button>
        <Button onClick={handleSaveQuotation}>Save Quotation</Button>
      </div>
    </div>
  );
};

export default CreateQuotationView;
