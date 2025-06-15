
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus } from 'lucide-react';
import { Quotation, User } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { v4 as uuidv4 } from 'uuid';

interface CreateQuotationViewProps {
  user: User;
  onQuotationCreated: (quotation: Quotation) => void;
}

const initialQuotationState = {
  clientName: '',
  currency: 'USD',
  buyRate: '',
  followUpDate: '',
  remarks: '',
  destination: '',
  doorDelivery: '',
  quoteSentBy: '',
};

const CreateQuotationView = ({ user, onQuotationCreated }: CreateQuotationViewProps) => {
  const { toast } = useToast();
  const [newQuotation, setNewQuotation] = useState(initialQuotationState);
  const [commodities, setCommodities] = useState<QuotationCommodity[]>([
    { id: uuidv4(), name: '', quantityKg: 0, rate: 0 },
  ]);

  const [calculatedProfit, setCalculatedProfit] = useState({
    profit: 0,
    profitPercentage: '0.00%',
  });

  const clientQuoteTotal = commodities.reduce((acc, commodity) => {
    return acc + (commodity.quantityKg || 0) * (commodity.rate || 0);
  }, 0);

  useEffect(() => {
    const buyRate = parseFloat(newQuotation.buyRate);

    if (!isNaN(buyRate) && buyRate > 0) {
      const profit = clientQuoteTotal - buyRate;
      const profitPercentage = `${((profit / buyRate) * 100).toFixed(2)}%`;
      setCalculatedProfit({ profit, profitPercentage });
    } else {
      const profit = !isNaN(clientQuoteTotal) && !isNaN(buyRate) ? clientQuoteTotal - buyRate : 0;
      setCalculatedProfit({ profit: profit, profitPercentage: 'N/A' });
    }
  }, [newQuotation.buyRate, clientQuoteTotal]);

  const handleNewQuotationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewQuotation(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setNewQuotation(prev => ({ ...prev, currency: value }));
  };
  
  const handleAddCommodity = () => {
    setCommodities([...commodities, { id: uuidv4(), name: '', quantityKg: 0, rate: 0 }]);
  };

  const handleRemoveCommodity = (id: string) => {
    if (commodities.length > 1) {
      setCommodities(commodities.filter(c => c.id !== id));
    }
  };

  const handleCommodityChange = (id: string, field: keyof QuotationCommodity, value: string | number) => {
    setCommodities(commodities.map(c => {
      if (c.id === id) {
        const parsedValue = (field === 'quantityKg' || field === 'rate') ? parseFloat(value as string) || 0 : value;
        return { ...c, [field]: parsedValue };
      }
      return c;
    }));
  };

  const handleCreateQuotation = () => {
    if (!newQuotation.clientName || clientQuoteTotal <= 0 || !newQuotation.buyRate || !newQuotation.quoteSentBy) {
      toast({
        title: "Missing Fields",
        description: "Please fill in client, commodities, buy rate, and sender details.",
        variant: "destructive",
      });
      return;
    }

    const newQuotationData: Quotation = {
      id: `q${Date.now()}`,
      clientName: newQuotation.clientName,
      volume: JSON.stringify(commodities), // Serialize commodities
      currency: newQuotation.currency,
      buyRate: parseFloat(newQuotation.buyRate),
      clientQuote: clientQuoteTotal,
      profit: calculatedProfit.profit,
      profitPercentage: calculatedProfit.profitPercentage,
      quoteSentBy: newQuotation.quoteSentBy,
      status: 'pending',
      followUpDate: newQuotation.followUpDate,
      remarks: newQuotation.remarks,
      createdAt: new Date().toISOString(),
      destination: newQuotation.destination,
      doorDelivery: newQuotation.doorDelivery,
    };
    
    onQuotationCreated(newQuotationData);
    setNewQuotation(initialQuotationState);
    setCommodities([{ id: uuidv4(), name: '', quantityKg: 0, rate: 0 }]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create New Quotation</h2>
      <Card>
        <CardHeader>
          <CardTitle>Quotation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" placeholder="Client name" value={newQuotation.clientName} onChange={handleNewQuotationChange} />
            </div>
             <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={newQuotation.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </Trigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="Destination" value={newQuotation.destination} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="doorDelivery">Door Delivery</Label>
              <Input id="doorDelivery" placeholder="Door Delivery" value={newQuotation.doorDelivery} onChange={handleNewQuotationChange} />
            </div>
             <div className="md:col-span-2">
              <Label htmlFor="quoteSentBy">Quote Sent By</Label>
              <Input id="quoteSentBy" placeholder="Enter sender name" value={newQuotation.quoteSentBy} onChange={handleNewQuotationChange} />
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Commodities</h3>
              <Button onClick={handleAddCommodity} size="sm" variant="outline">
                <Plus size={16} className="mr-2" />
                Add Commodity
              </Button>
            </div>
            <div className="space-y-2">
              {commodities.map((commodity) => (
                <div key={commodity.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-gray-50">
                  <div className="col-span-12 md:col-span-5">
                     <Label className="text-xs">Commodity Name</Label>
                    <Input placeholder="e.g. Fresh Flowers" value={commodity.name} onChange={(e) => handleCommodityChange(commodity.id, 'name', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                     <Label className="text-xs">Qty (KG)</Label>
                    <Input type="number" placeholder="0.00" value={commodity.quantityKg} onChange={(e) => handleCommodityChange(commodity.id, 'quantityKg', e.target.value)} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                     <Label className="text-xs">Rate</Label>
                    <Input type="number" placeholder="0.00" value={commodity.rate} onChange={(e) => handleCommodityChange(commodity.id, 'rate', e.target.value)} />
                  </div>
                   <div className="col-span-10 md:col-span-2">
                     <Label className="text-xs">Total</Label>
                     <p className="p-2 h-10 flex items-center bg-white rounded text-sm font-medium border">
                        {((commodity.quantityKg || 0) * (commodity.rate || 0)).toFixed(2)}
                     </p>
                  </div>
                  <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCommodity(commodity.id)} disabled={commodities.length === 1} className="text-red-500 hover:text-red-600">
                      <Minus size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label htmlFor="buyRate">Total Buy Rate</Label>
              <Input id="buyRate" type="number" placeholder="0.00" value={newQuotation.buyRate} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="clientQuote">Client Quote (Total Sell Rate)</Label>
              <Input id="clientQuote" type="text" value={`${newQuotation.currency} ${clientQuoteTotal.toLocaleString()}`} readOnly disabled className="bg-slate-100" />
            </div>
            <div>
              <Label htmlFor="profit">Profit (Absolute)</Label>
              <Input id="profit" type="text" value={`${newQuotation.currency} ${calculatedProfit.profit.toLocaleString()}`} readOnly disabled className="bg-slate-100" />
            </div>
            <div>
              <Label htmlFor="profitPercentage">Profit (% of Cost)</Label>
              <Input id="profitPercentage" type="text" value={calculatedProfit.profitPercentage} readOnly disabled className="bg-slate-100" />
            </div>
            <div>
              <Label htmlFor="followUpDate">Follow Up Date</Label>
              <Input id="followUpDate" type="date" value={newQuotation.followUpDate} onChange={handleNewQuotationChange} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="remarks">Remarks (inc. reasons for lost business)</Label>
            <Textarea id="remarks" placeholder="Additional notes or remarks" value={newQuotation.remarks} onChange={handleNewQuotationChange} />
          </div>
          <Button className="w-full" onClick={handleCreateQuotation}>
            <Plus size={16} className="mr-2" />
            Create Quotation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuotationView;
