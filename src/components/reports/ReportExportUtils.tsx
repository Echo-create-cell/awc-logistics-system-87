
import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { User } from '@/types';

export const generatePrintReport = (
  filteredData: (Quotation | InvoiceData)[],
  summary: any,
  dateRange: { from: string; to: string },
  reportType: string,
  user: User
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const printContent = `
    <html>
      <head>
        <title>Financial Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .report-info { text-align: right; }
          h1, h2 { color: #333; margin: 20px 0 10px 0; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .metric-card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; text-align: center; background: #f9f9f9; }
          .metric-title { font-size: 14px; color: #666; margin-bottom: 8px; }
          .metric-value { font-size: 24px; font-weight: bold; }
          .revenue { color: #10b981; }
          .profit { color: #3b82f6; }
          .loss { color: #ef4444; }
          .rate { color: #8b5cf6; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .status-won, .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-lost, .status-overdue { background: #fee2e2; color: #991b1b; }
          @media print { body { margin: 0; } .no-print { display: none; } }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AWC Logistics</div>
          <div class="report-info">
            <div><strong>Financial Report</strong></div>
            <div>Generated: ${new Date().toLocaleDateString()}</div>
            <div>By: ${user.name} (${user.role.replace('_', ' ')})</div>
          </div>
        </div>

        <h1>Executive Summary</h1>
        <p><strong>Report Period:</strong> ${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}</p>
        <p><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
        
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Total Revenue</div>
            <div class="metric-value revenue">$${summary.totalRevenue.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Profit</div>
            <div class="metric-value profit">$${summary.totalProfit.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Loss</div>
            <div class="metric-value loss">$${summary.totalLoss.toLocaleString()}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Win Rate</div>
            <div class="metric-value rate">${summary.winRate.toFixed(1)}%</div>
          </div>
        </div>

        <h2>Recent Activity</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.slice(0, 25).map(item => {
              const isQuotation = 'clientQuote' in item;
              const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
              const statusClass = item.status === 'won' || item.status === 'paid' ? 'status-won' : 
                                item.status === 'pending' ? 'status-pending' : 'status-lost';
              return `
                <tr>
                  <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>${isQuotation ? 'Quotation' : 'Invoice'}</td>
                  <td>${item.clientName || 'N/A'}</td>
                  <td>$${amount.toLocaleString()}</td>
                  <td><span class="status-badge ${statusClass}">${item.status.toUpperCase()}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated automatically by AWC Logistics Management System</p>
          <p>© ${new Date().getFullYear()} AWC Logistics. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

export const generateCSVExport = (
  reportType: string,
  quotations: Quotation[],
  filteredData: (Quotation | InvoiceData)[]
) => {
  let csvContent = '';
  let filename = '';

  if (reportType === 'quotations') {
    csvContent = 'Date,Client,Destination,Volume,Buy Rate,Sell Rate,Profit,Status,Agent\n';
    quotations.forEach((item) => {
      const volume = item.totalVolumeKg || 0;
      csvContent += `${item.createdAt},${item.clientName || ''},${item.destination || ''},${volume},${item.buyRate},${item.clientQuote},${item.profit},${item.status},${item.quoteSentBy}\n`;
    });
    filename = `quotations-report-${new Date().toISOString().split('T')[0]}.csv`;
  } else if (reportType === 'financial') {
    csvContent = 'Date,Type,Client,Amount,Currency,Status\n';
    filteredData.forEach((item: any) => {
      if ('clientQuote' in item) {
        const quotation = item as Quotation;
        csvContent += `${quotation.createdAt},Quotation,${quotation.clientName || ''},${quotation.clientQuote},${quotation.currency},${quotation.status}\n`;
      } else {
        const invoice = item as InvoiceData;
        csvContent += `${invoice.createdAt},Invoice,${invoice.clientName},${invoice.totalAmount},${invoice.currency},${invoice.status}\n`;
      }
    });
    filename = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
