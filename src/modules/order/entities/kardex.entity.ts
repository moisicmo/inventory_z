import { BranchEntity } from "@/modules/branch/entities/branch.entity";
import { CustomerEntity } from "@/modules/customer/entities/customer.entity";
import { ProductPresentationEntity } from "@/modules/productPresentation/entities/product-presentation.entity";
import { StaffEntity } from "@/modules/staff/entities/staff.entity";
import { Prisma } from "@prisma/client";

export const OutputEntity = {
  id: true,
  branchId: true,
  orderId: true,
  productPresentationId: true,
  quantity: true,
  price: true,
  detail: true,
  createdAt: true,
  branch: { select: BranchEntity },
  productPresentation: { select: ProductPresentationEntity },
};

export const OrderEntity = {
  id: true,
  staff: { select: StaffEntity},
  customer: { select: CustomerEntity },
  branch: { select: BranchEntity },
  amount: true,
  active: true,
  updatedAt: true,
  createdAt: true,
  outputs: { select: OutputEntity },
};



export type OrderType = Prisma.OrderGetPayload<{
  select: typeof OrderEntity;
}>;