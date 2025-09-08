// Real operational expense data for September 2025
export interface OperationalExpense {
  id: number;
  description: string;
  fixedCostPerMonth: number;
  operationCost: number;
  suppliers: number;
  urgent: number;
  dueDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  comment?: string;
  currency: 'RWF' | 'USD';
}

export interface ClientPayment {
  id: number;
  clientName: string;
  amountUSD: number;
  amountRWF: number;
  dueDate?: string;
  comment?: string;
  status: 'pending' | 'received';
}

export const operationalExpenses: OperationalExpense[] = [
  {
    id: 1,
    description: "Rental fees",
    fixedCostPerMonth: 1900000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 2,
    description: "Service charges",
    fixedCostPerMonth: 260000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 3,
    description: "August Salaries",
    fixedCostPerMonth: 4609387,
    operationCost: 0,
    suppliers: 0,
    urgent: 4609387,
    status: 'overdue',
    currency: 'RWF'
  },
  {
    id: 4,
    description: "August Staff welfare",
    fixedCostPerMonth: 1440614,
    operationCost: 0,
    suppliers: 0,
    urgent: 1440614,
    status: 'overdue',
    currency: 'RWF'
  },
  {
    id: 5,
    description: "September Salaries",
    fixedCostPerMonth: 4609387,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 6,
    description: "September Staff welfare",
    fixedCostPerMonth: 1440614,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 7,
    description: "Taxes (August)",
    fixedCostPerMonth: 2853026,
    operationCost: 0,
    suppliers: 0,
    urgent: 2853026,
    dueDate: "2025-08-15",
    status: 'overdue',
    comment: "Over due(15/8/2025)",
    currency: 'RWF'
  },
  {
    id: 8,
    description: "Taxes (September)",
    fixedCostPerMonth: 3925125,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    dueDate: "2025-09-15",
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 9,
    description: "Internet",
    fixedCostPerMonth: 0,
    operationCost: 115000,
    suppliers: 0,
    urgent: 0,
    dueDate: "2025-09-20",
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 10,
    description: "ALSM(August)",
    fixedCostPerMonth: 0,
    operationCost: 236000,
    suppliers: 236000,
    urgent: 236000,
    dueDate: "2025-08-15",
    status: 'overdue',
    comment: "Over due (15/8/2025)",
    currency: 'RWF'
  },
  {
    id: 11,
    description: "ALSM(September)",
    fixedCostPerMonth: 0,
    operationCost: 236000,
    suppliers: 0,
    urgent: 0,
    dueDate: "2025-09-15",
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 12,
    description: "Essence (M.D)",
    fixedCostPerMonth: 100000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'paid',
    comment: "Paid",
    currency: 'RWF'
  },
  {
    id: 13,
    description: "Car move",
    fixedCostPerMonth: 269200,
    operationCost: 0,
    suppliers: 0,
    urgent: 269200,
    status: 'overdue',
    comment: "Over due",
    currency: 'RWF'
  },
  {
    id: 14,
    description: "BWS",
    fixedCostPerMonth: 0,
    operationCost: 7121,
    suppliers: 0,
    urgent: 7121,
    dueDate: "2025-07-24",
    status: 'overdue',
    comment: "Over due( 24/7/2025)",
    currency: 'USD'
  },
  {
    id: 15,
    description: "Bond",
    fixedCostPerMonth: 0,
    operationCost: 1044,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'USD'
  },
  {
    id: 16,
    description: "Dedouanement(Be cool)",
    fixedCostPerMonth: 0,
    operationCost: 623000,
    suppliers: 0,
    urgent: 623000,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 17,
    description: "Be cool(Refund)",
    fixedCostPerMonth: 0,
    operationCost: 203300,
    suppliers: 0,
    urgent: 203300,
    comment: "125K+29k+41300+8000",
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 19,
    description: "Michel",
    fixedCostPerMonth: 0,
    operationCost: -2504.74,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'USD'
  },
  {
    id: 20,
    description: "Rodon Global South Africa",
    fixedCostPerMonth: 0,
    operationCost: 1377.99,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'USD'
  },
  {
    id: 21,
    description: "KARU BUSINESS GROUP LTD",
    fixedCostPerMonth: 0,
    operationCost: 7000,
    suppliers: 7000,
    urgent: 0,
    status: 'pending',
    currency: 'USD'
  },
  {
    id: 22,
    description: "Umutekano",
    fixedCostPerMonth: 5000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 23,
    description: "WASAC",
    fixedCostPerMonth: 29716,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 24,
    description: "Electricity",
    fixedCostPerMonth: 100000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  },
  {
    id: 25,
    description: "Dan",
    fixedCostPerMonth: 100000,
    operationCost: 0,
    suppliers: 0,
    urgent: 0,
    status: 'pending',
    currency: 'RWF'
  }
];

export const pendingClientPayments: ClientPayment[] = [
  {
    id: 1,
    clientName: "OKAT BJ Logistics",
    amountUSD: 37,
    amountRWF: 0,
    status: 'pending'
  },
  {
    id: 2,
    clientName: "REMOTE PARTNERS(Invoice 55)",
    amountUSD: 8000,
    amountRWF: 0,
    status: 'pending'
  }
];

// Summary totals
export const expenseSummary = {
  totalRWF: 21642069,
  totalUSD: 7221,
  suppliersRWF: 587000,
  urgentRWF: 10234527,
  pendingClientPaymentsUSD: 8037
};

// Exchange rate for calculations (approximate)
export const USD_TO_RWF_RATE = 1320;

// Helper functions
export const getTotalExpensesInUSD = () => {
  const rwfInUSD = expenseSummary.totalRWF / USD_TO_RWF_RATE;
  return rwfInUSD + expenseSummary.totalUSD;
};

export const getUrgentPaymentsInUSD = () => {
  const urgentRWFInUSD = expenseSummary.urgentRWF / USD_TO_RWF_RATE;
  const urgentUSD = operationalExpenses
    .filter(expense => expense.urgent > 0 && expense.currency === 'USD')
    .reduce((sum, expense) => sum + expense.urgent, 0);
  return urgentRWFInUSD + urgentUSD;
};

export const getOverdueExpenses = () => {
  return operationalExpenses.filter(expense => expense.status === 'overdue');
};

export const getCashFlowProjection = () => {
  const totalExpenses = getTotalExpensesInUSD();
  const expectedReceivables = expenseSummary.pendingClientPaymentsUSD;
  return expectedReceivables - totalExpenses;
};