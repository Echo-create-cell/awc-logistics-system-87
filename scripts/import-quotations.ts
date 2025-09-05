import { supabase } from '@/integrations/supabase/client';

const quotationsData = [
  { date: '2024-12-18', client: 'AKAGERA AVIATION', freightMode: 'Air Freight', cargo: 'Fire Extinguishers: 3 pieces', requestType: 'Export', countryOrigin: 'Rwanda', destination: 'USA', volume: '2.4KGS', buyRate: 0, clientQuote: 3223, quoteSentBy: 'JOHN NDAYAMABAJE' },
  { date: '2024-12-18', client: 'AKAGERA AVIATION', freightMode: 'Air Freight', cargo: '2 x AIRCRAFT ENGINES', requestType: 'Export', countryOrigin: 'Rwanda', destination: 'USA', volume: '422KGS', buyRate: 0, clientQuote: 4699, quoteSentBy: 'JOHN NDAYAMABAJE' },
  { date: '2024-12-23', client: 'NGALI/ LOCUS DYNAMICS', freightMode: 'Air Freight', cargo: 'DG SHIPMENT WITH BATTERIES', requestType: 'Import', countryOrigin: 'Austria', destination: 'Rwanda', volume: '47.6KGS', buyRate: 0, clientQuote: 1274400, currency: 'RWF', quoteSentBy: 'RONNY TWAHIRWA' },
  { date: '2025-01-16', client: 'ASCNET', freightMode: 'Air Freight', cargo: 'SMART SCREENS', requestType: 'Import', countryOrigin: 'China', destination: 'Senegal', volume: '20FT', buyRate: 0, clientQuote: 7250, quoteSentBy: 'ANDY NUMA' },
  { date: '2025-01-16', client: 'ASCNET', freightMode: 'Sea Freight', cargo: 'SMART SCREENS', requestType: 'Import', countryOrigin: 'China', destination: 'Senegal', volume: '20FT', buyRate: 0, clientQuote: 8690, quoteSentBy: 'ANDY NUMA' },
  { date: '2025-01-16', client: 'ASCNET', freightMode: 'Sea Freight', cargo: 'SMART SCREENS', requestType: 'Import', countryOrigin: 'China', destination: 'Rwanda', volume: '200KGS', buyRate: 0, clientQuote: 1275, quoteSentBy: 'ANDY NUMA' },
  { date: '2025-01-17', client: 'MEX LOGISTICS', freightMode: 'Air Freight', cargo: 'GENERAL CARGO', requestType: 'Export', countryOrigin: 'Rwanda', destination: 'Uganda', volume: '38KGS', buyRate: 0, clientQuote: 706, quoteSentBy: 'PATRICK' },
  { date: '2025-01-17', client: 'MEX LOGISTICS', freightMode: 'Air Freight', cargo: 'GENERAL CARGO', requestType: 'Re-Import', countryOrigin: 'Uganda', destination: 'Rwanda', volume: '38KGS', buyRate: 0, clientQuote: 336, quoteSentBy: 'PATRICK' },
  { date: '2025-01-23', client: 'MOSES/SOLEIL', freightMode: 'Road Freight', cargo: 'PALM OIL AND SOYA', requestType: 'Import', countryOrigin: 'Tanzania', destination: 'Rwanda', volume: '300MT', buyRate: 0, clientQuote: 0, quoteSentBy: 'MOSES' },
  { date: '2025-01-23', client: 'YNANI KAMIKAZI', freightMode: 'Road Freight', cargo: '', requestType: 'Import', countryOrigin: 'South Africa', destination: 'Rwanda', volume: '40FT', buyRate: 0, clientQuote: 12477, quoteSentBy: 'YVANI KAMIKKAZI' },
  { date: '2025-01-29', client: 'POWER SYSTEMS', freightMode: 'Air Freight', cargo: '', requestType: 'Import', countryOrigin: 'Turkey', destination: 'Rwanda', volume: '', buyRate: 0, clientQuote: 0, quoteSentBy: 'PATSON MARIME' },
  { date: '2025-02-04', client: 'NGALI/ LOCUS DYNAMICS', freightMode: 'Air Freight', cargo: 'SHIPMENT WITH GENERAL CARGO AND DG', requestType: 'Import', countryOrigin: 'Austria', destination: 'Rwanda', volume: '8.1KGS', buyRate: 0, clientQuote: 2050, currency: 'EUR', quoteSentBy: 'RONNY TWAHIRWA' },
  { date: '2025-02-06', client: 'NGALI/ LOCUS DYNAMICS', freightMode: 'Air Freight', cargo: 'FINNISH BIRCH AND SKU', requestType: 'Import', countryOrigin: 'USA', destination: 'Rwanda', volume: '1.36KGS', buyRate: 0, clientQuote: 2450, quoteSentBy: 'RONNY TWAHIRWA' },
  { date: '2025-02-07', client: 'REMOTE GROUP', freightMode: 'Road Freight', cargo: 'WATER PIPE', requestType: 'Project', countryOrigin: 'Tanzania/Kenya', destination: 'Rwanda', volume: '125 x 40ft CONT', buyRate: 0, clientQuote: 0, quoteSentBy: 'TREVOR' },
  { date: '2025-02-10', client: 'MEX LOGISTICS', freightMode: 'Road Freight', cargo: 'GENERAL CARGO', requestType: 'Local', countryOrigin: 'Tanzania', destination: 'Bukavu', volume: '15 x 40FT CONT', buyRate: 0, clientQuote: 2115, quoteSentBy: 'Herbert Akita' },
  { date: '2025-02-13', client: 'Michel M. TSHIKALA', freightMode: 'Air Freight', cargo: 'TENT KITS, BOXES OF MASKS', requestType: 'Import', countryOrigin: 'Senegal', destination: 'Rwanda', volume: '1131KGS', buyRate: 0, clientQuote: 1708, quoteSentBy: 'Michel M. TSHIKALA' },
  { date: '2025-02-14', client: 'Michel M. TSHIKALA', freightMode: 'Air Freight', cargo: 'HUMANITARIAN', requestType: 'Import', countryOrigin: 'Kinshasa', destination: 'Goma', volume: '500KGS', buyRate: 0, clientQuote: 1708, quoteSentBy: 'Michel M. TSHIKALA' },
  { date: '2025-02-14', client: 'Michel M. TSHIKALA', freightMode: 'Air Freight', cargo: 'HUMANITARIAN', requestType: 'Import', countryOrigin: 'Kinshasa', destination: 'Goma', volume: '29000KGS', buyRate: 0, clientQuote: 4815, quoteSentBy: 'Michel M. TSHIKALA' },
  { date: '2025-02-19', client: 'AEROSPACE', freightMode: 'Air Freight', cargo: 'ENGINE', requestType: 'Export', countryOrigin: 'South Africa', destination: 'USA', volume: '2150KGS', buyRate: 0, clientQuote: 1095, quoteSentBy: 'MARIANGELY REYES' },
  { date: '2025-02-20', client: 'Michel M. TSHIKALA', freightMode: 'Air Freight', cargo: 'Blood', requestType: 'Import', countryOrigin: 'Brussels', destination: 'Goma', volume: '1003KGS', buyRate: 0, clientQuote: 3735, quoteSentBy: 'Alain Delen' },
  { date: '2025-03-03', client: 'Goodwill Air & Sea Logistics', freightMode: 'Air Freight', cargo: 'AC Motor, Screw Pump, Branch pipe, Wrench', requestType: 'Import', countryOrigin: 'India', destination: 'Rwanda', volume: '360KGS', buyRate: 0, clientQuote: 573.08, quoteSentBy: 'Kapil Gupta' },
  { date: '2025-03-04', client: 'GENUINE FREIGHT', freightMode: 'Air Freight', cargo: '8 CREATES OF tv equipment and 6 motobicles', requestType: 'Temporary Import', countryOrigin: 'France', destination: 'Rwanda', volume: '5200KGS', buyRate: 0, clientQuote: 0, quoteSentBy: 'Kennedy' },
  { date: '2025-03-05', client: 'TRANSGLOBAL LOGISTICS', freightMode: '', cargo: 'Wood Furniture', requestType: 'Clearing', countryOrigin: '', destination: 'Rwanda', volume: '20FT', buyRate: 0, clientQuote: 1780, quoteSentBy: 'Yara Fathy' },
  { date: '2025-03-07', client: 'Michel M. TSHIKALA', freightMode: 'Air Freight', cargo: 'PHARMACEUTICALS', requestType: 'Import', countryOrigin: 'Dubai', destination: 'Goma', volume: '233KGS', buyRate: 0, clientQuote: 2315, quoteSentBy: 'Michel M. TSHIKALA' },
  { date: '2025-03-10', client: 'JHL INT\'L TRANSPORTATION', freightMode: 'Air Freight', cargo: 'Tantalum-niobium', requestType: 'Import', countryOrigin: 'China', destination: 'Rwanda', volume: '500KGS', buyRate: 0, clientQuote: 0, quoteSentBy: 'Lee' }
];

const salesDirectorId = 'sales-director-user-id'; // This would be a real user ID
const adminId = 'admin-user-id'; // This would be a real user ID

export async function importQuotations() {
  try {
    console.log('Starting quotation import...');
    
    // Create quotations
    for (let i = 0; i < quotationsData.length; i++) {
      const data = quotationsData[i];
      
      // Convert volume to weight in KG
      let totalVolumeKg = 0;
      if (data.volume.includes('KGS') || data.volume.includes('KG')) {
        totalVolumeKg = parseFloat(data.volume.replace(/[^\d.]/g, '')) || 0;
      } else if (data.volume.includes('MT')) {
        totalVolumeKg = (parseFloat(data.volume.replace(/[^\d.]/g, '')) || 0) * 1000;
      } else if (data.volume.includes('TONS')) {
        totalVolumeKg = (parseFloat(data.volume.replace(/[^\d.]/g, '')) || 0) * 1000;
      } else if (data.volume.includes('FT')) {
        totalVolumeKg = 1000; // Assume 1000kg for container
      }

      const profit = data.clientQuote - data.buyRate;
      const profitPercentage = data.buyRate > 0 ? ((profit / data.buyRate) * 100).toFixed(1) : '0.0';
      
      // Determine status - if there's a client quote > 0, mark as won, otherwise pending
      const status = data.clientQuote > 0 ? 'won' : 'pending';
      const approvedBy = status === 'won' ? 'Admin' : null;
      const approvedAt = status === 'won' ? new Date().toISOString() : null;

      const quotation = {
        client_name: data.client,
        currency: data.currency || 'USD',
        buy_rate: data.buyRate,
        client_quote: data.clientQuote,
        profit: profit,
        profit_percentage: profitPercentage,
        quote_sent_by: data.quoteSentBy,
        status: status,
        follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        remarks: `${data.cargo} - ${data.freightMode}`,
        approved_by: approvedBy,
        approved_at: approvedAt,
        destination: data.destination,
        door_delivery: '',
        freight_mode: data.freightMode === 'Air Freight' ? 'Air Freight' : 
                     data.freightMode === 'Sea Freight' ? 'Sea Freight' : 
                     data.freightMode === 'Road Freight' ? 'Road Freight' : null,
        cargo_description: data.cargo,
        request_type: data.requestType === 'Export' ? 'Export' :
                     data.requestType === 'Import' ? 'Import' :
                     data.requestType === 'Re-Import' ? 'Re-Import' :
                     data.requestType === 'Project' ? 'Project' :
                     data.requestType === 'Local' ? 'Local' : null,
        country_of_origin: data.countryOrigin,
        total_volume_kg: totalVolumeKg,
        created_by: salesDirectorId,
        created_at: data.date + 'T10:00:00Z'
      };

      const { data: insertedQuotation, error: quotationError } = await supabase
        .from('quotations')
        .insert(quotation)
        .select()
        .single();

      if (quotationError) {
        console.error('Error inserting quotation:', quotationError);
        continue;
      }

      console.log(`Created quotation ${i + 1}:`, insertedQuotation.id);

      // Create commodity for this quotation
      if (totalVolumeKg > 0) {
        const { error: commodityError } = await supabase
          .from('quotation_commodities')
          .insert({
            quotation_id: insertedQuotation.id,
            name: data.cargo || 'General Cargo',
            quantity_kg: totalVolumeKg,
            rate: data.buyRate,
            client_rate: data.clientQuote > 0 ? data.clientQuote / totalVolumeKg : 0,
          });

        if (commodityError) {
          console.error('Error inserting commodity:', commodityError);
        }
      }

      // If quotation is won and has a client quote, create an invoice
      if (status === 'won' && data.clientQuote > 0) {
        const invoiceNumber = `INV-${new Date(data.date).getFullYear()}-${String(i + 1).padStart(4, '0')}`;
        
        const invoice = {
          quotation_id: insertedQuotation.id,
          invoice_number: invoiceNumber,
          client_name: data.client,
          client_address: '',
          client_contact_person: '',
          client_tin: '',
          destination: data.destination,
          door_delivery: '',
          salesperson: data.quoteSentBy,
          payment_conditions: 'Net 30 days',
          awb_number: '',
          currency: data.currency || 'USD',
          tva: 0,
          sub_total: data.clientQuote,
          total_amount: data.clientQuote,
          issue_date: data.date,
          due_date: new Date(new Date(data.date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          deliver_date: data.date,
          validity_date: new Date(new Date(data.date).getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          created_by: salesDirectorId,
          created_at: data.date + 'T11:00:00Z'
        };

        const { data: insertedInvoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert(invoice)
          .select()
          .single();

        if (invoiceError) {
          console.error('Error inserting invoice:', invoiceError);
          continue;
        }

        console.log(`Created invoice for quotation ${i + 1}:`, insertedInvoice.id);

        // Create invoice item
        const { error: itemError } = await supabase
          .from('invoice_items')
          .insert({
            invoice_id: insertedInvoice.id,
            commodity: data.cargo || 'General Cargo',
            quantity_kg: totalVolumeKg,
            total: data.clientQuote
          });

        if (itemError) {
          console.error('Error inserting invoice item:', itemError);
        }
      }
    }

    console.log('Quotation import completed successfully!');
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import
importQuotations();