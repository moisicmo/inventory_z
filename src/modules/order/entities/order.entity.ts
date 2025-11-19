import { BranchSelect } from "@/modules/branch/entities/branch.entity";
import { CustomerSelect } from "@/modules/customer/entities/customer.entity";
import { ProductSelect } from "@/modules/product/entities/product.entity";
import { StaffSelect } from "@/modules/staff/entities/staff.entity";
import { Prisma } from "@prisma/client";

export type OrderType = Prisma.OrderGetPayload<{
  select: typeof OrderSelect;
}>;


export const OutputSelect = {
  id: true,
  orderId: true,
  quantity: true,
  price: true,
  detail: true,
  createdAt: true,
  branch: { select: BranchSelect },
  product: { select: ProductSelect },
};

export const OrderSelect = {
  id: true,
  staff: { select: StaffSelect},
  customer: { select: CustomerSelect },
  branch: { select: BranchSelect },
  amount: true,
  active: true,
  updatedAt: true,
  createdAt: true,
  outputs: { select: OutputSelect },
};