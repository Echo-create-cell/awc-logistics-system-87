
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Printer, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import { InvoiceData } from '@/types/invoice';

interface AdminInvoiceCardProps {
  invoice: InvoiceData;
  onView: (invoice: InvoiceData) => void;
  onPrint: (invoice: InvoiceData) => void;
}

const AdminInvoiceCard = ({ invoice, onView, onPrint }: AdminInvoiceCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getDaysFromIssue = () => {
    const issueDate = new Date(invoice.issueDate);
    const today = new Date();
    const diffTime = today.getTime() - issueDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysUntilDue = () => {
    if (!invoice.dueDate) return null;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const daysFromIssue = getDaysFromIssue();

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-2">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center">
              <DollarSign size={20} className="mr-2 text-blue-600" />
              {invoice.invoiceNumber}
            </CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <User size={16} className="mr-1" />
              {invoice.clientName}
            </div>
          </div>
          <Badge className={`${getStatusColor(invoice.status)} font-semibold`}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="font-bold text-lg text-blue-600">
                {invoice.currency} {invoice.totalAmount.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sub-total:</span>
              <span className="font-medium">{invoice.currency} {invoice.subTotal.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">TVA:</span>
              <span className="font-medium">{invoice.currency} {invoice.tva.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center">
                <Calendar size={14} className="mr-1" />
                Issue Date:
              </span>
              <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</span>
            </div>
            
            {invoice.dueDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className={`font-medium ${daysUntilDue && daysUntilDue < 0 ? 'text-destructive' : daysUntilDue && daysUntilDue < 7 ? 'text-warning' : 'text-foreground'}`}>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Age:</span>
              <span className="font-medium">{daysFromIssue} days</span>
            </div>
          </div>
        </div>

        {(invoice.destination || invoice.doorDelivery) && (
          <div className="bg-blue-50 p-3 rounded space-y-1">
            {invoice.destination && (
              <div className="flex items-center text-sm text-blue-700">
                <MapPin size={14} className="mr-1" />
                <span className="font-medium">Destination:</span>
                <span className="ml-1">{invoice.destination}</span>
              </div>
            )}
            {invoice.doorDelivery && (
              <div className="text-xs text-blue-600">
                Door Delivery: {invoice.doorDelivery}
              </div>
            )}
          </div>
        )}

        {invoice.awbNumber && (
          <div className="bg-green-50 p-2 rounded">
            <span className="text-xs text-green-700 font-medium">AWB: {invoice.awbNumber}</span>
          </div>
        )}

        {daysUntilDue !== null && (
          <div className={`p-2 rounded text-center text-sm font-medium ${
            daysUntilDue < 0 
              ? 'bg-red-100 text-red-800' 
              : daysUntilDue < 7 
                ? 'bg-warning/10 text-warning border-warning/20' 
                : 'bg-green-100 text-green-800'
          }`}>
            {daysUntilDue < 0 
              ? `Overdue by ${Math.abs(daysUntilDue)} days` 
              : daysUntilDue === 0 
                ? 'Due today' 
                : `Due in ${daysUntilDue} days`
            }
          </div>
        )}

        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(invoice)}
            className="flex-1"
          >
            <Eye size={16} className="mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            onClick={() => onPrint(invoice)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Printer size={16} className="mr-1" />
            Print
          </Button>
        </div>

        <div className="text-xs text-gray-500 pt-2 border-t">
          <div>Salesperson: <span className="font-medium">{invoice.salesperson}</span></div>
          <div>Items: <span className="font-medium">{invoice.items.length}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminInvoiceCard;
