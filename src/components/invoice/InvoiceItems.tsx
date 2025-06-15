import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { InvoiceItem, InvoiceCharge } from '@/types/invoice';

interface InvoiceItemsProps {
  items: InvoiceItem[];
  currency: string;
  subTotal: number;
  tva: number;
  total: number;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItemField: (itemId: string, field: 'quantityKg' | 'commodity', value: any) => void;
  onAddCharge: (itemId: string) => void;
  onRemoveCharge: (itemId: string, chargeId: string) => void;
  onUpdateCharge: (itemId: string, chargeId: string, field: keyof InvoiceCharge, value: string | number) => void;
}

const InvoiceItems = ({ items, currency, subTotal, tva, total, onAddItem, onRemoveItem, onUpdateItemField, onAddCharge, onRemoveCharge, onUpdateCharge }: InvoiceItemsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoice Items</CardTitle>
          <Button onClick={onAddItem} size="sm">
            <Plus size={16} className="mr-2" />
            Add Commodity
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-4 bg-gray-50/50">
              {/* Item-level controls */}
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-12 md:col-span-4">
                  <Label>Commodity</Label>
                  <Input value={item.commodity} onChange={(e) => onUpdateItemField(item.id, 'commodity', e.target.value)} placeholder="e.g. Air Freight" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>Quantity (KG)</Label>
                  <Input type="number" value={item.quantityKg} onChange={(e) => onUpdateItemField(item.id, 'quantityKg', parseFloat(e.target.value) || 0)} placeholder="0.00" />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <Label>Item Total</Label>
                  <p className="p-2 h-10 flex items-center bg-white rounded text-sm font-medium border">
                    {item.total.toFixed(2)}
                  </p>
                </div>
                <div className="col-span-12 md:col-span-4 flex justify-end space-x-2">
                    <Button onClick={() => onAddCharge(item.id)} size="sm" variant="outline"><Plus size={14} className="mr-1" /> Add Charge</Button>
                    <Button variant="destructive" size="icon" onClick={() => onRemoveItem(item.id)} disabled={items.length === 1}>
                      <Minus size={16} />
                    </Button>
                </div>
              </div>
              
              {/* Charges list */}
              <div className="space-y-2 pl-4 border-l-2 ml-2">
                <Label className="text-xs font-semibold text-gray-600">CHARGES</Label>
                {item.charges.map((charge) => (
                  <div key={charge.id} className="grid grid-cols-10 gap-2 items-center">
                    <div className="col-span-10 md:col-span-6">
                      <Input value={charge.description} onChange={(e) => onUpdateCharge(item.id, charge.id, 'description', e.target.value)} placeholder="Charge description (e.g., Freight Cost)" />
                    </div>
                    <div className="col-span-7 md:col-span-3">
                      <Input type="number" value={charge.rate} onChange={(e) => onUpdateCharge(item.id, charge.id, 'rate', e.target.value)} placeholder="Rate" />
                    </div>
                    <div className="col-span-3 md:col-span-1 flex justify-end">
                      <Button variant="ghost" size="icon" onClick={() => onRemoveCharge(item.id, charge.id)} disabled={item.charges.length === 1} className="text-red-500 hover:text-red-600">
                        <Minus size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="mt-6 space-y-2 border-t pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Sub Total:</span>
            <span className="font-bold">{currency} {subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">TVA (18%):</span>
            <span className="font-bold">{currency} {tva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg border-t pt-2">
            <span className="font-bold">Total Amount:</span>
            <span className="font-bold text-green-600">{currency} {total.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceItems;
