import React, { useState, useEffect } from 'react';
import { Quotation, Client } from '@/types';
import { QuotationCommodity, InvoiceCharge } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';
import CommodityList from '../../quotations/CommodityList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import QuotationFormDetails from '../../quotations/QuotationFormDetails';

const mockClients: Client[] = [
  { id: '1', companyName: 'Michel-TLC', contactPerson: 'Michel', tinNumber: '', address: 'Goma', city: 'Goma', country: 'DRC', phone: '', email: 'michel@tlc.com' },
  { id: '2', companyName: 'ABC Corporation', contactPerson: 'John Doe', tinNumber: 'TIN123456', address: '123 Business St', city: 'Kigali', country: 'Rwanda', phone: '+250788123456', email: 'john@abc.com' }
];

interface QuotationFormProps {
  quotation: Quotation;
  onSave: (quotation: Quotation) => void;
  onClose: () => void;
}

const QuotationForm = ({ quotation, onSave, onClose }: QuotationFormProps) => {
  const [clients] = useState<Client[]>(mockClients);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([]);
  const [buyRate, setBuyRate] = useState(0);
  const [clientQuote, setClientQuote] = useState(0);
  const [profit, setProfit] = useState(0);
  const [profitPercentage, setProfitPercentage] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [destination, setDestination] = useState('');
  const [doorDelivery, setDoorDelivery] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [followUpDate, setFollowUpDate] = useState('');
  const [freightMode, setFreightMode] = useState<Quotation['freightMode']>();
  const [cargoDescription, setCargoDescription] = useState('');
  const [requestType, setRequestType] = useState<Quotation['requestType']>();
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [quoteSentBy, setQuoteSentBy] = useState('');

  useEffect(() => {
    if (quotation) {
      setSelectedClientId(quotation.clientId);
      setClientQuote(quotation.clientQuote);
      setRemarks(quotation.remarks);
      setDestination(quotation.destination || '');
      setDoorDelivery(quotation.doorDelivery || '');
      setCurrency(quotation.currency);
      setFollowUpDate(quotation.followUpDate ? new Date(quotation.followUpDate).toISOString().split('T')[0] : '');
      setFreightMode(quotation.freightMode);
      setCargoDescription(quotation.cargoDescription || '');
      setRequestType(quotation.requestType);
      setCountryOfOrigin(quotation.countryOfOrigin || '');
      setQuoteSentBy(quotation.quoteSentBy || '');

      try {
        const parsed = JSON.parse(quotation.volume);
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
    }
  }, [quotation]);

  useEffect(() => {
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

  const addCommodity = () => {
    const newCommodity: QuotationCommodity = { id: uuidv4(), name: '', quantityKg: 0, charges: [{ id: uuidv4(), description: '', rate: 0 }] };
    setCommodities([...commodities, newCommodity]);
  };

  const removeCommodity = (id: string) => {
    if (commodities.length > 1) setCommodities(commodities.filter(c => c.id !== id));
  };

  const updateCommodity = (id: string, field: 'name' | 'quantityKg', value: string | number) => {
    setCommodities(commodities.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  const addCharge = (commodityId: string) => {
    setCommodities(commodities.map(c => c.id === commodityId ? { ...c, charges: [...c.charges, { id: uuidv4(), description: '', rate: 0 }] } : c));
  };

  const removeCharge = (commodityId: string, chargeId: string) => {
    setCommodities(commodities.map(c => (c.id === commodityId && c.charges.length > 1) ? { ...c, charges: c.charges.filter(ch => ch.id !== chargeId) } : c));
  };
  
  const updateCharge = (commodityId: string, chargeId: string, field: keyof Omit<InvoiceCharge, 'id'>, value: string | number) => {
    setCommodities(commodities.map(c => c.id === commodityId ? { ...c, charges: c.charges.map(ch => ch.id === chargeId ? { ...ch, [field]: value } : ch) } : c));
  };
  
  const handleSave = () => {
    const updatedQuotation: Quotation = {
      ...quotation,
      clientId: selectedClientId,
      clientName: clients.find(c => c.id === selectedClientId)?.companyName || quotation.clientName,
      volume: JSON.stringify(commodities),
      buyRate,
      clientQuote,
      profit,
      profitPercentage: `${profitPercentage.toFixed(2)}%`,
      remarks,
      destination,
      doorDelivery,
      currency,
      followUpDate,
      freightMode,
      cargoDescription,
      requestType,
      countryOfOrigin,
      quoteSentBy,
    };
    onSave(updatedQuotation);
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Client</Label>
                  <Select onValueChange={setSelectedClientId} value={selectedClientId}>
                    <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
                    <SelectContent>
                      {clients.map(client => <SelectItem key={client.id} value={client.id}>{client.companyName}</SelectItem>)}
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

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Pricing Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Total Buy Rate ({currency})</Label><Input value={buyRate.toFixed(2)} disabled /></div>
              <div><Label>Client Quote ({currency})</Label><Input type="number" value={clientQuote} onChange={e => setClientQuote(parseFloat(e.target.value) || 0)} /></div>
              <div><Label>Profit ({currency})</Label><Input value={profit.toFixed(2)} disabled /></div>
              <div><Label>Profit Margin (%)</Label><Input value={profitPercentage.toFixed(2)} disabled /></div>
               <div>
                  <Label htmlFor="followUpDate">Follow Up Date</Label>
                  <Input id="followUpDate" type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} />
                </div>
              <div><Label>Remarks</Label><Textarea value={remarks} onChange={e => setRemarks(e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

export default QuotationForm;
