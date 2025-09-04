
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
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Commodity Name</Label>
                <Input
                  value={commodity.name}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'name', e.target.value)}
                  placeholder="e.g. Electronics"
                  disabled={viewOnly}
                  className="h-10"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Quantity (kg)</Label>
                <Input
                  type="number"
                  value={commodity.quantityKg}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'quantityKg', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                  disabled={viewOnly}
                  className="h-10"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Buy Rate ({currency}/kg)</Label>
                <Input
                  type="number"
                  value={commodity.rate}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'rate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 12.50"
                  disabled={viewOnly}
                  className="h-10"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Client Rate ({currency}/kg)</Label>
                <Input
                  type="number"
                  value={(commodity as any).clientRate || 0}
                  onChange={(e) => onUpdateCommodity(commodity.id, 'clientRate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 15.00"
                  disabled={viewOnly}
                  className="h-10"
                  min="0"
                  step="0.01"
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
