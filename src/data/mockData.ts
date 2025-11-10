
import { Quotation, User, Invoice } from '@/types';
import { InvoiceData } from '@/types/invoice';

export const mockQuotations: Quotation[] = [
  {
    id: '1',
    clientName: 'AKAGERA AVIATION',
    volume: JSON.stringify([{name: 'Fire Extinguishers', quantityKg: 2.4635}]),
    buyRate: 0,
    currency: '$',
    clientQuote: 3223.00,
    profit: 3223.00,
    profitPercentage: '100.0',
    quoteSentBy: 'JOHN NDAYAMBAJE',
    status: 'won',
    followUpDate: '2024-12-18',
    remarks: 'Airfreight',
    createdAt: '2024-12-18T00:00:00.000Z',
    freightMode: 'Air Freight',
    cargoDescription: 'Fire Extinguishers: 3 pieces',
    requestType: 'Export',
    countryOfOrigin: 'RWANDA',
    destination: 'USA',
    totalVolumeKg: 2.4635
  }
];

// Note: These users should match the ones in AuthContext for consistency
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Action@AWC',
    email: 'n.solange@africaworldcargo.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    name: 'Director@AWC',
    email: 'i.arnold@africaworldcargo.com',
    role: 'sales_director',
    status: 'active',
    createdAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: '3',
    name: 'Agent@AWC',
    email: 'a.benon@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-02-15T00:00:00.000Z'
  },
  {
    id: '4',
    name: 'Agent2@AWC',
    email: 'n.mariemerci@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-01T00:00:00.000Z'
  },
  {
    id: '5',
    name: 'Finance@AWC',
    email: 'u.epiphanie@africaworldcargo.com',
    role: 'finance_officer',
    status: 'active',
    createdAt: '2024-03-05T00:00:00.000Z'
  },
  {
    id: '6',
    name: 'Partner@AWC',
    email: 'k.peter@africaworldcargo.com',
    role: 'partner',
    status: 'active',
    createdAt: '2024-03-10T00:00:00.000Z'
  },
  // Additional system users for quotations data consistency
  {
    id: '7',
    name: 'JOHN NDAYAMBAJE',
    email: 'john.ndayambaje@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-15T00:00:00.000Z'
  },
  {
    id: '8',
    name: 'RONNY TWAHIRWA',
    email: 'ronny.twahirwa@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-20T00:00:00.000Z'
  },
  {
    id: '9',
    name: 'ANDY NUMA',
    email: 'andy.numa@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-03-25T00:00:00.000Z'
  },
  {
    id: '10',
    name: 'Michel M. TSHIKALA',
    email: 'michel.tshikala@africaworldcargo.com',
    role: 'partner',
    status: 'active',
    createdAt: '2024-04-01T00:00:00.000Z'
  },
  {
    id: '11',
    name: 'PATRICK',
    email: 'patrick@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-04-05T00:00:00.000Z'
  },
  {
    id: '12',
    name: 'JAMES',
    email: 'james@africaworldcargo.com',
    role: 'sales_agent',
    status: 'active',
    createdAt: '2024-04-10T00:00:00.000Z'
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
  }
];
