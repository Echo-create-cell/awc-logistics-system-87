
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';
import { QuotationCommodity } from '@/types/invoice';

interface CommodityListProps {
  commodities: QuotationCommodity[];
  onAddCommodity: () => void;
  onRemoveCommodity: (id: string) => void;
  onCommodityChange: (id: string, field: keyof QuotationCommodity, value: string | number) => void;
}

const CommodityList = ({ commodities, onAddCommodity, onRemoveCommodity, onCommodityChange }: CommodityListProps) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Commodities</h3>
        <Button onClick={onAddCommodity} size="sm" variant="outline">
          <Plus size={16} className="mr-2" />
          Add Commodity
        </Button>
      </div>
      <div className="space-y-2">
        {commodities.map((commodity) => (
          <div key={commodity.id} className="grid grid-cols-12 gap-2 items-center p-2 rounded-md bg-gray-50">
            <div className="col-span-12 md:col-span-5">
               <Label className="text-xs">Commodity Name</Label>
              <Input placeholder="e.g. Fresh Flowers" value={commodity.name} onChange={(e) => onCommodityChange(commodity.id, 'name', e.target.value)} />
            </div>
            <div className="col-span-6 md:col-span-2">
               <Label className="text-xs">Qty (KG)</Label>
              <Input type="number" placeholder="0.00" value={commodity.quantityKg} onChange={(e) => onCommodityChange(commodity.id, 'quantityKg', e.target.value)} />
            </div>
            <div className="col-span-6 md:col-span-2">
               <Label className="text-xs">Rate</Label>
              <Input type="number" placeholder="0.00" value={commodity.rate} onChange={(e) => onCommodityChange(commodity.id, 'rate', e.target.value)} />
            </div>
             <div className="col-span-10 md:col-span-2">
               <Label className="text-xs">Total</Label>
               <p className="p-2 h-10 flex items-center bg-white rounded text-sm font-medium border">
                  {((commodity.quantityKg || 0) * (commodity.rate || 0)).toFixed(2)}
               </p>
            </div>
            <div className="col-span-2 md:col-span-1 flex items-end justify-end">
              <Button variant="ghost" size="icon" onClick={() => onRemoveCommodity(commodity.id)} disabled={commodities.length === 1} className="text-red-500 hover:text-red-600">
                <Minus size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommodityList;
