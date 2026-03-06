import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { MethodPay } from '@/generated/prisma/enums';

export class CreateSalePaymentDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsEnum(MethodPay)
  @IsOptional()
  payMethod?: MethodPay;

  @IsString()
  @IsOptional()
  notes?: string;
}
