
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { InvoiceItem } from '@/types/invoice';

interface InvoiceItemsProps {
  items: InvoiceItem[];
  currency: string;
  subTotal: number;
  tva: number;
  total: number;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: string | number) => void;
}

const InvoiceItems = ({ items, currency, subTotal, tva, total, onAddItem, onRemoveItem, onUpdateItem }: InvoiceItemsProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoice Items</CardTitle>
          <Button onClick={onAddItem} size="sm">
            <Plus size={16} className="mr-2" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg">
              <div className="col-span-2">
                <Label className="text-xs">Quantity (KG)</Label>
                <Input
                  type="number"
                  value={item.quantityKg}
                  onChange={(e) => onUpdateItem(item.id, 'quantityKg', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Commodity</Label>
                <Input
                  value={item.commodity}
                  onChange={(e) => onUpdateItem(item.id, 'commodity', e.target.value)}
                  placeholder="Item name"
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => onUpdateItem(item.id, 'description', e.target.value)}
                  placeholder="Description"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Price</Label>
                <Input
                  type="number"
                  value={item.price}
                  onChange={(e) => onUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
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
                  onClick={() => onRemoveItem(item.id)}
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
