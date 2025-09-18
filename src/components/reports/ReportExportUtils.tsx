import { Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { User } from '@/types';
import { showPersistentToast } from '@/components/ui/persistent-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePrintReport = (
  filteredData: (Quotation | InvoiceData)[],
  summary: any,
  dateRange: { from: string; to: string },
  reportType: string,
  user: User,
  reportData?: any
) => {
  try {
    console.log('Starting PDF generation...', { 
      dataCount: filteredData.length, 
      summary, 
      dateRange, 
      reportType 
    });
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showPersistentToast({
        title: 'Popup Blocked',
        description: 'Please allow popups to generate the PDF report. Check your browser settings and try again.',
        variant: 'warning',
        category: 'Print',
        persistent: false
      });
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
          .rate { color: #f97316; } /* Orange color for win rate */
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
                    <td>$${amount ? amount.toLocaleString() : '0'}</td>
                    <td><span class="status-badge ${statusClass}">${item.status}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${reportData ? `
        <div class="section">
          <h2>🎯 Detailed Analytics</h2>
          <table>
            <thead>
              <tr>
                <th>Client</th>
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
        </div>
        ` : ''}

        <div class="footer">
          <p>© ${new Date().getFullYear()} AWC Logistics Management System</p>
          <p>This report was generated on ${new Date().toLocaleString()} by ${user.name}</p>
          <p style="margin-top: 10px; font-weight: bold;">📄 Report contains ${filteredData.length} records</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  
  // Wait for content to load then trigger print
  printWindow.onload = () => {
    console.log('PDF content loaded, triggering print...');
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  console.log('PDF generation completed successfully');
  } catch (error) {
    console.error('Error generating PDF:', error);
    showPersistentToast({
      title: 'PDF Generation Failed',
      description: 'Error generating PDF report. Please try again.',
      variant: 'error',
      category: 'Reports',
      persistent: false
    });
  }
};

export const generateCSVExport = (
  reportType: string,
  quotations: Quotation[],
  filteredData: (Quotation | InvoiceData)[]
) => {
  try {
    let csvContent = '';
    let filename = '';

    if (reportType === 'quotations') {
      filename = `quotations-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Date,Client,Destination,Status,Amount (USD),Sent By,Approved By\n';
      quotations.forEach(q => {
        // Properly escape CSV values
        const escapeCSV = (value: string | null | undefined) => {
          if (!value) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        };
        
        const date = new Date(q.createdAt).toLocaleDateString();
        const client = escapeCSV(q.clientName);
        const destination = escapeCSV(q.destination);
        const status = escapeCSV(q.status);
        const amount = q.clientQuote || 0;
        const sentBy = escapeCSV(q.quoteSentBy);
        const approvedBy = escapeCSV(q.approvedBy || 'N/A');
        
        csvContent += `${date},${client},${destination},${status},${amount},${sentBy},${approvedBy}\n`;
      });
    } else {
      filename = `report-${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Date,Type,Client,Amount (USD),Status\n';
      filteredData.forEach(item => {
        const escapeCSV = (value: string | null | undefined) => {
          if (!value) return '';
          const stringValue = String(value).replace(/"/g, '""');
          return `"${stringValue}"`;
        };
        
        const isQuotation = 'clientQuote' in item;
        const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
        const date = new Date(item.createdAt).toLocaleDateString();
        const type = escapeCSV(isQuotation ? 'Quotation' : 'Invoice');
        const client = escapeCSV(item.clientName);
        const status = escapeCSV(item.status);
        
        csvContent += `${date},${type},${client},${amount || 0},${status}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully exported ${reportType === 'quotations' ? quotations.length : filteredData.length} records to CSV`);
    }
  } catch (error) {
    console.error('Error exporting CSV:', error);
    showPersistentToast({
      title: 'CSV Export Failed',
      description: 'Failed to export data. Please try again.',
      variant: 'error',
      category: 'Export',
      persistent: false
    });
  }
};

// Enhanced CSV export for generic data arrays
// Professional PDF generation with advanced formatting
export const generatePDFReport = async (
  filteredData: (Quotation | InvoiceData)[],
  summary: any,
  dateRange: { from: string; to: string },
  reportType: string,
  user: User,
  reportData?: any
) => {
  try {
    console.log('Starting PDF generation...', { 
      dataCount: filteredData.length, 
      summary, 
      dateRange, 
      reportType 
    });

    // Create a temporary container for the report content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '40px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(tempContainer);

    const currentDate = new Date().toLocaleDateString();
    const reportTitle = `${user.role === 'partner' ? 'Partner Analytics' : 'Sales Director'} Report - ${currentDate}`;
    
    tempContainer.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #6366f1;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 28px; font-weight: bold; color: #6366f1;">
            📊 AWC Logistics
          </div>
          <div style="text-align: right;">
            <h1 style="font-size: 24px; margin-bottom: 8px; color: #1f2937;">${reportTitle}</h1>
            <p style="color: #6b7280; margin: 4px 0;"><strong>Generated:</strong> ${currentDate}</p>
            <p style="color: #6b7280; margin: 4px 0;"><strong>By:</strong> ${user.name} (${user.role.replace('_', ' ').toUpperCase()})</p>
            <p style="color: #6b7280; margin: 4px 0;"><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6366f1;">
        <h3 style="margin-bottom: 10px; color: #1f2937; font-size: 16px;">📋 Report Filters Applied</h3>
        <p><strong>Date Range:</strong> ${dateRange.from || 'All time'} to ${dateRange.to || 'Present'}</p>
        <p><strong>Report Type:</strong> ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}</p>
        <p><strong>Total Records:</strong> ${filteredData.length} items</p>
      </div>
      
      <div style="margin: 30px 0;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">📊 Executive Summary</h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 25px 0;">
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Total Revenue</div>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px; color: #10b981;">$${summary.totalRevenue.toLocaleString()}</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Total Profit</div>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px; color: #3b82f6;">$${summary.totalProfit.toLocaleString()}</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Total Loss</div>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px; color: #ef4444;">$${summary.totalLoss.toLocaleString()}</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; text-align: center; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px; font-weight: 500;">Win Rate</div>
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 4px; color: #f97316;">${summary.winRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">📈 Recent Activity Data</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Date</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Type</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Client</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Amount</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.slice(0, 25).map(item => {
              const isQuotation = 'clientQuote' in item;
              const amount = isQuotation ? (item as Quotation).clientQuote : (item as InvoiceData).totalAmount;
              const statusColor = item.status === 'won' || item.status === 'paid' ? '#166534' : 
                                item.status === 'pending' ? '#92400e' : '#991b1b';
              const statusBg = item.status === 'won' || item.status === 'paid' ? '#dcfce7' : 
                             item.status === 'pending' ? '#fef3c7' : '#fee2e2';
              return `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">${new Date(item.createdAt).toLocaleDateString()}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">${isQuotation ? 'Quotation' : 'Invoice'}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">${item.clientName || 'N/A'}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">$${amount ? amount.toLocaleString() : '0'}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">
                    <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: ${statusBg}; color: ${statusColor};">
                      ${item.status}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      ${reportData ? `
      <div style="margin: 30px 0;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb;">🎯 Top Clients Analytics</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white;">
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Client</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Revenue</th>
              <th style="border: 1px solid #e5e7eb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 14px;">Quotations</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topClients.slice(0, 10).map((client: any) => `
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">${client.name}</td>
                <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">$${client.revenue.toLocaleString()}</td>
                <td style="border: 1px solid #e5e7eb; padding: 12px 16px; font-size: 13px;">${client.quotations}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px;">
        <p>© ${new Date().getFullYear()} AWC Logistics Management System</p>
        <p>This report was generated on ${new Date().toLocaleString()} by ${user.name}</p>
        <p style="margin-top: 10px; font-weight: bold;">📄 Report contains ${filteredData.length} records</p>
      </div>
    `;

    // Generate PDF using html2canvas and jsPDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempContainer.scrollHeight
    });

    // Clean up the temporary container
    document.body.removeChild(tempContainer);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Generate filename
    const filename = `${reportType}-report-${user.role}-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the PDF
    pdf.save(filename);
    
    console.log('PDF generation completed successfully');
    return { success: true, filename };
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report. Please try again.');
  }
};

export const generateGenericCSVExport = (
  data: any[],
  columns: string[],
  filename: string
) => {
  if (!data.length) {
    showPersistentToast({
      title: 'No Data',
      description: 'No data to export',
      variant: 'warning',
      category: 'Export',
      persistent: false
    });
    return;
  }
  
  try {
    // Properly escape CSV values
    const escapeCSV = (value: any) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    };
    
    // Create CSV headers
    let csvContent = columns.join(',') + '\n';
    
    // Add data rows with proper escaping
    data.forEach(row => {
      const values = columns.map(col => {
        const value = row[col];
        return escapeCSV(value);
      });
      csvContent += values.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log(`Successfully exported ${data.length} records to ${filename}.csv`);
    }
  } catch (error) {
    console.error('Error exporting generic CSV:', error);
    showPersistentToast({
      title: 'CSV Export Failed',
      description: 'Failed to export data. Please try again.',
      variant: 'error',
      category: 'Export',
      persistent: false
    });
  }
};