
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Quotation } from '@/types';

interface AdminQuotationCardProps {
  quotation: Quotation;
  onApprove: (id: string) => void;
  onReject: (quotation: Quotation) => void;
  onView: (quotation: Quotation) => void;
}

const AdminQuotationCard = ({ quotation, onApprove, onReject, onView }: AdminQuotationCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'won':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'lost':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const profitMargin = ((quotation.profit / quotation.clientQuote) * 100).toFixed(1);
  const isHighProfit = parseFloat(profitMargin) > 20;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-2">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900">
              {quotation.clientName}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{quotation.destination}</p>
          </div>
          <Badge className={`${getStatusColor(quotation.status)} font-semibold`}>
            {quotation.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Volume:</span>
              <span className="font-medium">{quotation.volume}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Buy Rate:</span>
              <span className="font-medium">{quotation.currency} {quotation.buyRate.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Client Quote:</span>
              <span className="font-medium text-blue-600">{quotation.currency} {quotation.clientQuote.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Profit:</span>
              <div className="flex items-center space-x-1">
                {isHighProfit ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-orange-500" />}
                <span className={`font-bold ${isHighProfit ? 'text-green-600' : 'text-orange-600'}`}>
                  {quotation.currency} {quotation.profit.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Margin:</span>
              <span className={`font-semibold ${isHighProfit ? 'text-green-600' : 'text-orange-600'}`}>
                {profitMargin}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sales Agent:</span>
              <span className="font-medium text-purple-600">{quotation.quoteSentBy}</span>
            </div>
          </div>
        </div>

        {quotation.doorDelivery && (
          <div className="bg-blue-50 p-2 rounded">
            <span className="text-xs text-blue-700 font-medium">Door Delivery: {quotation.doorDelivery}</span>
          </div>
        )}

        {quotation.status === 'pending' && (
          <div className="flex space-x-2 pt-2">
            <Button
              size="sm"
              onClick={() => onApprove(quotation.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle size={16} className="mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(quotation)}
              className="flex-1"
            >
              <XCircle size={16} className="mr-1" />
              Reject
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(quotation)}
            >
              <Eye size={16} />
            </Button>
          </div>
        )}

        {quotation.status !== 'pending' && (
          <div className="flex justify-between items-center pt-2 border-t">
            {quotation.approvedBy && (
              <div className="text-xs text-gray-500">
                <span className="font-medium">Approved by:</span> {quotation.approvedBy}
                {quotation.approvedAt && (
                  <div>{new Date(quotation.approvedAt).toLocaleDateString()}</div>
                )}
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(quotation)}
            >
              <Eye size={16} className="mr-1" />
              View Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminQuotationCard;
