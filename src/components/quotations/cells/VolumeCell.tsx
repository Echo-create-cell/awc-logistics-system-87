
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
                
                totalQuantity = parsed.reduce((sum: number, c: any) => sum + (Number(c.quantityKg) || 0), 0);
                const avgClientRate = totalQuantity > 0 && clientQuote ? clientQuote / totalQuantity : 0;

                commodities = parsed.map((c: any) => {
                    const rate = c.rate !== undefined 
                        ? Number(c.rate) 
                        : (c.charges && Array.isArray(c.charges) 
                            ? c.charges.reduce((sum: number, charge: any) => sum + (Number(charge.rate) || 0), 0) 
                            : 0);
                    
                    const quantity = Number(c.quantityKg) || 0;

                    return {
                        id: c.id || `gen-${Math.random()}`,
                        name: c.name || 'Unnamed',
                        quantityKg: quantity,
                        rate: rate,
                        clientRate: c.clientRate !== undefined ? Number(c.clientRate) : avgClientRate,
                    };
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

    const totalValue = commodities.reduce((acc, commodity) => acc + (commodity.rate * commodity.quantityKg), 0);
    const avgRate = totalQuantity > 0 ? totalValue / totalQuantity : 0;

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
                                {commodities.map((commodity) => (
                                    <li key={commodity.id} className="flex justify-between items-center text-xs">
                                        <span>{commodity.quantityKg}kg - {commodity.name}</span>
                                        <Badge variant="outline">{commodity.rate.toFixed(2)} {currency}/kg</Badge>
                                    </li>
                                ))}
                                <li className="flex justify-between items-center font-bold border-t pt-1 mt-1">
                                    <span>Total: {totalQuantity.toLocaleString()} kg</span>
                                    <span>Avg Rate: {avgRate.toFixed(2)} {currency}/kg</span>
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
