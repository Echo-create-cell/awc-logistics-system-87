
import React from 'react';
import { QuotationCommodity } from "@/types/invoice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from '../ui/label';

interface CommodityListProps {
  commodities: QuotationCommodity[];
  onUpdateCommodity: (id: string, field: 'name' | 'quantityKg' | 'rate' | 'clientRate', value: string | number) => void;
  onRemoveCommodity: (id: string) => void;
  currency: string;
  viewOnly?: boolean;
}

const CommodityList = ({
  commodities,
  onUpdateCommodity,
  onRemoveCommodity,
  currency,
  viewOnly = false,
}: CommodityListProps) => {
  return (
    <div className="space-y-4">
      {commodities.map((commodity, index) => (
        <Card key={commodity.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-md">Commodity #{index + 1}</h4>
              {!viewOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => onRemoveCommodity(commodity.id)}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <Label>Commodity Name</Label>
                <Input
                  value={commodity.name}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'name', e.target.value)}
                  placeholder="e.g. Electronics"
                  disabled={viewOnly}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Quantity (kg)</Label>
                <Input
                  type="number"
                  value={commodity.quantityKg}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'quantityKg', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                  disabled={viewOnly}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Buy Rate ({currency}/kg)</Label>
                <Input
                  type="number"
                  value={commodity.rate}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'rate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 12.50"
                  disabled={viewOnly}
                />
              </div>
              <div className="md:col-span-1">
                <Label>Client Rate ({currency}/kg)</Label>
                <Input
                  type="number"
                  value={(commodity as any).clientRate || 0}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'clientRate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 15.00"
                  disabled={viewOnly}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommodityList;
