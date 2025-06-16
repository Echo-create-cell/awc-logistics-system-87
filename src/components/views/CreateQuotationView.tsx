
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { Quotation, User } from '@/types';

interface CreateQuotationViewProps {
  user: User;
  onQuotationCreated: (quotation: Quotation) => void;
}

const CreateQuotationView = ({ user, onQuotationCreated }: CreateQuotationViewProps) => {
  const { toast } = useToast();
  const [newQuotation, setNewQuotation] = useState({
    clientName: '',
    volume: '',
    currency: 'USD',
    buyRate: '',
    clientQuote: '',
    followUpDate: '',
    remarks: '',
  });

  const [calculatedProfit, setCalculatedProfit] = useState({
    profit: 0,
    profitPercentage: '0.00%',
  });

  useEffect(() => {
    const buyRate = parseFloat(newQuotation.buyRate);
    const clientQuote = parseFloat(newQuotation.clientQuote);

    if (!isNaN(buyRate) && !isNaN(clientQuote) && buyRate > 0) {
      const profit = clientQuote - buyRate;
      const profitPercentage = `${((profit / buyRate) * 100).toFixed(2)}%`;
      setCalculatedProfit({ profit, profitPercentage });
    } else {
      const profit = !isNaN(clientQuote) && !isNaN(buyRate) ? clientQuote - buyRate : 0;
      setCalculatedProfit({ profit: profit, profitPercentage: 'N/A' });
    }
  }, [newQuotation.buyRate, newQuotation.clientQuote]);

  const handleNewQuotationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewQuotation(prev => ({ ...prev, [id]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setNewQuotation(prev => ({ ...prev, currency: value }));
  };

  const handleCreateQuotation = () => {
    if (!newQuotation.clientName || !newQuotation.volume || !newQuotation.buyRate || !newQuotation.clientQuote) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required quotation details.",
        variant: "destructive",
      });
      return;
    }

    const newQuotationData: Quotation = {
      id: `q${Date.now()}`,
      clientName: newQuotation.clientName,
      volume: newQuotation.volume,
      currency: newQuotation.currency,
      buyRate: parseFloat(newQuotation.buyRate),
      clientQuote: parseFloat(newQuotation.clientQuote),
      profit: calculatedProfit.profit,
      profitPercentage: calculatedProfit.profitPercentage,
      quoteSentBy: user!.name,
      status: 'pending',
      followUpDate: newQuotation.followUpDate,
      remarks: newQuotation.remarks,
      createdAt: new Date().toISOString(),
    };
    
    onQuotationCreated(newQuotationData);

    setNewQuotation({
      clientName: '',
      volume: '',
      currency: 'USD',
      buyRate: '',
      clientQuote: '',
      followUpDate: '',
      remarks: '',
    });
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
              <Label htmlFor="volume">Volume</Label>
              <Input id="volume" placeholder="e.g., 2.4KGS, 20FT" value={newQuotation.volume} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={newQuotation.currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="followUpDate">Follow Up Date</Label>
              <Input id="followUpDate" type="date" value={newQuotation.followUpDate} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="buyRate">Total Buy Rate</Label>
              <Input id="buyRate" type="number" placeholder="0.00" value={newQuotation.buyRate} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="clientQuote">Client Quote (Sell Rate)</Label>
              <Input id="clientQuote" type="number" placeholder="0.00" value={newQuotation.clientQuote} onChange={handleNewQuotationChange} />
            </div>
            <div>
              <Label htmlFor="profit">Profit (Absolute)</Label>
              <Input id="profit" type="text" value={`${newQuotation.currency} ${calculatedProfit.profit.toLocaleString()}`} readOnly disabled className="bg-slate-100" />
            </div>
            <div>
              <Label htmlFor="profitPercentage">Profit (% of Cost)</Label>
              <Input id="profitPercentage" type="text" value={calculatedProfit.profitPercentage} readOnly disabled className="bg-slate-100" />
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
