import { Prisma } from '@/generated/prisma/client';

// ── Cuentas por pagar (installments) ────────────────────────────────────────
export const PayableSelect = {
  id: true,
  installmentNumber: true,
  amount: true,
  dueDate: true,
  paidAt: true,
  status: true,
  createdAt: true,
  purchase: {
    select: {
      id: true,
      code: true,
      totalAmount: true,
      provider: { select: { name: true } },
      branch: { select: { id: true, name: true } },
    },
  },
};

export type PayableType = Prisma.PurchaseInstallmentGetPayload<{
  select: typeof PayableSelect;
}>;

// Select para el listado (tabla de compras)
export type PurchaseListType = Prisma.PurchaseGetPayload<{
  select: typeof PurchaseSelectList;
}>;

export const PurchaseSelectList = {
  id: true,
  code: true,
  dischargeDate: true,
  paymentType: true,
  totalAmount: true,
  active: true,
  createdAt: true,
  createdBy: true,
  provider: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true } },
  inputs: {
    select: {
      product: { select: { name: true } },
      quantity: true,
      price: true,
      typeUnit: true,
      detail: true,
    },
  },
  _count: { select: { inputs: true, installments: true } },
};

export type PurchaseType = Prisma.PurchaseGetPayload<{
  select: typeof PurchaseSelect;
}>;

export const PurchaseSelect = {
  id: true,
  code: true,
  dischargeDate: true,
  paymentType: true,
  totalAmount: true,
  createdAt: true,
};

// Select completo para generar el PDF del comprobante
export type PurchaseFullType = Prisma.PurchaseGetPayload<{
  select: typeof PurchaseSelectFull;
}>;

export const PurchaseSelectFull = {
  id: true,
  code: true,
  dischargeDate: true,
  paymentType: true,
  totalAmount: true,
  createdAt: true,
  provider: { select: { name: true, nit: true } },
  branch: { select: { name: true } },
  inputs: {
    select: {
      product: { select: { name: true } },
      quantity: true,
      price: true,
      typeUnit: true,
    },
  },
  installments: {
    select: {
      installmentNumber: true,
      amount: true,
      dueDate: true,
    },
    orderBy: { installmentNumber: 'asc' as const },
  },
};
