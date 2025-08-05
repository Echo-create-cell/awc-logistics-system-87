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
    const printElement = document.getElementById('invoice-print-area');
    if (!printElement) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write('<html><head><title>Print Invoice</title>');
    
    // Copy stylesheets
    const links = document.getElementsByTagName('link');
    for (let i = 0; i < links.length; i++) {
        if (links[i].rel === 'stylesheet') {
            doc.write(links[i].outerHTML);
        }
    }
    const styles = document.getElementsByTagName('style');
    for (let i = 0; i < styles.length; i++) {
        doc.write(styles[i].outerHTML);
    }
    // Add a style to ensure text is black for printing
    doc.write('<style>body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: black !important; }</style>');

    doc.write('</head><body class="font-sans text-xs leading-relaxed">');
    doc.write(printElement.innerHTML);
    doc.write('</body></html>');
    doc.close();

    iframe.onload = function() {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };

    onPrint();
  };

  const totalRows = invoice.items.reduce((count, item) => {
    // If an item has more than one charge, it takes a header row + one row per charge.
    // Otherwise, it's just one row.
    return count + (item.charges.length > 1 ? 1 + item.charges.length : 1);
  }, 0);
  const emptyRowsCount = Math.max(0, 10 - totalRows);

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
        
        <div className="p-8">
            <div id="invoice-print-area">
                {/* Company Header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-red-600">
                    <div className="w-2/3 pr-4">
                        <img src="/lovable-uploads/42894000-b0f9-4208-a908-0ff700e4e3b3.png" alt="AWC Logo" className="w-48 mb-2"/>
                        <h2 className="font-bold text-sm">Africa World Cargo Ltd/ TIN: 112933303 RW</h2>
                        <p className="text-xs whitespace-pre-line">KN 5 rd, Av18, 30 Remera{"\n"}Kigali, Rwanda</p>
                        <p className="text-xs mt-2"><strong>Bank of Kigali</strong></p>
                        <p className="text-xs whitespace-pre-line">
                        {'00265 07771361 40/Rwf\n00265-07771427-09/Eur\n00265-07771426-08/Usd'}
                        </p>
                        <p className="text-xs mt-1"><strong>Swift code:</strong> BKIGRWRW</p>
                        <p className="text-xs"><strong>Phone Nr.:</strong> +250 784 445 373</p>
                    </div>
                    <div className="text-right w-1/3">
                        <h1 className="text-4xl font-bold text-red-600 mb-2">Invoice</h1>
                        <p className="text-xs"><strong>Nr. Of Invoice:</strong> {invoice.invoiceNumber}</p>
                        <p className="text-xs"><strong>Date:</strong> {new Date(invoice.issueDate).toLocaleDateString('en-GB')}</p>
                        {invoice.awbNumber && <p className="text-xs bg-blue-100 p-1 my-1"><strong>AWB:</strong> {invoice.awbNumber}</p>}
                        {invoice.destination && <p className="text-xs"><strong>Destination:</strong> {invoice.destination}</p>}
                        {invoice.doorDelivery && <p className="text-xs"><strong>Door Delivery:</strong> {invoice.doorDelivery}</p>}
                    </div>
                </div>

                {/* Client Information */}
                <div className="mb-6 text-sm">
                    {invoice.clientName && <p><strong>Name of customer:</strong> {invoice.clientName}</p>}
                    {invoice.clientContactPerson && <p><strong>Contact:</strong> {invoice.clientContactPerson}</p>}
                    {invoice.clientAddress && <p><strong>Address:</strong> {invoice.clientAddress}</p>}
                    {invoice.clientTin && <p><strong>TIN:</strong> {invoice.clientTin}</p>}
                </div>

                {/* Details Table */}
                <table className="w-full border-collapse mb-6 text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border border-black px-2 py-1 text-left font-normal">Salesperson</th>
                            <th className="border border-black px-2 py-1 text-left font-normal">Deliver date</th>
                            <th className="border border-black px-2 py-1 text-left font-normal">Payment conditions</th>
                            <th className="border border-black px-2 py-1 text-left font-normal">Validity to Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-gray-100">
                            <td className="border border-black px-2 py-1">{invoice.salesperson || ''}</td>
                            <td className="border border-black px-2 py-1">{invoice.deliverDate ? new Date(invoice.deliverDate).toLocaleDateString('en-GB') : ''}</td>
                            <td className="border border-black px-2 py-1">{invoice.paymentConditions || ''}</td>
                            <td className="border border-black px-2 py-1">{invoice.validityDate ? new Date(invoice.validityDate).toLocaleDateString('en-GB') : ''}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Items Table */}
                <table className="w-full border-collapse mb-6 text-sm">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="border border-black px-2 py-1 text-left font-normal">Quantity in kg</th>
                            <th className="border border-black px-2 py-1 text-left font-normal">Commodity</th>
                            <th className="border border-black px-2 py-1 text-left font-normal">Description</th>
                            <th className="border border-black px-2 py-1 text-right font-normal">Price</th>
                            <th className="border border-black px-2 py-1 text-right font-normal">Total Amount all incl./{invoice.currency}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => {
                            if (item.charges.length === 1) {
                                const charge = item.charges[0];
                                return (
                                    <tr key={item.id} className="even:bg-gray-100">
                                        <td className="border border-black px-2 py-1 text-center">{item.quantityKg || 0}</td>
                                        <td className="border border-black px-2 py-1">{item.commodity || ''}</td>
                                        <td className="border border-black px-2 py-1">{charge.description || ''}</td>
                                        <td className="border border-black px-2 py-1 text-right">{(charge.rate || 0).toFixed(2)}</td>
                                        <td className="border border-black px-2 py-1 text-right">{(item.total || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            } else {
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr className="bg-gray-200/60 font-bold">
                                            <td className="border border-black px-2 py-1 text-center">{item.quantityKg || 0}</td>
                                            <td className="border border-black px-2 py-1" colSpan={2}>{item.commodity || ''}</td>
                                            <td className="border border-black px-2 py-1 text-right">
                                                {(item.charges.reduce((sum, c) => sum + (c.rate || 0), 0)).toFixed(2)}
                                            </td>
                                            <td className="border border-black px-2 py-1 text-right">{(item.total || 0).toFixed(2)}</td>
                                        </tr>
                                        {item.charges.map(charge => (
                                            <tr key={charge.id} className="even:bg-gray-100">
                                                <td className="border border-black px-2 py-1"></td>
                                                <td className="border border-black px-2 py-1 italic" colSpan={2}>- {charge.description || ''}</td>
                                                <td className="border border-black px-2 py-1 text-right">{(charge.rate || 0).toFixed(2)}</td>
                                                <td className="border border-black px-2 py-1 text-right">{((item.quantityKg || 0) * (charge.rate || 0)).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            }
                        })}
                        {Array.from({ length: emptyRowsCount }).map((_, index) => (
                            <tr key={`empty-${index}`} className="even:bg-gray-100">
                                <td className="border border-black px-2 py-1">&nbsp;</td>
                                <td className="border border-black px-2 py-1">&nbsp;</td>
                                <td className="border border-black px-2 py-1">&nbsp;</td>
                                <td className="border border-black px-2 py-1">&nbsp;</td>
                                <td className="border border-black px-2 py-1">&nbsp;</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals & Signature */}
                <div className="flex justify-between items-start">
                    <div className="w-2/3 pt-20">
                         <p>Signature and Stump ..............................</p>
                         {invoice.salesperson && <p className="mt-4 text-sm">Prepared by: {invoice.salesperson}</p>}
                    </div>
                    <div className="w-1/3">
                        <div className="w-full text-sm">
                            <div className="flex justify-between py-1">
                                <span>Sub-Total</span>
                                <span>{(invoice.subTotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span>TVA</span>
                                <span>{(invoice.tva || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base py-1 border-t-2 border-black">
                                <span>TOTAL</span>
                                <span>{invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-8 mt-8 border-t">
                    <p className="font-bold">All checks are payable to Africa World Cargo Ltd.</p>
                    <p className="font-bold text-red-600 mt-2">WE THANK YOU FOR YOUR TRUST</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPreview;
