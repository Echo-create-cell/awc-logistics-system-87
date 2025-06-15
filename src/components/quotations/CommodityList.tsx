
import React from 'react';
import { QuotationCommodity, InvoiceCharge } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from '../ui/label';

interface CommodityListProps {
  commodities: QuotationCommodity[];
  onUpdateCommodity: (id: string, field: 'name' | 'quantityKg', value: string | number) => void;
  onRemoveCommodity: (id: string) => void;
  onAddCharge: (commodityId: string) => void;
  onRemoveCharge: (commodityId: string, chargeId: string) => void;
  onUpdateCharge: (commodityId: string, chargeId: string, field: keyof Omit<InvoiceCharge, 'id'>, value: string | number) => void;
  currency: string;
}

const CommodityList = ({
  commodities,
  onUpdateCommodity,
  onRemoveCommodity,
  onAddCharge,
  onRemoveCharge,
  onUpdateCharge,
  currency,
}: CommodityListProps) => {
  return (
    <div className="space-y-4">
      {commodities.map((commodity, index) => (
        <Card key={commodity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-md">Commodity #{index + 1}</h4>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => onRemoveCommodity(commodity.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Commodity Name</Label>
                <Input
                  value={commodity.name}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'name', e.target.value)}
                  placeholder="e.g. Electronics"
                />
              </div>
              <div>
                <Label>Quantity (kg)</Label>
                <Input
                  type="number"
                  value={commodity.quantityKg}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'quantityKg', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="font-medium">Charges</Label>
              {commodity.charges.map((charge) => (
                <div key={charge.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <Input
                    value={charge.description}
                    onChange={(e) => onUpdateCharge(commodity.id, charge.id, 'description', e.target.value)}
                    placeholder="Charge description (e.g., Freight)"
                    className="flex-grow"
                  />
                  <div className="relative w-32">
                    <Input
                      type="number"
                      value={charge.rate}
                      onChange={(e) => onUpdateCharge(commodity.id, charge.id, 'rate', parseFloat(e.target.value) || 0)}
                      placeholder="Rate"
                      className="pr-12"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-500">{currency}/kg</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 shrink-0"
                    onClick={() => onRemoveCharge(commodity.id, charge.id)}
                    disabled={commodity.charges.length <= 1}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => onAddCharge(commodity.id)} className="mt-2">
                <PlusCircle size={14} className="mr-2" /> Add Charge
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommodityList;
