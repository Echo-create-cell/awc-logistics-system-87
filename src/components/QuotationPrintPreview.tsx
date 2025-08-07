import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import { Quotation } from '@/types';

interface QuotationPrintPreviewProps {
  quotation: Quotation;
  onClose: () => void;
  onPrint: () => void;
}

const QuotationPrintPreview = ({ quotation, onClose, onPrint }: QuotationPrintPreviewProps) => {
  const handlePrint = () => {
    const printContent = document.getElementById('quotation-print-area');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Quotation ${quotation.id}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
                line-height: 1.6;
              }
              .header { 
                text-align: center; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #ddd; 
                padding-bottom: 20px;
              }
              .company-name { 
                font-size: 24px; 
                font-weight: bold; 
                color: #2563eb;
                margin-bottom: 5px;
              }
              .quotation-title { 
                font-size: 20px; 
                font-weight: bold; 
                margin: 15px 0;
              }
              .section { 
                margin-bottom: 25px; 
              }
              .section-title { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 10px; 
                color: #374151;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 5px;
              }
              .detail-row { 
                margin-bottom: 8px; 
                display: flex;
                justify-content: space-between;
              }
              .detail-label { 
                font-weight: bold; 
                color: #6b7280;
                min-width: 120px;
              }
              .detail-value { 
                flex: 1;
                text-align: right;
              }
              .table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-top: 15px;
              }
              .table th, .table td { 
                border: 1px solid #ddd; 
                padding: 10px; 
                text-align: left; 
              }
              .table th { 
                background-color: #f9fafb; 
                font-weight: bold;
              }
              .footer { 
                margin-top: 30px; 
                text-align: center; 
                font-size: 12px; 
                color: #6b7280;
                border-top: 1px solid #e5e7eb;
                padding-top: 15px;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
              }
              .status-pending { background-color: #fef3c7; color: #92400e; }
              .status-won { background-color: #d1fae5; color: #065f46; }
              .status-lost { background-color: #fee2e2; color: #991b1b; }
              @media print {
                body { margin: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      doc.close();

      iframe.onload = () => {
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      };
    }

    onPrint();
  };

  const formatVolume = (volume: string) => {
    try {
      const parsed = JSON.parse(volume);
      if (Array.isArray(parsed)) {
        const totalWeight = parsed.reduce((sum, item) => sum + parseFloat(item.quantityKg || 0), 0);
        return `${totalWeight.toLocaleString()} kg`;
      }
    } catch {
      const vol = Number(volume);
      if (!isNaN(vol)) {
        return `${vol.toLocaleString()} kg`;
      }
    }
    return volume || 'N/A';
  };

  const getCommodityItems = () => {
    try {
      const parsed = JSON.parse(quotation.volume);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, create a single item
      return [{
        description: quotation.cargoDescription || 'Cargo',
        quantityKg: Number(quotation.volume) || 0,
        dimensions: 'N/A'
      }];
    }
    return [];
  };

  const commodityItems = getCommodityItems();

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[95vh] overflow-y-auto bg-white">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Printer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Print Quotation Preview
                </DialogTitle>
                <p className="text-gray-600 text-sm mt-1">
                  Review quotation details before printing
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                <Printer size={16} />
                Print
              </Button>
              <Button variant="outline" onClick={onClose} className="gap-2">
                <X size={16} />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="quotation-print-area" className="p-6">
          {/* Header */}
          <div className="header">
            <div className="company-name">AWC LOGISTICS</div>
            <div className="text-sm text-gray-600">Air, Sea & Land Freight Solutions</div>
            <div className="quotation-title">QUOTATION #{quotation.id}</div>
            <div className="text-sm text-gray-600">
              Generated on {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          {/* Client Information */}
          <div className="section">
            <div className="section-title">Client Information</div>
            <div className="detail-row">
              <span className="detail-label">Client Name:</span>
              <span className="detail-value">{quotation.clientName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`detail-value status-badge status-${quotation.status}`}>
                {quotation.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Sales Agent:</span>
              <span className="detail-value">{quotation.quoteSentBy}</span>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="section">
            <div className="section-title">Shipment Details</div>
            <div className="detail-row">
              <span className="detail-label">Origin:</span>
              <span className="detail-value">{quotation.countryOfOrigin}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Destination:</span>
              <span className="detail-value">{quotation.destination}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Freight Mode:</span>
              <span className="detail-value">{quotation.freightMode}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total Volume:</span>
              <span className="detail-value">{formatVolume(quotation.volume)}</span>
            </div>
          </div>

          {/* Commodity Items */}
          {commodityItems.length > 0 && (
            <div className="section">
              <div className="section-title">Commodity Details</div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Weight (kg)</th>
                    <th>Dimensions</th>
                  </tr>
                </thead>
                <tbody>
                  {commodityItems.map((item, index) => (
                    <tr key={index}>
                      <td>{item.description || quotation.cargoDescription}</td>
                      <td>{Number(item.quantityKg || 0).toLocaleString()}</td>
                      <td>{item.dimensions || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pricing Information */}
          <div className="section">
            <div className="section-title">Pricing Details</div>
            <div className="detail-row">
              <span className="detail-label">Buy Rate:</span>
              <span className="detail-value">{quotation.currency} {quotation.buyRate.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Client Quote:</span>
              <span className="detail-value">{quotation.currency} {quotation.clientQuote.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Profit:</span>
              <span className="detail-value">{quotation.currency} {quotation.profit.toLocaleString()}</span>
            </div>
          </div>

          {/* Additional Information */}
          {quotation.remarks && (
            <div className="section">
              <div className="section-title">Remarks</div>
              <div className="text-sm text-gray-700">{quotation.remarks}</div>
            </div>
          )}

          {/* Footer */}
          <div className="footer">
            <div>AWC LOGISTICS - Your Trusted Freight Partner</div>
            <div>This quotation is valid for 30 days from the date of issue.</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationPrintPreview;