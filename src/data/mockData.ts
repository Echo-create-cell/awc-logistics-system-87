
import { Quotation, User, Invoice } from '@/types';
import { InvoiceData } from '@/types/invoice';

export const mockQuotations: Quotation[] = [
  {
    id: '1',
    clientName: 'Michel-TLC',
    volume: JSON.stringify([{name: 'Surgical Equipment', quantityKg: 849.8}]),
    buyRate: 1800,
    currency: '$',
    clientQuote: 2395.00,
    profit: 595.00,
    profitPercentage: '24.8',
    quoteSentBy: 'I. Arnold',
    status: 'won',
    followUpDate: '2025-03-17',
    remarks: 'Transit Bond - Delivered successfully',
    createdAt: '2025-03-17T00:00:00.000Z',
    freightMode: 'Air Freight',
    cargoDescription: 'Surgical Equipment - Medical Supplies',
    requestType: 'Import',
    countryOfOrigin: 'GERMANY',
    destination: 'GOMA-DRC',
    totalVolumeKg: 849.8
  },
  {
    id: '2',
    clientName: 'Kigali Medical Center',
    volume: JSON.stringify([{name: 'Medical Devices', quantityKg: 245.5}]),
    buyRate: 2200,
    currency: '$',
    clientQuote: 2850.00,
    profit: 650.00,
    profitPercentage: '22.8',
    quoteSentBy: 'I. Arnold',
    status: 'pending',
    followUpDate: '2025-04-15',
    remarks: 'Awaiting customs clearance',
    createdAt: '2025-04-10T00:00:00.000Z',
    freightMode: 'Air Freight',
    cargoDescription: 'Medical Imaging Equipment',
    requestType: 'Import',
    countryOfOrigin: 'NETHERLANDS',
    destination: 'KIGALI',
    totalVolumeKg: 245.5
  },
  {
    id: '3',
    clientName: 'Rwanda Mining Corp',
    volume: JSON.stringify([{name: 'Mining Equipment', quantityKg: 1250.0}]),
    buyRate: 3500,
    currency: '$',
    clientQuote: 4200.00,
    profit: 700.00,
    profitPercentage: '16.7',
    quoteSentBy: 'Sarah Mutesi',
    status: 'won',
    followUpDate: '2025-04-20',
    remarks: 'Large shipment - special handling required',
    createdAt: '2025-04-12T00:00:00.000Z',
    freightMode: 'Sea Freight',
    cargoDescription: 'Heavy Mining Machinery',
    requestType: 'Import',
    countryOfOrigin: 'SOUTH AFRICA',
    destination: 'KIGALI',
    totalVolumeKg: 1250.0
  },
  {
    id: '4',
    clientName: 'East Africa Logistics',
    volume: JSON.stringify([{name: 'General Cargo', quantityKg: 680.2}]),
    buyRate: 1200,
    currency: '$',
    clientQuote: 1650.00,
    profit: 450.00,
    profitPercentage: '27.3',
    quoteSentBy: 'James Uwimana',
    status: 'won',
    followUpDate: '2025-04-18',
    remarks: 'Regular client - priority handling',
    createdAt: '2025-04-14T00:00:00.000Z',
    freightMode: 'Road Freight',
    cargoDescription: 'Mixed Commercial Goods',
    requestType: 'Export',
    countryOfOrigin: 'RWANDA',
    destination: 'NAIROBI',
    totalVolumeKg: 680.2
  },
  {
    id: '5',
    clientName: 'Goma Trade Solutions',
    volume: JSON.stringify([{name: 'Electronics', quantityKg: 156.7}]),
    buyRate: 890,
    currency: '$',
    clientQuote: 1250.00,
    profit: 360.00,
    profitPercentage: '28.8',
    quoteSentBy: 'Michel Tshikala',
    status: 'pending',
    followUpDate: '2025-04-25',
    remarks: 'Cross-border documentation in progress',
    createdAt: '2025-04-16T00:00:00.000Z',
    freightMode: 'Air Freight',
    cargoDescription: 'Consumer Electronics',
    requestType: 'Import',
    countryOfOrigin: 'DUBAI',
    destination: 'GOMA-DRC',
    totalVolumeKg: 156.7
  },
  {
    id: '6',
    clientName: 'Burundi Agricultural Co',
    volume: JSON.stringify([{name: 'Agricultural Equipment', quantityKg: 890.5}]),
    buyRate: 2100,
    currency: '$',
    clientQuote: 2750.00,
    profit: 650.00,
    profitPercentage: '23.6',
    quoteSentBy: 'Patrick Nzeyimana',
    status: 'lost',
    followUpDate: '2025-04-22',
    remarks: 'Client chose local competitor',
    createdAt: '2025-04-18T00:00:00.000Z',
    freightMode: 'Road Freight',
    cargoDescription: 'Farm Machinery Parts',
    requestType: 'Export',
    countryOfOrigin: 'RWANDA',
    destination: 'BUJUMBURA',
    totalVolumeKg: 890.5
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'System Administrator',
    email: 'admin@awclogistics.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'I. Arnold',
    email: 'arnold@awclogistics.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Sarah Mutesi',
    email: 'sarah@awclogistics.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-15T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Finance Controller',
    email: 'finance@awclogistics.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Michel Tshikala',
    email: 'michel@awclogistics.com',
    role: 'partner',
    status: 'active',
    createdAt: '2024-03-10T00:00:00.000Z'
  },
  {
    id: '6',
    name: 'James Uwimana',
    email: 'james@awclogistics.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-15T00:00:00.000Z'
  },
  {
    id: '7',
    name: 'Patrick Nzeyimana',
    email: 'patrick@awclogistics.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-20T00:00:00.000Z'
  }
];

export const mockInvoices: InvoiceData[] = [
  {
    id: 'INV-001',
    quotationId: '1',
    invoiceNumber: '10015710012',
    clientName: 'Michel-TLC',
    clientAddress: 'Post code, Country: Goma-DRC',
    clientContactPerson: 'Michel',
    clientTin: '',
    destination: 'Goma-DRC',
    doorDelivery: 'Goma ICD',
    salesperson: 'I.Arnold',
    deliverDate: '17/03/2025',
    paymentConditions: 'Transfer at Bank',
    validityDate: '17/03/2025',
    awbNumber: '020-35526223',
    totalAmount: 2395.00,
    subTotal: 2395.00,
    tva: 0,
    currency: '$',
    issueDate: '17/03/2025',
    dueDate: '17/04/2025',
    status: 'paid',
    createdAt: '2025-03-17T00:00:00.000Z',
    createdBy: 'I.Arnold',
    items: [
      {
        id: '1',
        quantityKg: 849.8,
        commodity: 'SURGICAL EQUIP',
        charges: [
          { id: '1', description: 'Transit Bond', rate: 200.00 },
          { id: '2', description: 'Transit Customs Brokerage/Documentation', rate: 150.00 },
          { id: '3', description: 'Customs warehouse charges', rate: 200.00 },
          { id: '4', description: 'Airline Split Fee', rate: 65.00 },
          { id: '5', description: 'Transportation/Closed body', rate: 1480.00 },
          { id: '6', description: 'Truck parking fee/Clearance RW side', rate: 300.00 }
        ],
        total: 2395.00
      }
    ]
  },
  {
    id: 'INV-002',
    quotationId: '2',
    invoiceNumber: '10015710013',
    clientName: 'Kigali Medical Center',
    clientAddress: 'KN 12 Ave, Remera, Kigali, Rwanda',
    clientContactPerson: 'Dr. Emmanuel Kayitare',
    clientTin: 'TIN102987654',
    destination: 'Kigali',
    doorDelivery: 'Door to Door',
    salesperson: 'I.Arnold',
    deliverDate: '15/04/2025',
    paymentConditions: 'Net 30 Days',
    validityDate: '15/04/2025',
    awbNumber: '020-35526224',
    totalAmount: 2850.00,
    subTotal: 2850.00,
    tva: 0,
    currency: '$',
    issueDate: '10/04/2025',
    dueDate: '10/05/2025',
    status: 'pending',
    createdAt: '2025-04-10T00:00:00.000Z',
    createdBy: 'I.Arnold',
    items: [
      {
        id: '1',
        quantityKg: 245.5,
        commodity: 'MEDICAL DEVICES',
        charges: [
          { id: '1', description: 'Air Freight Services', rate: 2100.00 },
          { id: '2', description: 'Customs Clearance', rate: 350.00 },
          { id: '3', description: 'Documentation & Handling', rate: 250.00 },
          { id: '4', description: 'Local Transportation', rate: 150.00 }
        ],
        total: 2850.00
      }
    ]
  },
  {
    id: 'INV-003',
    quotationId: '4',
    invoiceNumber: '10015710014',
    clientName: 'East Africa Logistics',
    clientAddress: 'Industrial Zone, Kigali, Rwanda',
    clientContactPerson: 'Mary Uwimana',
    clientTin: 'TIN456123789',
    destination: 'Nairobi',
    doorDelivery: 'Port to Port',
    salesperson: 'James Uwimana',
    deliverDate: '18/04/2025',
    paymentConditions: 'Advance Payment',
    validityDate: '18/04/2025',
    awbNumber: '020-35526225',
    totalAmount: 1650.00,
    subTotal: 1650.00,
    tva: 0,
    currency: '$',
    issueDate: '14/04/2025',
    dueDate: '18/04/2025',
    status: 'paid',
    createdAt: '2025-04-14T00:00:00.000Z',
    createdBy: 'James Uwimana',
    items: [
      {
        id: '1',
        quantityKg: 680.2,
        commodity: 'GENERAL CARGO',
        charges: [
          { id: '1', description: 'Road Freight Services', rate: 1200.00 },
          { id: '2', description: 'Border Documentation', rate: 200.00 },
          { id: '3', description: 'Transit Insurance', rate: 150.00 },
          { id: '4', description: 'Handling Charges', rate: 100.00 }
        ],
        total: 1650.00
      }
    ]
  },
  {
    id: 'INV-004',
    quotationId: '3',
    invoiceNumber: '10015710015',
    clientName: 'Rwanda Mining Corp',
    clientAddress: 'Mining District, Kigali, Rwanda',
    clientContactPerson: 'Engineer Gasana',
    clientTin: 'TIN789456123',
    destination: 'Kigali',
    doorDelivery: 'Site Delivery',
    salesperson: 'Sarah Mutesi',
    deliverDate: '20/04/2025',
    paymentConditions: 'Net 45 Days',
    validityDate: '20/05/2025',
    awbNumber: '020-35526226',
    totalAmount: 4200.00,
    subTotal: 4200.00,
    tva: 0,
    currency: '$',
    issueDate: '12/04/2025',
    dueDate: '27/05/2025',
    status: 'overdue',
    createdAt: '2025-04-12T00:00:00.000Z',
    createdBy: 'Sarah Mutesi',
    items: [
      {
        id: '1',
        quantityKg: 1250.0,
        commodity: 'MINING EQUIPMENT',
        charges: [
          { id: '1', description: 'Sea Freight Services', rate: 3200.00 },
          { id: '2', description: 'Port Handling', rate: 450.00 },
          { id: '3', description: 'Heavy Lift Charges', rate: 350.00 },
          { id: '4', description: 'Inland Transportation', rate: 200.00 }
        ],
        total: 4200.00
      }
    ]
  }
];
