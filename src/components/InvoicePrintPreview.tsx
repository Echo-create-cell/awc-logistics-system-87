import React from 'react';
import { ProfessionalLogo } from '@/components/ui/professional-logo';
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
    // Add comprehensive print styles for one-page layout
    doc.write(`<style>
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
        color: black !important; 
        font-size: 10px !important;
        line-height: 1.2 !important;
        margin: 0;
        padding: 10px;
      }
      @page { 
        size: A4; 
        margin: 0.3in; 
        margin-top: 0.2in;
        margin-bottom: 0.2in;
      }
      .invoice-container { 
        max-height: 100vh; 
        overflow: hidden; 
        font-size: 10px !important;
      }
      h1, h2, h3, h4 { 
        font-size: 12px !important; 
        margin: 4px 0 !important; 
      }
      h1 { font-size: 18px !important; }
      table { 
        font-size: 9px !important; 
        border-collapse: collapse !important;
        width: 100% !important;
      }
      th, td { 
        padding: 2px 4px !important; 
        border: 1px solid #000 !important;
        font-size: 9px !important;
      }
      .company-header { 
        margin-bottom: 8px !important; 
        padding-bottom: 8px !important;
      }
      .client-info, .service-details { 
        margin-bottom: 6px !important; 
        padding: 6px !important;
      }
      .totals-section { 
        margin-top: 8px !important;
      }
      .signature-area { 
        margin-top: 8px !important;
        padding-top: 8px !important;
      }
      .footer-section { 
        margin-top: 8px !important;
        padding-top: 8px !important;
      }
      .banking-details { 
        font-size: 8px !important;
        line-height: 1.1 !important;
      }
      .invoice-summary { 
        font-size: 9px !important;
      }
      .grid { 
        display: grid !important;
        gap: 4px !important;
      }
      .space-y-1 > * + * { 
        margin-top: 2px !important;
      }
      .space-y-2 > * + * { 
        margin-top: 4px !important;
      }
      .mb-8 { 
        margin-bottom: 6px !important;
      }
      .mb-6 { 
        margin-bottom: 4px !important;
      }
      .p-4 { 
        padding: 6px !important;
      }
      .pt-16 { 
        padding-top: 8px !important;
      }
      .pt-12 { 
        padding-top: 6px !important;
      }
      .mt-8 { 
        margin-top: 6px !important;
      }
    </style>`);

    doc.write('</head><body class="font-sans"><div class="invoice-container">');
    doc.write(printElement.innerHTML);
    doc.write('</div></body></html>');
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto border shadow-lg">
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
            <div id="invoice-print-area" className="print:text-xs print:leading-tight">
                {/* Company Header */}
                <div className="company-header flex justify-between items-start mb-4 pb-3 border-b border-primary">
                    <div className="w-2/3 pr-4">
                        <ProfessionalLogo size="lg" variant="invoice" className="mb-2" />
                        <h2 className="font-bold text-sm text-foreground mb-1">Africa World Cargo Ltd</h2>
                        <p className="text-xs text-muted-foreground mb-1">TIN: 112933303 RW</p>
                        <p className="text-xs text-foreground leading-tight mb-2">
                            KN 5 rd, Av18, 30 Remera, Kigali, Rwanda
                        </p>
                        <div className="banking-details border-t border-border pt-2">
                            <p className="text-xs font-semibold text-foreground mb-1">Banking Details</p>
                            <p className="text-xs text-foreground mb-1"><strong>Bank of Kigali</strong></p>
                            <div className="text-xs text-muted-foreground leading-tight">
                                <p>RWF: 00265 07771361 40 | EUR: 00265-07771427-09</p>
                                <p>USD: 00265-07771426-08 | Swift: BKIGRWRW</p>
                                <p><strong>Phone:</strong> +250 784 445 373</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right w-1/3">
                        <h1 className="text-2xl font-bold text-primary mb-2">INVOICE</h1>
                        <div className="bg-muted p-2 rounded text-xs space-y-1">
                            <p className="font-semibold"><strong>Invoice #:</strong> {invoice.invoiceNumber}</p>
                            <p><strong>Date:</strong> {new Date(invoice.issueDate).toLocaleDateString('en-GB')}</p>
                            {invoice.awbNumber && (
                                <div className="bg-accent border border-accent-foreground/20 p-1 rounded">
                                    <p className="font-medium text-accent-foreground"><strong>AWB:</strong> {invoice.awbNumber}</p>
                                </div>
                            )}
                            {invoice.destination && <p><strong>Destination:</strong> {invoice.destination}</p>}
                            {invoice.doorDelivery && <p><strong>Door Delivery:</strong> {invoice.doorDelivery}</p>}
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                {(invoice.clientName || invoice.clientContactPerson || invoice.clientAddress || invoice.clientTin) && (
                    <div className="client-info mb-3 bg-muted p-2 rounded">
                        <h3 className="font-semibold text-sm text-foreground mb-2 border-b border-border pb-1">Client Information</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {invoice.clientName && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Customer:</span>
                                    <p className="text-foreground">{invoice.clientName}</p>
                                </div>
                            )}
                            {invoice.clientContactPerson && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Contact Person:</span>
                                    <p className="text-foreground">{invoice.clientContactPerson}</p>
                                </div>
                            )}
                            {invoice.clientAddress && (
                                <div>
                                    <span className="font-medium text-muted-foreground">Address:</span>
                                    <p className="text-foreground">{invoice.clientAddress}</p>
                                </div>
                            )}
                            {invoice.clientTin && (
                                <div>
                                    <span className="font-medium text-muted-foreground">TIN:</span>
                                    <p className="text-foreground">{invoice.clientTin}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Details Table - Only show if at least one field has data */}
                {(invoice.salesperson || invoice.deliverDate || invoice.paymentConditions || invoice.validityDate) && (
                    <div className="service-details mb-3">
                        <h3 className="font-semibold text-sm text-foreground mb-2">Service Details</h3>
                        <div className="grid grid-cols-4 gap-2 bg-muted p-2 rounded text-xs">
                            {invoice.salesperson && (
                                <div>
                                    <span className="font-medium text-muted-foreground block">Salesperson</span>
                                    <p className="text-foreground">{invoice.salesperson}</p>
                                </div>
                            )}
                            {invoice.deliverDate && (
                                <div>
                                    <span className="font-medium text-muted-foreground block">Delivery Date</span>
                                    <p className="text-foreground">{new Date(invoice.deliverDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            )}
                            {invoice.paymentConditions && (
                                <div>
                                    <span className="font-medium text-muted-foreground block">Payment Terms</span>
                                    <p className="text-foreground">{invoice.paymentConditions}</p>
                                </div>
                            )}
                            {invoice.validityDate && (
                                <div>
                                    <span className="font-medium text-muted-foreground block">Valid Until</span>
                                    <p className="text-foreground">{new Date(invoice.validityDate).toLocaleDateString('en-GB')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Items Table */}
                <table className="w-full border-collapse mb-3 text-xs">
                    <thead>
                        <tr className="bg-primary text-primary-foreground">
                            <th className="border border-foreground px-1 py-1 text-left font-normal text-xs">Qty (kg)</th>
                            <th className="border border-foreground px-1 py-1 text-left font-normal text-xs">Commodity</th>
                            <th className="border border-foreground px-1 py-1 text-left font-normal text-xs">Description</th>
                            <th className="border border-foreground px-1 py-1 text-right font-normal text-xs">Price</th>
                            <th className="border border-foreground px-1 py-1 text-right font-normal text-xs">Total ({invoice.currency})</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => {
                            if (item.charges.length === 1) {
                                const charge = item.charges[0];
                                return (
                                    <tr key={item.id} className="even:bg-muted">
                                        <td className="border border-border px-1 py-1 text-center text-xs">{item.quantityKg || 0}</td>
                                        <td className="border border-border px-1 py-1 text-xs">{item.commodity || ''}</td>
                                        <td className="border border-border px-1 py-1 text-xs">{charge.description || ''}</td>
                                        <td className="border border-border px-1 py-1 text-right text-xs">{(charge.rate || 0).toFixed(2)}</td>
                                        <td className="border border-border px-1 py-1 text-right text-xs">{(item.total || 0).toFixed(2)}</td>
                                    </tr>
                                );
                            } else {
                                return (
                                    <React.Fragment key={item.id}>
                                        <tr className="bg-muted/60 font-bold">
                                            <td className="border border-border px-1 py-1 text-center text-xs">{item.quantityKg || 0}</td>
                                            <td className="border border-border px-1 py-1 text-xs" colSpan={2}>{item.commodity || ''}</td>
                                            <td className="border border-border px-1 py-1 text-right text-xs">
                                                {(item.charges.reduce((sum, c) => sum + (c.rate || 0), 0)).toFixed(2)}
                                            </td>
                                            <td className="border border-border px-1 py-1 text-right text-xs">{(item.total || 0).toFixed(2)}</td>
                                        </tr>
                                        {item.charges.map(charge => (
                                            <tr key={charge.id} className="even:bg-muted">
                                                <td className="border border-border px-1 py-1"></td>
                                                <td className="border border-border px-1 py-1 italic text-xs" colSpan={2}>- {charge.description || ''}</td>
                                                <td className="border border-border px-1 py-1 text-right text-xs">{(charge.rate || 0).toFixed(2)}</td>
                                                <td className="border border-border px-1 py-1 text-right text-xs">{((item.quantityKg || 0) * (charge.rate || 0)).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            }
                        })}
                    </tbody>
                </table>

                {/* Totals & Signature */}
                <div className="totals-section flex justify-between items-start mt-4">
                    <div className="signature-area w-2/3 pt-4">
                        <div className="border-t border-border pt-2">
                            <p className="text-xs text-muted-foreground mb-1">Authorized Signature:</p>
                            <div className="h-6 border-b border-border w-2/3"></div>
                            {invoice.salesperson && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Prepared by:</span> {invoice.salesperson}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="w-1/3">
                        <div className="invoice-summary bg-muted p-2 rounded border">
                            <h4 className="font-semibold text-foreground mb-2 text-xs">Invoice Summary</h4>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between py-1 border-b border-border">
                                    <span className="text-muted-foreground">Sub-Total:</span>
                                    <span className="font-medium">{invoice.currency} {(invoice.subTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-border">
                                    <span className="text-muted-foreground">VAT/TVA:</span>
                                    <span className="font-medium">{invoice.currency} {(invoice.tva || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between py-1 font-bold text-sm border-t border-primary text-primary">
                                    <span>TOTAL:</span>
                                    <span>{invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="footer-section text-center pt-4 mt-4 border-t border-border">
                    <div className="bg-muted p-2 rounded mx-auto max-w-md">
                        <p className="font-semibold text-foreground mb-1 text-xs">Payment Information</p>
                        <p className="text-xs text-muted-foreground mb-1">All payments should be made payable to:</p>
                        <p className="font-bold text-foreground text-xs">Africa World Cargo Ltd</p>
                        <div className="mt-2 pt-2 border-t border-border">
                            <p className="font-bold text-primary text-sm">WE THANK YOU FOR YOUR TRUST</p>
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
