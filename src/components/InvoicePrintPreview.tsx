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
    // Add professional print styles optimized for A4 layout
    doc.write(`<style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      * { 
        box-sizing: border-box; 
      }
      
      body { 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
        color: #1a1a1a !important; 
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif !important;
        font-size: 11px !important;
        line-height: 1.4 !important;
        margin: 0;
        padding: 15px;
        background: white;
      }
      
      @page { 
        size: A4; 
        margin: 0.4in 0.5in; 
      }
      
      .invoice-container { 
        max-width: 100%;
        margin: 0 auto;
        background: white;
        position: relative;
      }
      
      .professional-header {
        border-bottom: 3px solid #2563eb !important;
        margin-bottom: 20px !important;
        padding-bottom: 15px !important;
        background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
        padding: 20px !important;
        border-radius: 8px 8px 0 0 !important;
      }
      
      .company-logo {
        font-size: 24px !important;
        font-weight: 700 !important;
        color: #2563eb !important;
        margin-bottom: 8px !important;
      }
      
      .company-info {
        font-size: 10px !important;
        color: #475569 !important;
        line-height: 1.3 !important;
      }
      
      .invoice-title {
        font-size: 28px !important;
        font-weight: 700 !important;
        color: #2563eb !important;
        margin-bottom: 10px !important;
        text-transform: uppercase;
        letter-spacing: 1px !important;
      }
      
      .invoice-meta {
        background: #f1f5f9 !important;
        padding: 12px !important;
        border-radius: 6px !important;
        border-left: 4px solid #2563eb !important;
      }
      
      .section-header {
        font-size: 14px !important;
        font-weight: 600 !important;
        color: #1e293b !important;
        margin: 16px 0 8px 0 !important;
        padding-bottom: 4px !important;
        border-bottom: 2px solid #e2e8f0 !important;
        text-transform: uppercase;
        letter-spacing: 0.5px !important;
      }
      
      .info-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 15px !important;
        margin: 12px 0 !important;
      }
      
      .info-card {
        background: #f8fafc !important;
        padding: 12px !important;
        border-radius: 6px !important;
        border: 1px solid #e2e8f0 !important;
      }
      
      .info-label {
        font-weight: 600 !important;
        color: #475569 !important;
        font-size: 9px !important;
        text-transform: uppercase;
        letter-spacing: 0.5px !important;
        margin-bottom: 2px !important;
      }
      
      .info-value {
        color: #1e293b !important;
        font-size: 10px !important;
        font-weight: 500 !important;
      }
      
      .professional-table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 15px 0 !important;
        font-size: 10px !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        border-radius: 6px !important;
        overflow: hidden !important;
      }
      
      .table-header {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: white !important;
        font-weight: 600 !important;
        text-transform: uppercase;
        letter-spacing: 0.5px !important;
      }
      
      .table-header th {
        padding: 10px 8px !important;
        border: none !important;
        font-size: 9px !important;
        text-align: left !important;
      }
      
      .table-row {
        border-bottom: 1px solid #e2e8f0 !important;
      }
      
      .table-row:nth-child(even) {
        background: #f8fafc !important;
      }
      
      .table-row td {
        padding: 8px !important;
        border: none !important;
        border-right: 1px solid #e2e8f0 !important;
        font-size: 9px !important;
        color: #374151 !important;
      }
      
      .table-row td:last-child {
        border-right: none !important;
      }
      
      .amount-cell {
        font-weight: 600 !important;
        color: #059669 !important;
        text-align: right !important;
      }
      
      .totals-container {
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-start !important;
        margin-top: 20px !important;
      }
      
      .signature-section {
        width: 60% !important;
        padding-right: 20px !important;
      }
      
      .signature-line {
        border-bottom: 2px solid #d1d5db !important;
        width: 200px !important;
        height: 40px !important;
        margin: 10px 0 !important;
      }
      
      .totals-summary {
        width: 35% !important;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
        padding: 15px !important;
        border-radius: 8px !important;
        border: 2px solid #e2e8f0 !important;
      }
      
      .total-row {
        display: flex !important;
        justify-content: space-between !important;
        padding: 6px 0 !important;
        border-bottom: 1px solid #e2e8f0 !important;
      }
      
      .total-row:last-child {
        border-bottom: 2px solid #2563eb !important;
        font-weight: 700 !important;
        font-size: 12px !important;
        color: #2563eb !important;
        margin-top: 5px !important;
        padding-top: 8px !important;
      }
      
      .footer-payment {
        margin-top: 25px !important;
        padding: 15px !important;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
        border-radius: 8px !important;
        border-top: 3px solid #2563eb !important;
        text-align: center !important;
      }
      
      .payment-title {
        font-weight: 700 !important;
        color: #1e293b !important;
        font-size: 12px !important;
        margin-bottom: 8px !important;
        text-transform: uppercase;
      }
      
      .banking-info {
        font-size: 9px !important;
        color: #475569 !important;
        line-height: 1.3 !important;
      }
      
      .banking-highlight {
        background: #dbeafe !important;
        padding: 6px !important;
        border-radius: 4px !important;
        margin: 5px 0 !important;
        color: #1e40af !important;
        font-weight: 600 !important;
      }
      
      .professional-badge {
        display: inline-block !important;
        padding: 4px 8px !important;
        background: #dbeafe !important;
        color: #1e40af !important;
        border-radius: 4px !important;
        font-size: 8px !important;
        font-weight: 600 !important;
        text-transform: uppercase;
      }
      
      .watermark {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) rotate(-45deg) !important;
        font-size: 60px !important;
        color: rgba(37, 99, 235, 0.05) !important;
        font-weight: 900 !important;
        z-index: 0 !important;
        pointer-events: none !important;
      }
      
      .content-layer {
        position: relative !important;
        z-index: 1 !important;
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
      <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto border shadow-large">
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
        
        <div className="p-8 bg-gray-50/30">
            <div id="invoice-print-area" className="bg-white shadow-xl rounded-lg overflow-hidden max-w-4xl mx-auto">
                {/* Watermark */}
                <div className="watermark">AWC LOGISTICS</div>
                
                {/* Content Layer */}
                <div className="content-layer">
                    {/* Company Header */}
                    <div className="professional-header">
                        <div className="flex justify-between items-start">
                            <div className="w-2/3 pr-6">
                                <div className="company-logo">
                                    <ProfessionalLogo size="lg" variant="invoice" className="mb-3" />
                                    Africa World Cargo Ltd
                                </div>
                                <div className="company-info space-y-1">
                                    <p className="font-semibold text-slate-700">TIN: 112933303 RW</p>
                                    <p className="text-slate-600">KN 5 rd, Av18, 30 Remera, Kigali, Rwanda</p>
                                    <p className="text-slate-600">Phone: +250 784 445 373</p>
                                </div>
                                <div className="banking-highlight mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="font-semibold text-blue-900 mb-2">Banking Details</p>
                                    <div className="banking-info text-blue-800">
                                        <p className="font-medium">Bank of Kigali</p>
                                        <p>RWF: 00265 07771361 40 | EUR: 00265-07771427-09</p>
                                        <p>USD: 00265-07771426-08 | Swift: BKIGRWRW</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right w-1/3">
                                <h1 className="invoice-title">INVOICE</h1>
                                <div className="invoice-meta space-y-2">
                                    <div className="professional-badge">
                                        Invoice #{invoice.invoiceNumber}
                                    </div>
                                    <p className="text-sm font-medium">Date: {new Date(invoice.issueDate).toLocaleDateString('en-GB')}</p>
                                    {invoice.awbNumber && (
                                        <div className="bg-blue-100 border border-blue-300 p-2 rounded-md">
                                            <p className="font-semibold text-blue-900">AWB: {invoice.awbNumber}</p>
                                        </div>
                                    )}
                                    {invoice.destination && <p className="text-sm">Destination: {invoice.destination}</p>}
                                    {invoice.doorDelivery && <p className="text-sm">Door Delivery: {invoice.doorDelivery}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    {(invoice.clientName || invoice.clientContactPerson || invoice.clientAddress || invoice.clientTin) && (
                        <div className="p-6 mx-6 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="section-header mb-4">Client Information</h3>
                            <div className="info-grid">
                                {invoice.clientName && (
                                    <div className="info-card">
                                        <div className="info-label">Customer</div>
                                        <div className="info-value">{invoice.clientName}</div>
                                    </div>
                                )}
                                {invoice.clientContactPerson && (
                                    <div className="info-card">
                                        <div className="info-label">Contact Person</div>
                                        <div className="info-value">{invoice.clientContactPerson}</div>
                                    </div>
                                )}
                                {invoice.clientAddress && (
                                    <div className="info-card">
                                        <div className="info-label">Address</div>
                                        <div className="info-value">{invoice.clientAddress}</div>
                                    </div>
                                )}
                                {invoice.clientTin && (
                                    <div className="info-card">
                                        <div className="info-label">TIN</div>
                                        <div className="info-value">{invoice.clientTin}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Service Details */}
                    {(invoice.salesperson || invoice.deliverDate || invoice.paymentConditions || invoice.validityDate) && (
                        <div className="p-6 mx-6 bg-slate-50 rounded-lg border border-slate-200">
                            <h3 className="section-header mb-4">Service Details</h3>
                            <div className="info-grid grid-cols-4">
                                {invoice.salesperson && (
                                    <div className="info-card">
                                        <div className="info-label">Salesperson</div>
                                        <div className="info-value">{invoice.salesperson}</div>
                                    </div>
                                )}
                                {invoice.deliverDate && (
                                    <div className="info-card">
                                        <div className="info-label">Delivery Date</div>
                                        <div className="info-value">{new Date(invoice.deliverDate).toLocaleDateString('en-GB')}</div>
                                    </div>
                                )}
                                {invoice.paymentConditions && (
                                    <div className="info-card">
                                        <div className="info-label">Payment Terms</div>
                                        <div className="info-value">{invoice.paymentConditions}</div>
                                    </div>
                                )}
                                {invoice.validityDate && (
                                    <div className="info-card">
                                        <div className="info-label">Valid Until</div>
                                        <div className="info-value">{new Date(invoice.validityDate).toLocaleDateString('en-GB')}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Items Table */}
                    <div className="mx-6">
                        <h3 className="section-header mb-4">Invoice Items</h3>
                        <table className="professional-table">
                            <thead>
                                <tr className="table-header">
                                    <th>Qty (kg)</th>
                                    <th>Commodity</th>
                                    <th>Description</th>
                                    <th className="text-right">Price</th>
                                    <th className="text-right">Total ({invoice.currency})</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item) => {
                                    if (item.charges.length === 1) {
                                        const charge = item.charges[0];
                                        return (
                                            <tr key={item.id} className="table-row">
                                                <td className="text-center font-medium">{item.quantityKg || 0}</td>
                                                <td className="font-medium">{item.commodity || ''}</td>
                                                <td>{charge.description || ''}</td>
                                                <td className="text-right">{(charge.rate || 0).toFixed(2)}</td>
                                                <td className="amount-cell">{(item.total || 0).toFixed(2)}</td>
                                            </tr>
                                        );
                                    } else {
                                        return (
                                            <React.Fragment key={item.id}>
                                                <tr className="table-row bg-blue-50 font-semibold">
                                                    <td className="text-center">{item.quantityKg || 0}</td>
                                                    <td colSpan={2} className="font-bold">{item.commodity || ''}</td>
                                                    <td className="text-right">
                                                        {(item.charges.reduce((sum, c) => sum + (c.rate || 0), 0)).toFixed(2)}
                                                    </td>
                                                    <td className="amount-cell">{(item.total || 0).toFixed(2)}</td>
                                                </tr>
                                                {item.charges.map(charge => (
                                                    <tr key={charge.id} className="table-row">
                                                        <td></td>
                                                        <td colSpan={2} className="text-slate-600 italic pl-4">→ {charge.description || ''}</td>
                                                        <td className="text-right">{(charge.rate || 0).toFixed(2)}</td>
                                                        <td className="text-right">{((item.quantityKg || 0) * (charge.rate || 0)).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        );
                                    }
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals & Signature */}
                    <div className="totals-container mx-6">
                        <div className="signature-section">
                            <h3 className="section-header mb-4">Authorization</h3>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <p className="text-sm text-slate-600 mb-3">Authorized Signature:</p>
                                <div className="signature-line bg-white border-2 border-dashed border-slate-300 rounded"></div>
                                {invoice.salesperson && (
                                    <div className="mt-3 pt-3 border-t border-slate-200">
                                        <p className="text-sm text-slate-700">
                                            <span className="font-semibold">Prepared by:</span> {invoice.salesperson}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Date: {new Date().toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="totals-summary">
                            <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Invoice Summary</h4>
                            <div className="space-y-2">
                                <div className="total-row">
                                    <span className="text-slate-600">Sub-Total:</span>
                                    <span className="font-semibold">{invoice.currency} {(invoice.subTotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span className="text-slate-600">VAT/TVA (18%):</span>
                                    <span className="font-semibold">{invoice.currency} {(invoice.tva || 0).toFixed(2)}</span>
                                </div>
                                <div className="total-row">
                                    <span className="text-lg">TOTAL AMOUNT:</span>
                                    <span className="text-lg">{invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Professional Footer */}
                    <div className="footer-payment mx-6">
                        <div className="payment-title">Payment Information</div>
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-slate-700">All payments should be made payable to:</p>
                            <div className="banking-highlight">
                                <p className="font-bold text-lg">Africa World Cargo Ltd</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-300">
                                <p className="font-bold text-blue-600 text-lg tracking-wide">
                                    🙏 WE THANK YOU FOR YOUR TRUST
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                    Invoice generated on {new Date().toLocaleDateString('en-GB')} | AWC Logistics Management System
                                </p>
                            </div>
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
