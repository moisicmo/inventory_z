import { Prisma } from '@/generated/prisma/client';

export const TransferRequestSelectList = {
  id: true,
  status: true,
  note: true,
  rejectionNote: true,
  observationNote: true,
  active: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  dispatchedBy: true,
  dispatchedAt: true,
  receivedBy: true,
  receivedAt: true,
  fromBranch: { select: { id: true, name: true } },
  toBranch: { select: { id: true, name: true } },
  items: {
    select: {
      id: true,
      quantityRequested: true,
      quantityDispatched: true,
      typeUnit: true,
      price: true,
      detail: true,
      product: { select: { id: true, name: true, code: true } },
    },
  },
  _count: { select: { items: true } },
};

export type TransferRequestListType = Prisma.TransferRequestGetPayload<{
  select: typeof TransferRequestSelectList;
}>;
