
import { Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const VolumeCell = ({ row }: { row: Quotation }) => {
    const { volume, currency, clientQuote } = row;
    
    let commodities: QuotationCommodity[] = [];
    let totalQuantity = 0;
    let fallbackRate = 0;
    let isStructured = false;

    if (volume) {
        try {
            const parsed = JSON.parse(volume);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
                isStructured = true;
                commodities = parsed.map((c: any) => {
                    const commodityWithDefaults = {
                        ...c,
                        charges: c.charges || (c.rate !== undefined ? [{ id: c.id + '-charge', description: `Charge`, rate: c.rate }] : []),
                    };
                    totalQuantity += Number(commodityWithDefaults.quantityKg) || 0;
                    return commodityWithDefaults;
                });
            }
        } catch(e) {
            // Not a structured volume, treat as simple string
        }
    }

    if (!isStructured) {
        totalQuantity = !isNaN(Number(volume)) ? Number(volume) : 0;
        if(totalQuantity > 0) {
            fallbackRate = clientQuote / totalQuantity;
        }
    }

    const totalRate = commodities.reduce((acc, commodity) => {
        const commodityTotalRate = commodity.charges.reduce((chargeAcc, charge) => chargeAcc + (charge.rate || 0), 0);
        return acc + commodityTotalRate;
    }, 0);

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <div className="flex flex-col cursor-pointer">
                    <span className="font-medium text-gray-800">{totalQuantity.toLocaleString()} kg</span>
                    <Badge variant="secondary" className="w-fit mt-1">
                        {isStructured ? `${commodities.length} items` : 'Unstructured'}
                    </Badge>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Volume Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {isStructured && commodities.length > 0 ? (
                            <ul className="space-y-1">
                                {commodities.map((commodity) => {
                                    const commodityTotalRate = commodity.charges.reduce((acc, charge) => acc + (charge.rate || 0), 0);
                                    return (
                                        <li key={commodity.id} className="flex justify-between items-center text-xs">
                                            <span>{commodity.quantityKg}kg - {commodity.name}</span>
                                            <Badge variant="outline">{commodityTotalRate.toFixed(2)} {currency}/kg</Badge>
                                        </li>
                                    )
                                })}
                                <li className="flex justify-between items-center font-bold border-t pt-1 mt-1">
                                    <span>Total: {totalQuantity.toLocaleString()} kg</span>
                                    <span>Avg Rate: {totalRate.toFixed(2)} {currency}/kg</span>
                                </li>
                            </ul>
                        ) : (
                            <div>
                                <p><strong>Quantity:</strong> {totalQuantity.toLocaleString()} kg</p>
                                {fallbackRate > 0 && <p><strong>Avg. Rate:</strong> {fallbackRate.toFixed(2)} {currency}/kg</p>}
                                <p className="text-xs text-gray-500 mt-2">Volume is not structured into commodities.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </HoverCardContent>
        </HoverCard>
    );
};

export default VolumeCell;
