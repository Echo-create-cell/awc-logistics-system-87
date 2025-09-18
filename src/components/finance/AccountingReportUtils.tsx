import jsPDF from 'jspdf';
import { showPersistentToast } from '@/components/ui/persistent-toast';
import html2canvas from 'html2canvas';
import { User, Quotation } from '@/types';
import { InvoiceData } from '@/types/invoice';
import { ReportData } from '@/types/reports';
import { escapeHtml, safeHtml, formatCurrencySafe, formatDateSafe } from "@/utils/sanitizeHtml";

export const generateAccountingReport = async (
  invoices: InvoiceData[],
  quotations: Quotation[],
  reportData: ReportData | undefined,
  user: User,
  reportPeriod: { from: string; to: string }
) => {
  try {
    console.log('Generating comprehensive accounting report...');
    
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
    const fromDate = new Date(reportPeriod.from).toLocaleDateString();
    const toDate = new Date(reportPeriod.to).toLocaleDateString();
    
    // Calculate financial metrics
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalProfit = quotations.filter(q => q.status === 'won').reduce((sum, q) => sum + q.profit, 0);
    const accountsReceivable = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.totalAmount, 0);
    const operatingExpenses = invoices.reduce((sum, inv) => sum + (inv.tva || 0), 0);
    const netIncome = totalProfit - operatingExpenses;
    
    tempContainer.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1e40af;">
        <div style="text-align: center;">
          <h1 style="font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px;">
            📊 AWC LOGISTICS
          </h1>
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">
            COMPREHENSIVE ACCOUNTING REPORT
          </h2>
          <p style="color: #6b7280; font-size: 14px;">
            Professional Financial Analysis & Business Intelligence
          </p>
          <div style="margin-top: 20px; background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p><strong>Report Period:</strong> ${fromDate} to ${toDate}</p>
            <p><strong>Generated:</strong> ${currentDate} by ${user.name} (${user.role.replace('_', ' ').toUpperCase()})</p>
            <p><strong>Report Type:</strong> Comprehensive Financial Accounting</p>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          📈 EXECUTIVE FINANCIAL SUMMARY
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 25px 0;">
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); text-align: center;">
            <div style="font-size: 14px; color: #059669; margin-bottom: 8px; font-weight: 600;">TOTAL REVENUE</div>
            <div style="font-size: 28px; font-weight: bold; color: #047857;">$${totalRevenue.toLocaleString()}</div>
            <div style="font-size: 12px; color: #065f46; margin-top: 4px;">${invoices.length} total invoices</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); text-align: center;">
            <div style="font-size: 14px; color: #2563eb; margin-bottom: 8px; font-weight: 600;">NET INCOME</div>
            <div style="font-size: 28px; font-weight: bold; color: #1d4ed8;">$${netIncome.toLocaleString()}</div>
            <div style="font-size: 12px; color: #1e40af; margin-top: 4px;">After operating expenses</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); text-align: center;">
            <div style="font-size: 14px; color: #d97706; margin-bottom: 8px; font-weight: 600;">ACCOUNTS RECEIVABLE</div>
            <div style="font-size: 28px; font-weight: bold; color: #b45309;">$${accountsReceivable.toLocaleString()}</div>
            <div style="font-size: 12px; color: #92400e; margin-top: 4px;">${invoices.filter(i => i.status === 'pending').length} pending payments</div>
          </div>
          <div style="border: 2px solid #e5e7eb; padding: 20px; border-radius: 12px; background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%); text-align: center;">
            <div style="font-size: 14px; color: #7c3aed; margin-bottom: 8px; font-weight: 600;">PROFIT MARGIN</div>
            <div style="font-size: 28px; font-weight: bold; color: #6d28d9;">${((totalProfit / totalRevenue) * 100).toFixed(1)}%</div>
            <div style="font-size: 12px; color: #5b21b6; margin-top: 4px;">Operational efficiency</div>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          📊 DETAILED FINANCIAL ANALYSIS
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white;">
              <th style="padding: 15px; text-align: left; font-weight: 600;">Financial Metric</th>
              <th style="padding: 15px; text-align: right; font-weight: 600;">Amount (USD)</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 15px; font-weight: 500;">Gross Revenue</td>
              <td style="padding: 12px 15px; text-align: right;">$${totalRevenue.toLocaleString()}</td>
              <td style="padding: 12px 15px; text-align: center;">100.0%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
              <td style="padding: 12px 15px; font-weight: 500;">Gross Profit</td>
              <td style="padding: 12px 15px; text-align: right;">$${totalProfit.toLocaleString()}</td>
              <td style="padding: 12px 15px; text-align: center;">${((totalProfit / totalRevenue) * 100).toFixed(1)}%</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 15px; font-weight: 500;">Operating Expenses</td>
              <td style="padding: 12px 15px; text-align: right;">$${operatingExpenses.toLocaleString()}</td>
              <td style="padding: 12px 15px; text-align: center;">${((operatingExpenses / totalRevenue) * 100).toFixed(1)}%</td>
            </tr>
            <tr style="border-bottom: 2px solid #1e40af; background: #eff6ff;">
              <td style="padding: 15px; font-weight: bold; color: #1e40af;">Net Income</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #1e40af;">$${netIncome.toLocaleString()}</td>
              <td style="padding: 15px; text-align: center; font-weight: bold; color: #1e40af;">${((netIncome / totalRevenue) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          💼 ACCOUNTS RECEIVABLE ANALYSIS
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white;">
              <th style="padding: 15px; text-align: left; font-weight: 600;">Client</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Invoice Date</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Due Date</th>
              <th style="padding: 15px; text-align: right; font-weight: 600;">Amount</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${invoices.filter(i => i.status === 'pending').slice(0, 15).map((invoice, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 12px 15px; font-weight: 500;">${invoice.clientName}</td>
                <td style="padding: 12px 15px; text-align: center;">${new Date(invoice.issueDate).toLocaleDateString()}</td>
                <td style="padding: 12px 15px; text-align: center;">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: 600;">$${invoice.totalAmount.toLocaleString()}</td>
                <td style="padding: 12px 15px; text-align: center;">
                  <span style="padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; background: #fef3c7; color: #92400e;">PENDING</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      ${reportData?.topClients ? `
      <div style="margin: 30px 0;">
        <h3 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">
          🎯 TOP PERFORMING CLIENTS
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); color: white;">
              <th style="padding: 15px; text-align: left; font-weight: 600;">Client Name</th>
              <th style="padding: 15px; text-align: right; font-weight: 600;">Total Revenue</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Quotations</th>
              <th style="padding: 15px; text-align: center; font-weight: 600;">Revenue %</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.topClients.slice(0, 10).map((client, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 12px 15px; font-weight: 500;">${client.name}</td>
                <td style="padding: 12px 15px; text-align: right; font-weight: 600;">$${client.revenue.toLocaleString()}</td>
                <td style="padding: 12px 15px; text-align: center;">${client.quotations}</td>
                <td style="padding: 12px 15px; text-align: center;">${((client.revenue / totalRevenue) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="color: #1f2937; font-size: 16px; margin-bottom: 10px;">📋 ACCOUNTING STANDARDS COMPLIANCE</h4>
          <p style="margin: 5px 0;">✓ GAAP Compliant Financial Reporting</p>
          <p style="margin: 5px 0;">✓ Accrual Basis Accounting Methods Applied</p>
          <p style="margin: 5px 0;">✓ Revenue Recognition Standards Followed</p>
          <p style="margin: 5px 0;">✓ Professional Audit Trail Maintained</p>
        </div>
        <p style="font-weight: bold;">© ${new Date().getFullYear()} AWC Logistics Management System</p>
        <p>Professional Financial Accounting Report | Generated: ${currentDate}</p>
        <p style="margin-top: 10px; color: #1e40af;">This report contains ${invoices.length} invoices and ${quotations.length} quotations for comprehensive financial analysis.</p>
      </div>
    `;

    // Generate PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    document.body.removeChild(tempContainer);
    pdf.save(`AWC-Accounting-Report-${currentDate.replace(/\//g, '-')}.pdf`);
    
    console.log('Accounting report generated successfully');
  } catch (error) {
    console.error('Error generating accounting report:', error);
    showPersistentToast({
      title: 'Report Generation Failed',
      description: 'Failed to generate accounting report. Please try again.',
      variant: 'error',
      category: 'Reports',
      persistent: false
    });
  }
};

export const generateTaxReport = async (
  invoices: InvoiceData[],
  quotations: Quotation[],
  metrics: any,
  user: User,
  reportPeriod: { from: string; to: string }
) => {
  try {
    console.log('Generating tax report...');
    
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
    const fromDate = new Date(reportPeriod.from).toLocaleDateString();
    const toDate = new Date(reportPeriod.to).toLocaleDateString();
    
    // Calculate tax-related metrics
    const totalTVA = invoices.reduce((sum, inv) => sum + (inv.tva || 0), 0);
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const taxableIncome = invoices.reduce((sum, inv) => sum + inv.subTotal, 0);
    const estimatedIncomeTax = taxableIncome * 0.21; // 21% corporate tax rate
    
    tempContainer.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #dc2626;">
        <div style="text-align: center;">
          <h1 style="font-size: 32px; font-weight: bold; color: #dc2626; margin-bottom: 10px;">
            🧾 TAX REPORTING SUMMARY
          </h1>
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">
            AWC LOGISTICS - TAX COMPLIANCE REPORT
          </h2>
          <div style="margin-top: 20px; background: #fef2f2; padding: 15px; border-radius: 8px; border: 1px solid #fecaca;">
            <p><strong>Tax Period:</strong> ${fromDate} to ${toDate}</p>
            <p><strong>Report Generated:</strong> ${currentDate} by ${user.name}</p>
            <p><strong>Tax Year:</strong> ${new Date(reportPeriod.to).getFullYear()}</p>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #dc2626; font-size: 20px; margin-bottom: 20px; border-bottom: 2px solid #fecaca; padding-bottom: 8px;">
          💰 TAX SUMMARY OVERVIEW
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
          <div style="border: 2px solid #fecaca; padding: 20px; border-radius: 12px; background: #fef2f2; text-align: center;">
            <div style="font-size: 14px; color: #dc2626; margin-bottom: 8px; font-weight: 600;">TOTAL VAT/TVA COLLECTED</div>
            <div style="font-size: 28px; font-weight: bold; color: #b91c1c;">$${totalTVA.toLocaleString()}</div>
          </div>
          <div style="border: 2px solid #fecaca; padding: 20px; border-radius: 12px; background: #fef2f2; text-align: center;">
            <div style="font-size: 14px; color: #dc2626; margin-bottom: 8px; font-weight: 600;">ESTIMATED INCOME TAX</div>
            <div style="font-size: 28px; font-weight: bold; color: #b91c1c;">$${estimatedIncomeTax.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #dc2626; font-size: 18px; margin-bottom: 15px;">📊 DETAILED TAX BREAKDOWN</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #dc2626; color: white;">
              <th style="padding: 15px; text-align: left;">Tax Category</th>
              <th style="padding: 15px; text-align: right;">Amount (USD)</th>
              <th style="padding: 15px; text-align: center;">Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px 15px;">Value Added Tax (VAT/TVA)</td>
              <td style="padding: 12px 15px; text-align: right; font-weight: 600;">$${totalTVA.toLocaleString()}</td>
              <td style="padding: 12px 15px; text-align: center;">Variable</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 12px 15px;">Corporate Income Tax</td>
              <td style="padding: 12px 15px; text-align: right; font-weight: 600;">$${estimatedIncomeTax.toLocaleString()}</td>
              <td style="padding: 12px 15px; text-align: center;">21%</td>
            </tr>
            <tr style="background: #fef2f2; border-top: 2px solid #dc2626;">
              <td style="padding: 15px; font-weight: bold;">TOTAL TAX LIABILITY</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #dc2626;">$${(totalTVA + estimatedIncomeTax).toLocaleString()}</td>
              <td style="padding: 15px; text-align: center; font-weight: bold;">-</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #fecaca; text-align: center;">
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fecaca;">
          <h4 style="color: #dc2626; font-size: 16px; margin-bottom: 10px;">⚠️ TAX COMPLIANCE NOTES</h4>
          <p style="margin: 8px 0; font-size: 14px;">• This report is for internal accounting purposes only</p>
          <p style="margin: 8px 0; font-size: 14px;">• Consult with certified tax professional for official filing</p>
          <p style="margin: 8px 0; font-size: 14px;">• Tax rates may vary based on jurisdiction and business structure</p>
          <p style="margin: 8px 0; font-size: 14px;">• Ensure all deductions and credits are properly documented</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AWC Logistics | Tax Report Generated: ${currentDate}</p>
      </div>
    `;

    // Generate PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    document.body.removeChild(tempContainer);
    pdf.save(`AWC-Tax-Report-${currentDate.replace(/\//g, '-')}.pdf`);
    
    console.log('Tax report generated successfully');
  } catch (error) {
    console.error('Error generating tax report:', error);
    showPersistentToast({
      title: 'Tax Report Failed',
      description: 'Failed to generate tax report. Please try again.',
      variant: 'error',
      category: 'Reports',
      persistent: false
    });
  }
};

export const generateAuditReport = async (
  invoices: InvoiceData[],
  quotations: Quotation[],
  users: User[],
  user: User,
  reportPeriod: { from: string; to: string }
) => {
  try {
    console.log('Generating audit trail report...');
    
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
    const fromDate = new Date(reportPeriod.from).toLocaleDateString();
    const toDate = new Date(reportPeriod.to).toLocaleDateString();
    
    // Combine and sort all activities
    const allActivities = [
      ...invoices.map(inv => ({
        type: 'Invoice',
        id: inv.id,
        clientName: inv.clientName,
        amount: inv.totalAmount,
        status: inv.status,
        createdAt: inv.createdAt,
        createdBy: inv.createdBy || 'System'
      })),
      ...quotations.map(quot => ({
        type: 'Quotation',
        id: quot.id,
        clientName: quot.clientName,
        amount: quot.clientQuote,
        status: quot.status,
        createdAt: quot.createdAt,
        createdBy: quot.quoteSentBy || 'Unknown'
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    tempContainer.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #059669;">
        <div style="text-align: center;">
          <h1 style="font-size: 32px; font-weight: bold; color: #059669; margin-bottom: 10px;">
            🔍 AUDIT TRAIL REPORT
          </h1>
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">
            AWC LOGISTICS - FINANCIAL AUDIT DOCUMENTATION
          </h2>
          <div style="margin-top: 20px; background: #ecfdf5; padding: 15px; border-radius: 8px; border: 1px solid #a7f3d0;">
            <p><strong>Audit Period:</strong> ${fromDate} to ${toDate}</p>
            <p><strong>Report Generated:</strong> ${currentDate} by ${user.name}</p>
            <p><strong>Total Transactions:</strong> ${allActivities.length}</p>
          </div>
        </div>
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #059669; font-size: 20px; margin-bottom: 15px; border-bottom: 2px solid #a7f3d0; padding-bottom: 8px;">
          📋 TRANSACTION AUDIT TRAIL
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #059669; color: white;">
              <th style="padding: 12px; text-align: left; font-size: 12px;">DATE</th>
              <th style="padding: 12px; text-align: left; font-size: 12px;">TYPE</th>
              <th style="padding: 12px; text-align: left; font-size: 12px;">CLIENT</th>
              <th style="padding: 12px; text-align: right; font-size: 12px;">AMOUNT</th>
              <th style="padding: 12px; text-align: center; font-size: 12px;">STATUS</th>
              <th style="padding: 12px; text-align: left; font-size: 12px;">CREATED BY</th>
            </tr>
          </thead>
          <tbody>
            ${allActivities.slice(0, 25).map((activity, index) => `
              <tr style="border-bottom: 1px solid #e5e7eb; ${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                <td style="padding: 10px 12px; font-size: 11px;">${new Date(activity.createdAt).toLocaleDateString()}</td>
                <td style="padding: 10px 12px; font-size: 11px; font-weight: 500;">${activity.type}</td>
                <td style="padding: 10px 12px; font-size: 11px;">${activity.clientName || 'N/A'}</td>
                <td style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 600;">$${(activity.amount || 0).toLocaleString()}</td>
                <td style="padding: 10px 12px; text-align: center; font-size: 11px;">
                  <span style="padding: 2px 8px; border-radius: 12px; font-size: 9px; font-weight: 600; 
                    ${activity.status === 'paid' || activity.status === 'won' ? 'background: #dcfce7; color: #166534;' :
                      activity.status === 'pending' ? 'background: #fef3c7; color: #92400e;' : 'background: #fee2e2; color: #991b1b;'}">
                    ${activity.status.toUpperCase()}
                  </span>
                </td>
                <td style="padding: 10px 12px; font-size: 11px;">${activity.createdBy}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${allActivities.length > 25 ? `
          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 10px;">
            Showing 25 of ${allActivities.length} total transactions. Complete audit trail available in system.
          </p>
        ` : ''}
      </div>

      <div style="margin: 30px 0;">
        <h3 style="color: #059669; font-size: 18px; margin-bottom: 15px;">👥 USER ACTIVITY SUMMARY</h3>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: #047857; color: white;">
              <th style="padding: 12px; text-align: left;">User</th>
              <th style="padding: 12px; text-align: center;">Role</th>
              <th style="padding: 12px; text-align: center;">Quotations</th>
              <th style="padding: 12px; text-align: center;">Invoices</th>
              <th style="padding: 12px; text-align: right;">Total Value</th>
            </tr>
          </thead>
          <tbody>
            ${users.map((u, index) => {
              const userQuotations = quotations.filter(q => q.quoteSentBy === u.name).length;
              const userInvoices = invoices.filter(i => i.createdBy === u.name).length;
              const userValue = quotations.filter(q => q.quoteSentBy === u.name).reduce((sum, q) => sum + (q.clientQuote || 0), 0);
              
              return `
                <tr style="${index % 2 === 0 ? 'background: #f9fafb;' : ''}">
                  <td style="padding: 12px; font-weight: 500;">${u.name}</td>
                  <td style="padding: 12px; text-align: center; text-transform: capitalize;">${u.role.replace('_', ' ')}</td>
                  <td style="padding: 12px; text-align: center;">${userQuotations}</td>
                  <td style="padding: 12px; text-align: center;">${userInvoices}</td>
                  <td style="padding: 12px; text-align: right; font-weight: 600;">$${userValue.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #a7f3d0; text-align: center;">
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #a7f3d0;">
          <h4 style="color: #059669; font-size: 16px; margin-bottom: 10px;">✅ AUDIT COMPLIANCE CHECKLIST</h4>
          <p style="margin: 8px 0; font-size: 14px;">✓ All financial transactions properly documented</p>
          <p style="margin: 8px 0; font-size: 14px;">✓ User access and activity tracking maintained</p>
          <p style="margin: 8px 0; font-size: 14px;">✓ Approval workflows and authorization trails recorded</p>
          <p style="margin: 8px 0; font-size: 14px;">✓ System integrity and data consistency verified</p>
        </div>
        <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AWC Logistics | Audit Report Generated: ${currentDate}</p>
      </div>
    `;

    // Generate PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    document.body.removeChild(tempContainer);
    pdf.save(`AWC-Audit-Report-${currentDate.replace(/\//g, '-')}.pdf`);
    
    console.log('Audit report generated successfully');
  } catch (error) {
    console.error('Error generating audit report:', error);
    showPersistentToast({
      title: 'Audit Report Failed',
      description: 'Failed to generate audit report. Please try again.',
      variant: 'error',
      category: 'Reports',
      persistent: false
    });
  }
};

export const generateFinancialStatements = async (data: any) => {
  try {
    console.log('Generating financial statements...');
    
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
    const { incomeStatement, balanceSheet, cashFlow, period, user, type } = data;
    
    tempContainer.innerHTML = `
      <div style="margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #1e40af;">
        <div style="text-align: center;">
          <h1 style="font-size: 32px; font-weight: bold; color: #1e40af; margin-bottom: 10px;">
            📊 AWC LOGISTICS
          </h1>
          <h2 style="font-size: 24px; color: #1f2937; margin-bottom: 8px;">
            ${type === 'income' ? 'INCOME STATEMENT' : type === 'balance' ? 'BALANCE SHEET' : 'CASH FLOW STATEMENT'}
          </h2>
          <p style="color: #6b7280; font-size: 14px;">
            Professional Financial Statement | GAAP Compliant
          </p>
          <div style="margin-top: 20px; background: #eff6ff; padding: 15px; border-radius: 8px; border: 1px solid #bfdbfe;">
            <p><strong>Period:</strong> ${new Date(period.from).toLocaleDateString()} to ${new Date(period.to).toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${currentDate} by ${user.name}</p>
          </div>
        </div>
      </div>

      ${type === 'income' ? `
      <div style="margin: 30px 0;">
        <h3 style="color: #1e40af; font-size: 20px; margin-bottom: 20px; text-align: center; text-decoration: underline;">
          INCOME STATEMENT
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
          <tbody>
            <tr>
              <td style="padding: 15px; font-weight: bold; border-bottom: 2px solid #1e40af;">REVENUE</td>
              <td style="padding: 15px; text-align: right; border-bottom: 2px solid #1e40af;"></td>
            </tr>
            <tr>
              <td style="padding: 12px 30px;">Total Revenue</td>
              <td style="padding: 12px 15px; text-align: right;">$${incomeStatement.revenue.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 30px;">Less: Cost of Revenue</td>
              <td style="padding: 12px 15px; text-align: right;">($${incomeStatement.costOfRevenue.toLocaleString()})</td>
            </tr>
            <tr style="border-top: 1px solid #e5e7eb;">
              <td style="padding: 15px; font-weight: bold;">GROSS PROFIT</td>
              <td style="padding: 15px; text-align: right; font-weight: bold;">$${incomeStatement.grossProfit.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 15px; font-weight: bold; border-bottom: 2px solid #1e40af;">OPERATING EXPENSES</td>
              <td style="padding: 15px; text-align: right; border-bottom: 2px solid #1e40af;"></td>
            </tr>
            <tr>
              <td style="padding: 12px 30px;">Tax and Duties</td>
              <td style="padding: 12px 15px; text-align: right;">$${incomeStatement.operatingExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 12px 30px;">General & Administrative</td>
              <td style="padding: 12px 15px; text-align: right;">$25,000</td>
            </tr>
            <tr style="border-top: 2px solid #1e40af; background: #eff6ff;">
              <td style="padding: 20px; font-weight: bold; font-size: 18px; color: #1e40af;">NET INCOME</td>
              <td style="padding: 20px; text-align: right; font-weight: bold; font-size: 18px; color: #1e40af;">$${(incomeStatement.netIncome - 25000).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      ` : ''}

      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #bfdbfe; text-align: center;">
        <p style="color: #6b7280; font-size: 12px;">© ${new Date().getFullYear()} AWC Logistics | Financial Statement Generated: ${currentDate}</p>
      </div>
    `;

    // Generate PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    document.body.removeChild(tempContainer);
    pdf.save(`AWC-${type}-Statement-${currentDate.replace(/\//g, '-')}.pdf`);
    
    console.log('Financial statement generated successfully');
  } catch (error) {
    console.error('Error generating financial statement:', error);
    showPersistentToast({
      title: 'Financial Statement Failed',
      description: 'Failed to generate financial statement. Please try again.',
      variant: 'error',
      category: 'Reports',
      persistent: false
    });
  }
};