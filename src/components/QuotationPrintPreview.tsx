import React from 'react';
import { Quotation } from '@/types';
import { QuotationCommodity } from '@/types/invoice';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

interface QuotationPrintPreviewProps {
  quotation: Quotation;
  onClose: () => void;
  onPrint: () => void;
}

const QuotationPrintPreview = ({ quotation, onClose, onPrint }: QuotationPrintPreviewProps) => {
  // Parse commodities from quotation volume
  const getCommodities = (): QuotationCommodity[] => {
    try {
      if (quotation.volume) {
        const parsed = JSON.parse(quotation.volume);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse commodities:', e);
    }
    return [];
  };

  const commodities = getCommodities();

  const handlePrint = () => {
    const printContent = document.getElementById('quotation-print-area');
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-10000px';
    iframe.style.left = '-10000px';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const printStyles = `
      <style>
        @page { 
          margin: 0.5in; 
          size: A4;
        }
        body { 
          font-family: Arial, sans-serif; 
          color: #000; 
          background: white;
          margin: 0;
          padding: 0;
        }
        .print-header { 
          text-align: center; 
          border-bottom: 2px solid #333; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .company-name { 
          font-size: 28px; 
          font-weight: bold; 
          color: #333; 
          margin-bottom: 5px;
        }
        .company-tagline { 
          font-size: 14px; 
          color: #666; 
          font-style: italic;
        }
        .quotation-title { 
          font-size: 24px; 
          font-weight: bold; 
          text-align: center; 
          margin: 30px 0; 
          color: #333;
        }
        .details-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .detail-section { 
          border: 1px solid #ddd; 
          padding: 15px; 
          border-radius: 8px;
        }
        .detail-section h3 { 
          margin: 0 0 15px 0; 
          font-size: 16px; 
          font-weight: bold; 
          color: #333; 
          border-bottom: 1px solid #eee; 
          padding-bottom: 8px;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 8px; 
          padding: 4px 0;
        }
        .detail-label { 
          font-weight: 600; 
          color: #555; 
        }
        .detail-value { 
          color: #333; 
        }
        .commodities-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0; 
        }
        .commodities-table th, 
        .commodities-table td { 
          border: 1px solid #ddd; 
          padding: 12px; 
          text-align: left; 
        }
        .commodities-table th { 
          background-color: #f8f9fa; 
          font-weight: bold; 
        }
        .pricing-summary { 
          background-color: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
        }
        .pricing-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 10px; 
          font-size: 16px;
        }
        .pricing-row.total { 
          font-weight: bold; 
          font-size: 18px; 
          border-top: 2px solid #333; 
          padding-top: 10px; 
          margin-top: 15px;
        }
        .footer { 
          margin-top: 40px; 
          text-align: center; 
          font-size: 12px; 
          color: #666; 
          border-top: 1px solid #ddd; 
          padding-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-won { background-color: #d1fae5; color: #065f46; }
        .status-lost { background-color: #fee2e2; color: #991b1b; }
      </style>
    `;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation - ${quotation.clientName}</title>
          ${printStyles}
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
      }, 100);
    };

    onPrint();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Printer className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Print Quotation</h2>
              <p className="text-sm text-gray-600">Preview and print quotation details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
            >
              <Printer size={16} />
              Print
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="gap-2"
            >
              <X size={16} />
              Close
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div id="quotation-print-area">
            <div className="print-header">
              <div className="company-name">AWC LOGISTICS</div>
              <div className="company-tagline">Your Trusted Logistics Partner</div>
              <div className="status-badge status-${quotation.status}" style={{ marginTop: '10px' }}>
                {quotation.status}
              </div>
            </div>
            
            <div className="quotation-title">QUOTATION</div>
            
            <div className="details-grid">
              <div className="detail-section">
                <h3>Client Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Client Name:</span>
                  <span className="detail-value">{quotation.clientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quotation ID:</span>
                  <span className="detail-value">{quotation.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{new Date(quotation.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Quote Sent By:</span>
                  <span className="detail-value">{quotation.quoteSentBy}</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Shipment Details</h3>
                <div className="detail-row">
                  <span className="detail-label">Destination:</span>
                  <span className="detail-value">{quotation.destination}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Freight Mode:</span>
                  <span className="detail-value">{quotation.freightMode}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Request Type:</span>
                  <span className="detail-value">{quotation.requestType}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Country of Origin:</span>
                  <span className="detail-value">{quotation.countryOfOrigin}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Door Delivery:</span>
                  <span className="detail-value">{quotation.doorDelivery}</span>
                </div>
              </div>
            </div>
            
            <div className="detail-section">
              <h3>Cargo Description</h3>
              <p style={{ margin: '10px 0', lineHeight: '1.5' }}>{quotation.cargoDescription}</p>
            </div>
            
            <div className="detail-section">
              <h3>Commodities</h3>
              <table className="commodities-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity (kg)</th>
                    <th>Rate</th>
                    <th>Client Rate</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {commodities.map((commodity, index) => (
                    <tr key={index}>
                      <td>{commodity.name || 'N/A'}</td>
                      <td>{commodity.quantityKg?.toLocaleString() || '0'}</td>
                      <td>{quotation.currency} {commodity.rate?.toLocaleString() || '0'}</td>
                      <td>{quotation.currency} {commodity.clientRate?.toLocaleString() || '0'}</td>
                      <td>{quotation.currency} {((commodity.quantityKg || 0) * (commodity.clientRate || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="pricing-summary">
              <div className="pricing-row">
                <span>Total Buy Rate:</span>
                <span>{quotation.currency} {quotation.buyRate?.toLocaleString() || '0'}</span>
              </div>
              <div className="pricing-row">
                <span>Client Quote:</span>
                <span>{quotation.currency} {quotation.clientQuote?.toLocaleString() || '0'}</span>
              </div>
              <div className="pricing-row">
                <span>Profit:</span>
                <span>{quotation.currency} {quotation.profit?.toLocaleString() || '0'}</span>
              </div>
              <div className="pricing-row total">
                <span>Total Quote:</span>
                <span>{quotation.currency} {quotation.clientQuote?.toLocaleString() || '0'}</span>
              </div>
            </div>
            
            {quotation.remarks && (
              <div className="detail-section">
                <h3>Remarks</h3>
                <p style={{ margin: '10px 0', lineHeight: '1.5' }}>{quotation.remarks}</p>
              </div>
            )}
            
            {quotation.followUpDate && (
              <div className="detail-section">
                <h3>Follow-up Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Follow-up Date:</span>
                  <span className="detail-value">{new Date(quotation.followUpDate).toLocaleDateString()}</span>
                </div>
              </div>
            )}
            
            <div className="footer">
              <p><strong>AWC LOGISTICS</strong></p>
              <p>Email: info@awclogistics.com | Phone: +1 (555) 123-4567</p>
              <p>Thank you for choosing AWC Logistics for your shipping needs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationPrintPreview;