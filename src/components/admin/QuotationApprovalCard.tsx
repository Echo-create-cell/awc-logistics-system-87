import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, TrendingUp } from 'lucide-react';
import { Quotation } from '@/types';

interface QuotationApprovalCardProps {
  quotation: Quotation;
  onApprove: (id: string) => void;
  onReject: (quotation: Quotation) => void;
  onView: (quotation: Quotation) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'approved':
    case 'won':
      return 'bg-success/10 text-success border-success/20';
    case 'rejected':
    case 'lost':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
    }
};

const formatVolume = (volume: string) => {
  try {
    const parsed = JSON.parse(volume);
    const totalWeight = Array.isArray(parsed) 
      ? parsed.reduce((sum, item) => sum + parseFloat(item.quantityKg || 0), 0)
      : parseFloat(parsed.quantityKg || volume);
    const itemCount = Array.isArray(parsed) ? parsed.length : 1;
    return `${totalWeight} kg (${itemCount} items)`;
  } catch {
    return volume;
  }
};

const QuotationApprovalCard = ({ quotation, onApprove, onReject, onView }: QuotationApprovalCardProps) => {
  const profit = quotation.clientQuote - quotation.buyRate;
  const margin = quotation.clientQuote > 0 ? ((profit / quotation.clientQuote) * 100) : 0;
  const volume = formatVolume(quotation.volume);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white shadow-sm hover:shadow-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header with company name and status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 uppercase tracking-wide">
                {quotation.clientName || quotation.clientId}
              </h3>
              <p className="text-sm text-gray-600 font-medium mt-1">
                {quotation.destination}
              </p>
            </div>
            <Badge 
              variant="outline" 
              className={`${getStatusColor(quotation.status)} font-medium uppercase text-xs px-3 py-1`}
            >
              {quotation.status}
            </Badge>
          </div>

          {/* Volume and Profit Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Volume:</p>
              <p className="font-semibold text-gray-900">{volume}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Profit:</p>
              <div className="flex items-center justify-end gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600 text-lg">
                  $ {profit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Rates and Margin */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Buy Rate:</p>
              <p className="font-semibold text-gray-900">$ {quotation.buyRate.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Margin:</p>
              <p className="font-bold text-green-600">{margin.toFixed(1)}%</p>
            </div>
          </div>

          <div className="text-sm">
            <p className="text-gray-500">Client Quote:</p>
            <p className="font-semibold text-blue-600 text-lg">
              $ {quotation.clientQuote.toLocaleString()}
            </p>
          </div>

          {/* Sales Agent */}
          <div className="text-sm">
            <p className="text-gray-500">Sales Agent:</p>
            <p className="font-semibold text-purple-600 uppercase tracking-wide">
              {quotation.quoteSentBy}
            </p>
          </div>

          {/* Action Buttons */}
          {quotation.status === 'pending' && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => onApprove(quotation.id)}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Approve</span>
              </Button>
              <Button
                onClick={() => onReject(quotation)}
                variant="destructive"
                size="sm"
                className="flex-1 gap-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span className="font-medium">Reject</span>
              </Button>
              <Button
                onClick={() => onView(quotation)}
                variant="outline"
                size="sm"
                className="px-3 gap-1.5"
              >
                <Eye className="h-4 w-4" />
                <span className="font-medium">View</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuotationApprovalCard;