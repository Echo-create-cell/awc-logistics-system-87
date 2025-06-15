
import React from 'react';
import { InvoiceData } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface InvoicePrintPreviewProps {
  invoice: InvoiceData;
  onClose: () => void;
  onPrint: () => void;
}

const InvoicePrintPreview = ({ invoice, onClose, onPrint }: InvoicePrintPreviewProps) => {
  const handlePrint = () => {
    window.print();
    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold">Invoice Preview</h3>
          <div className="flex space-x-2">
            <Button onClick={handlePrint}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>
        
        <div className="p-8 print:p-0" id="invoice-print">
          {/* Company Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">Africa World Cargo Ltd/</h1>
              <p className="text-sm text-gray-600">TIN: 112933303 RW</p>
              <p className="text-sm text-gray-600">KN 5 rd, AVIB, 30 Remera</p>
              <p className="text-sm text-gray-600">Kigali, Rwanda</p>
              <p className="text-sm text-gray-600">Tel: +250 784 445 373</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">INVOICE</h2>
              <p className="text-sm">Invoice #: {invoice.invoiceNumber}</p>
              <p className="text-sm">Date: {new Date(invoice.issueDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-2">Bill To:</h3>
              <p className="font-medium">{invoice.clientName}</p>
              <p className="text-sm">{invoice.clientAddress}</p>
              {invoice.clientTin && <p className="text-sm">TIN: {invoice.clientTin}</p>}
            </div>
            <div>
              <div className="space-y-1 text-sm">
                <p><strong>Destination:</strong> {invoice.destination}</p>
                <p><strong>Door Delivery:</strong> {invoice.doorDelivery}</p>
                <p><strong>Salesperson:</strong> {invoice.salesperson}</p>
                <p><strong>Delivery Date:</strong> {invoice.deliverDate}</p>
                <p><strong>AWB Number:</strong> {invoice.awbNumber}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Quantity (KG)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Commodity</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Price</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{item.quantityKg}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.commodity}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.description}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {invoice.currency} {item.price.toFixed(2)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-right">
                    {invoice.currency} {item.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between border-b py-2">
                <span>Sub Total:</span>
                <span>{invoice.currency} {invoice.subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b py-2">
                <span>TVA (18%):</span>
                <span>{invoice.currency} {invoice.tva.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg py-2">
                <span>Total:</span>
                <span>{invoice.currency} {invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-t pt-6">
            <h3 className="font-bold mb-4">Payment Information</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="font-medium">Bank: Bank of Kigali</p>
                <p className="text-sm">Account: 00265 077713610/Rwf</p>
                <p className="text-sm">Account: 00265-07771427-09/Eur</p>
                <p className="text-sm">Account: 00265-07771426-08/Usd</p>
                <p className="text-sm">Swift Code: BKIGRWRW</p>
              </div>
              <div>
                <p><strong>Payment Terms:</strong></p>
                <p className="text-sm">{invoice.paymentConditions}</p>
                <p className="text-sm mt-2"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPreview;
