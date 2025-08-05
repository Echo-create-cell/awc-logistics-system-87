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
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-red-600">
                    <div className="w-2/3 pr-6">
                        <img src="/lovable-uploads/42894000-b0f9-4208-a908-0ff700e4e3b3.png" alt="AWC Logo" className="w-52 mb-3"/>
                        <h2 className="font-bold text-base text-gray-800 mb-2">Africa World Cargo Ltd</h2>
                        <p className="text-sm text-gray-600 mb-1">TIN: 112933303 RW</p>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            KN 5 rd, Av18, 30 Remera<br/>
                            Kigali, Rwanda
                        </p>
                        <div className="border-t border-gray-200 pt-3">
                            <p className="text-sm font-semibold text-gray-800 mb-2">Banking Details</p>
                            <p className="text-sm text-gray-700 mb-1"><strong>Bank of Kigali</strong></p>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p>RWF: 00265 07771361 40</p>
                                <p>EUR: 00265-07771427-09</p>
                                <p>USD: 00265-07771426-08</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-2"><strong>Swift:</strong> BKIGRWRW</p>
                            <p className="text-sm text-gray-600"><strong>Phone:</strong> +250 784 445 373</p>
                        </div>
                    </div>
                    <div className="text-right w-1/3">
                        <h1 className="text-5xl font-bold text-red-600 mb-4">INVOICE</h1>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <p className="text-sm font-semibold"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                            <p className="text-sm"><strong>Date:</strong> {new Date(invoice.issueDate).toLocaleDateString('en-GB')}</p>
                            {invoice.awbNumber && (
                                <div className="bg-blue-100 border border-blue-200 p-2 rounded">
                                    <p className="text-sm font-medium text-blue-800"><strong>AWB:</strong> {invoice.awbNumber}</p>
                                </div>
                            )}
                            {invoice.destination && <p className="text-sm"><strong>Destination:</strong> {invoice.destination}</p>}
                            {invoice.doorDelivery && <p className="text-sm"><strong>Door Delivery:</strong> {invoice.doorDelivery}</p>}
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                {(invoice.clientName || invoice.clientContactPerson || invoice.clientAddress || invoice.clientTin) && (
                    <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-base text-gray-800 mb-3 border-b border-gray-300 pb-2">Client Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            {invoice.clientName && (
                                <div>
                                    <span className="font-medium text-gray-700">Customer:</span>
                                    <p className="text-gray-900">{invoice.clientName}</p>
                                </div>
                            )}
                            {invoice.clientContactPerson && (
                                <div>
                                    <span className="font-medium text-gray-700">Contact Person:</span>
                                    <p className="text-gray-900">{invoice.clientContactPerson}</p>
                                </div>
                            )}
                            {invoice.clientAddress && (
                                <div>
                                    <span className="font-medium text-gray-700">Address:</span>
                                    <p className="text-gray-900">{invoice.clientAddress}</p>
                                </div>
                            )}
                            {invoice.clientTin && (
                                <div>
                                    <span className="font-medium text-gray-700">TIN:</span>
                                    <p className="text-gray-900">{invoice.clientTin}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Details Table - Only show if at least one field has data */}
                {(invoice.salesperson || invoice.deliverDate || invoice.paymentConditions || invoice.validityDate) && (
                    <div className="mb-8">
                        <h3 className="font-semibold text-base text-gray-800 mb-3">Service Details</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                            {invoice.salesperson && (
                                <div>
                                    <span className="font-medium text-gray-700 block">Salesperson</span>
                                    <p className="text-gray-900">{invoice.salesperson}</p>
                                </div>
                            )}
                            {invoice.deliverDate && (
                                <div>
                                    <span className="font-medium text-gray-700 block">Delivery Date</span>
                                    <p className="text-gray-900">{new Date(invoice.deliverDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            )}
                            {invoice.paymentConditions && (
                                <div>
                                    <span className="font-medium text-gray-700 block">Payment Terms</span>
                                    <p className="text-gray-900">{invoice.paymentConditions}</p>
                                </div>
                            )}
                            {invoice.validityDate && (
                                <div>
                                    <span className="font-medium text-gray-700 block">Valid Until</span>
                                    <p className="text-gray-900">{new Date(invoice.validityDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                    </tbody>
                </table>

                {/* Totals & Signature */}
                <div className="flex justify-between items-start mt-8">
                    <div className="w-2/3 pt-16">
                        <div className="border-t border-gray-300 pt-6">
                            <p className="text-sm text-gray-700 mb-2">Authorized Signature:</p>
                            <div className="h-12 border-b border-gray-300 w-2/3"></div>
                            {invoice.salesperson && (
                                <p className="mt-6 text-sm text-gray-600">
                                    <span className="font-medium">Prepared by:</span> {invoice.salesperson}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <h4 className="font-semibold text-gray-800 mb-3">Invoice Summary</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="text-gray-600">Sub-Total:</span>
                                    <span className="font-medium">{invoice.currency} {(invoice.subTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="text-gray-600">VAT/TVA:</span>
                                    <span className="font-medium">{invoice.currency} {(invoice.tva || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-red-600 text-red-600">
                                    <span>TOTAL:</span>
                                    <span>{invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-12 mt-8 border-t-2 border-gray-200">
                    <div className="bg-gray-50 p-4 rounded-lg mx-auto max-w-md">
                        <p className="font-semibold text-gray-800 mb-2">Payment Information</p>
                        <p className="text-sm text-gray-700 mb-3">All payments should be made payable to:</p>
                        <p className="font-bold text-gray-900">Africa World Cargo Ltd</p>
                        <div className="mt-4 pt-4 border-t border-gray-300">
                            <p className="font-bold text-red-600 text-lg">WE THANK YOU FOR YOUR TRUST</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrintPreview;
