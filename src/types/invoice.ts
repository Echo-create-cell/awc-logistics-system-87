export interface InvoiceItem {
  id: string;
  quantityKg: number;
  commodity: string;
  description: string;
  price: number;
  total: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  quotationId: string;
  quotationData?: import('@/types').Quotation; // For prefilling from quotation
  clientName: string;
  clientAddress: string;
  clientTin: string;
  destination: string;
  doorDelivery: string;
  salesperson: string;
  deliverDate: string;
  paymentConditions: string;
  validityDate: string;
  awbNumber: string;
  items: InvoiceItem[];
  subTotal: number;
  tva: number;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  tinNumber: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
}
