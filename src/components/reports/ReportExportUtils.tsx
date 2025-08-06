
import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { User } from '@/types';

export const generatePrintReport = (
  filteredData: (Quotation | InvoiceData)[],
  summary: any,
  dateRange: { from: string; to: string },
  reportType: string,
  user: User,
  reportData?: any
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate the PDF report');
    return;
  }

  const currentDate = new Date().toLocaleDateString();
  const reportTitle = `${user.role === 'partner' ? 'Partner Analytics' : 'Business'} Report - ${currentDate}`;
  
  const printContent = `
    <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            margin: 20px; 
            color: #1f2937; 
            line-height: 1.5;
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 20px; 
            margin-bottom: 30px; 
          }
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #6366f1; 
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo::before {
            content: "📊";
            font-size: 24px;
          }
          .report-info { text-align: right; }
          .report-info h1 { font-size: 24px; margin-bottom: 8px; color: #1f2937; }
          .report-info p { color: #6b7280; margin: 4px 0; }
          .section { margin: 30px 0; }
          .section h2 { 
            color: #1f2937; 
            font-size: 20px; 
            margin-bottom: 15px; 
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 25px 0; 
          }
          .metric-card { 
            border: 2px solid #e5e7eb; 
            padding: 20px; 
            border-radius: 12px; 
            text-align: center; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            transition: all 0.3s ease;
          }
          .metric-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .metric-title { font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500; }
          .metric-value { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
          .revenue { color: #10b981; }
          .profit { color: #3b82f6; }
          .loss { color: #ef4444; }
          .rate { color: #8b5cf6; }
          .filter-info {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #6366f1;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px 16px; 
            text-align: left; 
          }
          th { 
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
            color: white; 
            font-weight: 600; 
            font-size: 14px;
          }
          td { font-size: 13px; }
          .status-badge { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 11px; 
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-won, .status-paid { background: #dcfce7; color: #166534; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .status-lost, .status-overdue { background: #fee2e2; color: #991b1b; }
          .footer { 
            text-align: center; 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 12px; 
          }
          @media print { 
            body { margin: 0; } 
            .no-print { display: none; } 
            .metric-card { break-inside: avoid; }
            table { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">AWC Logistics</div>
          <div class="report-info">
            <h1>${reportTitle}</h1>
            <p><strong>Generated:</strong> ${currentDate}</p>
            <p><strong>By:</strong> ${user.name} (${user.role.replace('_', ' ').toUpperCase()})</p>
            <p><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
          </div>
        </div>

        <div class="filter-info">
          <h3 style="margin-bottom: 10px; color: #1f2937; font-size: 16px;">📋 Report Filters Applied</h3>
          <p><strong>Date Range:</strong> ${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}</p>
          <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
          <p><strong>Total Records:</strong> ${filteredData.length} items</p>
        </div>
        
        <div class="section">
          <h2>📊 Executive Summary</h2>
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
        </div>

        <div class="section">
          <h2>📈 Recent Activity Data</h2>
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
        </div>

        ${reportData ? `
        <div class="section">
          <h2>🎯 Detailed Analytics</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Total Invoices</div>
            <div class="metric-value">${summary.totalInvoices}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Paid Invoices</div>
            <div class="metric-value">${summary.paidInvoices}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Pending Invoices</div>
            <div class="metric-value">${summary.pendingInvoices}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Overdue Invoices</div>
            <div class="metric-value">${summary.overdueInvoices}</div>
          </div>
        </div>

        ${reportData.topClients && reportData.topClients.length > 0 ? `
        <h2>Top Clients by Revenue</h2>
        <table>
          <thead>
            <tr>
              <th>Client Name</th>
              <th>Revenue</th>
              <th>Quotations</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topClients.slice(0, 10).map((client: any) => `
              <tr>
                <td>${client.name}</td>
                <td>$${client.revenue.toLocaleString()}</td>
                <td>${client.quotations}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${reportData.monthlyTrends && reportData.monthlyTrends.length > 0 ? `
        <h2>Monthly Performance Trends</h2>
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>Revenue</th>
              <th>Profit</th>
              <th>Quotations</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.monthlyTrends.map((trend: any) => `
              <tr>
                <td>${trend.month}</td>
                <td>$${trend.revenue.toLocaleString()}</td>
                <td>$${trend.profit.toLocaleString()}</td>
                <td>${trend.quotations}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}

        ${(user.role === 'admin' || user.role === 'sales_director' || user.role === 'finance_officer' || user.role === 'partner') && reportData.userActivities && reportData.userActivities.length > 0 ? `
        <h2>User Activity Summary</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Quotations Created</th>
              <th>Quotations Won</th>
              <th>Win Rate</th>
              <th>Total Profit</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.userActivities.map((activity: any) => `
              <tr>
                <td>${activity.userName}</td>
                <td>${activity.quotationsCreated}</td>
                <td>${activity.quotationsWon}</td>
                <td>${activity.winRate.toFixed(1)}%</td>
                <td>$${activity.totalProfit.toLocaleString()}</td>
                <td>$${activity.totalRevenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}
        ` : ''}

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
