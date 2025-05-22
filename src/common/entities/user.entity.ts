import { CustomerEntity } from '@/modules/customer/entities/customer.entity';
import { StaffEntity } from '@/modules/staff/entities/staff.entity';

export const UserEntity = {
  id: true,
  numberDocument: true,
  typeDocument: true,
  name: true,
  lastName: true,
  email: true,
  staff: {
    select: StaffEntity
  },
  customer: {
    select: CustomerEntity
  }
};